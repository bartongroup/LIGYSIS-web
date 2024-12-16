from datetime import datetime

def datetime_parse(value, format='%Y-%m-%d %H:%M:%S'):
    """Convert a datetime string into a datetime object."""
    return datetime.strptime(value, format)

def datetime_format(value, format='%Y%m%d%H%M%S'):
    """Convert a datetime object into a datetime string."""
    return value.strftime(format)