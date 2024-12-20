import tarfile
from datetime import datetime, timedelta
from time import sleep

import os

from werkzeug.utils import secure_filename

from gevent.event import Event
from slivka_client import SlivkaClient
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential
from requests.exceptions import RequestException, HTTPError, ConnectionError, Timeout

from config import SESSIONS_FOLDER, SLIVKA_URL, EXPIRATION_DAYS
from logger_config import setup_logging
from session_db import insert_metadata, update_status, update_slivka_id

custom_logger = setup_logging(name='submission')

class SubmissionHandler:
    """Handles FASTA file submissions and associated processing."""

    def __init__(self, session_id, form, service_type, config=None, tar_upload=False):
        """Initialize a SubmissionHandler instance.

        Args:
            session_id (str): Unique identifier for the submission session.
            form (FlaskForm): Form object containing the submission details.
            service_type (str): Type of service to use for processing.
            config (dict): Optional configuration dictionary.
            tar_upload (bool): Flag indicating if the upload is a tar file.
        """
        self.session_id = session_id
        self.form = form
        self.service_type = service_type
        self.config = config or {}
        self.tar_upload = tar_upload
        self.submission_time = datetime.now()
        self.session_directory = self.create_directory()
        self.submission_directory = self.create_submission_directory()
        self.filename = None
        self.file_path = None
        self.metadata_available = Event()  # Create an event to signal metadata availability
        self.slivka_job_triggered = Event()  # Create an event to signal Slivka job submission

    def create_directory(self):
        """Create a directory for the submission session.

        Returns:
            str: The path to the created directory.
        """
        session_directory = os.path.join(SESSIONS_FOLDER, self.session_id)
        os.makedirs(session_directory, exist_ok=True)
        custom_logger.debug(f"Directory created for session {self.session_id}.")
        return session_directory
    
    def create_submission_directory(self):
        """Create a unique directory for each submission."""
        timestamp = self.submission_time.strftime('%Y%m%d%H%M%S')
        submission_directory = os.path.join(self.session_directory, f"{timestamp}")
        os.makedirs(submission_directory, exist_ok=True)
        custom_logger.debug(f"Directory created for submission {self.session_id}/{timestamp}.")
        return submission_directory
    
    def save_submission_data(self):
        """Save the uploaded data."""
        if self.tar_upload:
            self.file_path = os.path.join(self.submission_directory, 'submission.tar.gz')
            self.filename = 'submission.tar.gz'
            self.save_and_tar_files()
        else:
            self.save_sequence()

    def save_and_tar_files(self):
        """Save and tar the uploaded FASTA files."""
        with tarfile.open(self.file_path, "w:gz") as tar:
            for file in self.form.files.data:
                filename = secure_filename(file.filename)
                file_path = os.path.join(self.submission_directory, filename)
                file.save(file_path)
                tar.add(file_path, arcname=filename)
        custom_logger.info(f"Uploaded files saved and tarred for session {self.session_id}.")

    def save_sequence(self):
        """Save the uploaded FASTA file or the input sequence."""
        if self.form.fasta_file.data:
            self.filename = self.form.fasta_file.data.filename
            self.file_path = os.path.join(self.submission_directory, self.filename)
            self.form.fasta_file.data.save(self.file_path)
        else:
            self.filename = 'sequence.fasta'
            self.file_path = os.path.join(self.submission_directory, self.filename)
            with open(self.file_path, 'w') as f:
                f.write(self.form.sequence.data)
        custom_logger.info(f"FASTA data saved for session {self.session_id}.")

    def store_submission_metadata(self):
        """Insert metadata related to the submission into the database."""
        expiration_time = (self.submission_time + timedelta(days=EXPIRATION_DAYS)).strftime('%Y-%m-%d %H:%M:%S')
        # TODO: output.fasta should be replaced with an actual output file name or some other meaningful result or ID
        self.entry_id = insert_metadata(self.session_id, self.filename, 'output.fasta', self.submission_time.strftime('%Y-%m-%d %H:%M:%S'), 'uploaded', expiration_time)
        self.metadata_available.set()  # Signal that metadata is available
        custom_logger.info(f"Metadata inserted into database for session {self.session_id}.")

    def read_cached_submission(self):
        """Read the saved submission file.

        Returns:
            str or bytes: The content of the submission file.
        """
        if self.file_path.endswith(('.tar', '.tar.gz', '.tgz')):
            mode = 'rb'
        else:
            mode = 'r'
        
        with open(self.file_path, mode) as f:
            return f.read()

    def process_and_save_results(self, fasta_content):
        """Process the FASTA file content and save the results."""
        processor = SlivkaProcessor(SLIVKA_URL, service=self.service_type, session_id=self.session_id, filename=self.filename, entry_id=self.entry_id, config=self.config)
        output_file_path = os.path.join(self.submission_directory, 'output.fasta')
        success = processor.process_file(self.file_path, output_file_path, self.submission_directory, trigger_event=self.slivka_job_triggered)

    def update_db_status(self):
        """Update the processing status in the database."""
        update_status(self.entry_id, "Ready")
        custom_logger.info(f"Status updated for session {self.session_id}.")

    def handle_submission(self):
        """Handle the submission by orchestrating the various steps.

        Returns:
            dict: A dictionary containing the status, message, and other details of the submission.
        """
        result = {'status': 'failed', 'message': '', 'filename': None}

        try:
            self.save_submission_data()
            self.store_submission_metadata()
            fasta_content = self.read_cached_submission()
            self.process_and_save_results(fasta_content)
            self.update_db_status()
            result.update({
                'status': 'success',
                'message': 'File processed successfully.',
                'directory': self.session_directory,
                'filename': self.filename
            })
        except Exception as e:
            custom_logger.error(f"An error occurred while handling submission for session {self.session_id}: {str(e)}")
            result['status'] = 'failed'
            result['message'] = str(e)
        
        return result

    
