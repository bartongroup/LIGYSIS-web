import re
from datetime import datetime

def is_valid_session_id(session_id):
    # Validate session ID using a regular expression
    # Return True if session_id is valid, False otherwise
    return re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', session_id) is not None

def is_valid_submission_time(submission_time):
    # Validate submission time as a datetime string in the format %Y%m%d%H%M%S
    # Return True if submission_time is valid, False otherwise
    try:
        datetime.strptime(submission_time, '%Y%m%d%H%M%S')
        return True
    except ValueError:
        return False
