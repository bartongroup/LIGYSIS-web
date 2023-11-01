import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FOLDER = os.path.join(BASE_DIR, "static", "data")
#DATA_FOLDER = os.environ.get("APP_DATA_FOLDER", DATA_FOLDER)

BIOLIP_FOLDER = os.path.join(DATA_FOLDER, "biolip", "1500accs")

SPLIT_FOLDER = os.path.join(DATA_FOLDER, "biolip", "split")

SITE_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "site_tables")

RES_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "res_tables")

REP_STRUCS_FOLDER = os.path.join(SPLIT_FOLDER, "segment_rep_dicts")

BS_RESS_FOLDER = os.path.join(SPLIT_FOLDER, "bs_ress_dicts")

MAPPINGS_FOLDER = os.path.join(SPLIT_FOLDER, "mappings")

STATS_FOLDER = os.path.join(SPLIT_FOLDER, "sum_stats")

ENTRY_NAMES_FOLDER = os.path.join(SPLIT_FOLDER, "entry_names")