class SlivkaProcessor:
    """Handles the processing of FASTA files using Slivka."""

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(min=1, max=10), retry=retry_if_exception_type((RequestException, HTTPError, ConnectionError, Timeout)))
    def __init__(self, slivka_url, service, session_id, filename, entry_id, config=None):
        self.client = SlivkaClient(slivka_url)
        self.service = self.client[service]
        self.session_id = session_id
        self.filename = filename
        self.entry_id = entry_id
        self.config = config or {}

    def process_file(self, input_file_path, output_file_path, submission_directory, trigger_event=None):
        """Process the given FASTA file using Slivka.

        Args:
            input_file_path (str): The path to the input FASTA file.
            output_file_path (str): The path where the output should be saved.

        Returns:
            bool: True if processing was successful, False otherwise.
        """
        try:
            custom_logger.info(f"Starting file processing for session {self.session_id}.")
            custom_logger.debug(f"Input file path: {input_file_path}")
            custom_logger.debug(f"Output file path: {output_file_path}")
            custom_logger.debug(f"Submission directory: {submission_directory}")

            # Open the FASTA file and set the media type
            with open(input_file_path, 'rb') as file_object:
                media_type = 'application/fasta'

                # Submit the job to Slivka 
                job = self.submit_job_to_slivka(file_object, media_type)
                if trigger_event:
                    trigger_event.set()

                # Wait for the job to complete
                self.wait_for_job_completion(job)

                # TODO: Handle job failure
                # TODO: Download could be done on demand when the user requests the results...
                # Download the job results
                self.download_job_results(job, submission_directory)
                custom_logger.info(f"File processing completed successfully for session {self.session_id}.")
                return True
        except FileNotFoundError as e:
            custom_logger.error(f"File not found: {e.filename}")
            custom_logger.error(f"An error occurred while processing the submission: {str(e)}")
            return False
        except Exception as e:
            custom_logger.error(f"An unexpected error occurred while processing the submission: {str(e)}")
            return False

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(min=1, max=10), retry=retry_if_exception_type((RequestException, HTTPError, ConnectionError, Timeout)))
    def submit_job_to_slivka(self, file_object, media_type):
        """Submit the given file to Slivka for processing with retries on failure.

        Args:
            file_object (file): The file object to submit.
            media_type (str): The media type of the file.

        Returns:
            SlivkaJob: The job object representing the submitted job.
        """
        data = self.config
        file_key = data.pop('file_key_override', 'input')

        # Create the 'files' dictionary with the correct format
        files = {
            file_key: (os.path.basename(file_object.name), file_object, media_type)
        }

        # Submit the job to Slivka
        job = self.service.submit_job(data=data, files=files)
        custom_logger.info(f"Job submitted: {job.id}")

        # Update the slivka_id in the database
        update_slivka_id(self.entry_id, job.id)

        return job

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(min=1, max=10), retry=retry_if_exception_type((RequestException, HTTPError, ConnectionError, Timeout)))
    def wait_for_job_completion(self, job):
        """Wait for the given job to complete.

        Args:
            job (SlivkaJob): The job object representing the submitted job.
        """
        last_status = None
        # Wait for the job to complete
        while job.status not in ('COMPLETED', 'FAILED'):
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            custom_logger.info(f"Polling job status at {current_time}... (Status: {job.status})")
            
            if job.status != last_status:
                update_status(self.entry_id, job.status)
                last_status = job.status
            
            sleep(3)  # Polling interval

        # Update the status one last time after the loop ends
        update_status(self.entry_id, job.status)
        custom_logger.info(f"Completion Time: {job.completion_time}")

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(min=1, max=10), retry=retry_if_exception_type((RequestException, HTTPError, ConnectionError, Timeout)))
    def download_job_results(self, job, subbmission_directory):
        """Download the results of the given job to the specified directory.

        Args:
            job (SlivkaJob): The job object representing the completed job.
            submission_directory (str): The directory where the results should be saved.
        """
        # TODO: Ensure retires are handled at correct level (ie. per file?) or ensure downloads are idempotent
        # Download each file in the job results
        for file in job.files:
            try:
                # TODO: Explore optimizing the local path
                local_path = os.path.join(subbmission_directory, *(file.id.split('/')[1:]))
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                file.dump(local_path)
                custom_logger.info(f"File {file.id} downloaded to {local_path}")
            except Exception as e:
                custom_logger.error(f"An error occurred while downloading file {file.id}: {str(e)}")
                raise
