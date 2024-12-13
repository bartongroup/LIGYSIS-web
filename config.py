import os

# Configure the app URL prefix
URL_PREFIX = os.environ.get('URL_PREFIX', '/ligysis')
STATIC_URL_PATH = f"{URL_PREFIX}/static"

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # VALID FOR ALL (UNUSED IN CLUSTER)

# DATA_FOLDER = os.path.join(BASE_DIR, "static", "data") # IN LOCAL & EXAMPLE
DATA_FOLDER = "/Volumes/2394007/LIGYSIS_PDB/" # IN LOCAL (after connecting with SAMBA to /cluster/gjb_lab/2394007)
#DATA_FOLDER = "/cluster/gjb_lab/2394007/LIGYSIS_PDB" # IN CLUSTER

# SPLIT_FOLDER = BIOLIP_FOLDER # IN EXAMPLE
# SPLIT_FOLDER = os.path.join(DATA_FOLDER, "biolip", "split") # IN LOCAL
# SPLIT_FOLDER = DATA_FOLDER # IN CLUSTER

ASSEMBLY_FOLDER = os.path.join(DATA_FOLDER, "data", "structures", "assembly") # IN EXAMPLE & CLUSTER
CIF_SIFTS_DIR = os.path.join(DATA_FOLDER, "data", "cif_sifts") # IN CLUSTER
CHAIN_MAPPING_DIR = os.path.join(DATA_FOLDER, "data", "chain_remapping") # IN CLUSTER

PROTS_FOLDER = os.path.join(DATA_FOLDER, "output_V2") # IN EXAMPLE & LOCAL

# SITE_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "site_tables") # IN EXAMPLE & LOCAL
SITE_TABLES_FOLDER = os.path.join(DATA_FOLDER, "site_tables") # IN CLUSTER
#SITE_TABLES_FOLDER = os.path.join(DATA_FOLDER, "site_tables") # IN CLUSTER

# RES_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "res_tables") # IN EXAMPLE & LOCAL
RES_TABLES_FOLDER = os.path.join(DATA_FOLDER,  "res_tables") # IN CLUSTER
#RES_TABLES_FOLDER = os.path.join(DATA_FOLDER, "res_tables") # IN CLUSTER

# REP_STRUCS_FOLDER = os.path.join(SPLIT_FOLDER, "segment_rep_dicts") # IN EXAMPLE & LOCAL
REP_STRUCS_FOLDER = os.path.join(DATA_FOLDER,  "segment_coords")
#REP_STRUCS_FOLDER = os.path.join(DATA_FOLDER, "segment_rep_dicts") # IN CLUSTER

# USER_JOBS_FOLDER = os.path.join(BASE_DIR, "static", "data", "USER_JOBS") # THIS WILL NEED TO CHANGE WHEN MOVED TO CLUSTER
USER_JOBS_FOLDER = os.path.join(DATA_FOLDER, "USER_JOBS") # THIS WILL NEED TO CHANGE WHEN MOVED TO CLUSTER

USER_JOBS_IN_FOLDER = os.path.join(USER_JOBS_FOLDER, "IN") # THIS WILL NEED TO CHANGE WHEN MOVED TO CLUSTER

USER_JOBS_OUT_FOLDER = os.path.join(USER_JOBS_FOLDER, "OUT") # THIS WILL NEED TO CHANGE WHEN MOVED TO CLUSTER

# Config for users submission handling
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SESSIONS_FOLDER = os.path.join(BASE_DIR, 'sessions')
SESSIONS_FOLDER = os.environ.get('APP_SESSIONS_PATH', SESSIONS_FOLDER)

# Add logging level and path configuration
LOG_LEVEL = os.environ.get('APP_LOG_LEVEL', 'INFO').upper()
LOG_PATH = os.path.join(BASE_DIR, 'logs')
LOG_PATH = os.environ.get('APP_LOG_PATH', LOG_PATH)

DATABASE_PATH = os.path.join(BASE_DIR, 'db', 'session.sqlite')
DATABASE_PATH = os.environ.get('APP_DATABASE_PATH', DATABASE_PATH)

SLIVKA_URL = os.environ.get('SLIVKA_URL', 'http://localhost:3203')
EXPIRATION_DAYS = float(os.environ.get('APP_EXPIRATION_DAYS', 7))
