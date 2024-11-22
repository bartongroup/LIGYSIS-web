# logger_config.py

import logging
from logging.handlers import RotatingFileHandler
import os

from config import LOG_PATH

def setup_logging(name='custom'):
    # Ensure the logs directory exists
    if not os.path.exists(LOG_PATH):
        os.makedirs(LOG_PATH)
    
    log_file = os.path.join(LOG_PATH, 'app.log')
    
    # Set up log formatting
    formatter = logging.Formatter('[%(asctime)s] {%(pathname)s:%(lineno)d} %(levelname)s - %(name)s - %(message)s')

    # Set up log rotation for custom logger
    custom_handler = RotatingFileHandler(log_file, maxBytes=1_000_000, backupCount=5)
    custom_handler.setFormatter(formatter)

    # Custom logger
    custom_logger = logging.getLogger(name)
    custom_logger.setLevel(logging.INFO)
    custom_logger.addHandler(custom_handler)
    
    # Set up log rotation for werkzeug logger if the name is 'app'
    if name == 'app':
        werkzeug_handler = RotatingFileHandler(os.path.join(LOG_PATH, 'werkzeug.log'), maxBytes=1_000_000, backupCount=5)
        werkzeug_handler.setFormatter(formatter)

        werkzeug_logger = logging.getLogger('werkzeug')
        werkzeug_logger.setLevel(logging.INFO)
        werkzeug_logger.addHandler(werkzeug_handler)

    return custom_logger
