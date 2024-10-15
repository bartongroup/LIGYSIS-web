import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # VALID FOR ALL (UNUSED IN CLUSTER)

DATA_FOLDER = os.path.join(BASE_DIR, "static", "data") # IN LOCAL & EXAMPLE
#DATA_FOLDER = "/cluster/gjb_lab/2394007/LIGYSIS_PDB" # IN CLUSTER

# BIOLIP_FOLDER = os.path.join(DATA_FOLDER, "example") # IN EXAMPLE
# BIOLIP_FOLDER = os.path.join(DATA_FOLDER, "biolip", "1500accs") # IN LOCAL
# BIOLIP_FOLDER = DATA_FOLDER # IN CLUSTER

# SPLIT_FOLDER = BIOLIP_FOLDER # IN EXAMPLE
SPLIT_FOLDER = os.path.join(DATA_FOLDER, "biolip", "split") # IN LOCAL
# SPLIT_FOLDER = DATA_FOLDER # IN CLUSTER

SITE_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "site_tables") # IN EXAMPLE & LOCAL
#SITE_TABLES_FOLDER = os.path.join(DATA_FOLDER, "site_tables") # IN CLUSTER

RES_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "res_tables") # IN EXAMPLE & LOCAL
#RES_TABLES_FOLDER = os.path.join(DATA_FOLDER, "res_tables") # IN CLUSTER

REP_STRUCS_FOLDER = os.path.join(SPLIT_FOLDER, "segment_rep_dicts") # IN EXAMPLE & LOCAL
#REP_STRUCS_FOLDER = os.path.join(DATA_FOLDER, "segment_rep_dicts") # IN CLUSTER

BS_RESS_FOLDER = os.path.join(SPLIT_FOLDER, "bs_ress_dicts") # IN EXAMPLE & LOCAL 
#BS_RESS_FOLDER = os.path.join(DATA_FOLDER, "bs_ress_dicts") # IN CLUSTER

MAPPINGS_FOLDER = os.path.join(SPLIT_FOLDER, "mappings") # IN EXAMPLE & LOCAL
#MAPPINGS_FOLDER = os.path.join(DATA_FOLDER, "mappings") # IN CLUSTER

STATS_FOLDER = os.path.join(SPLIT_FOLDER, "sum_stats") # IN EXAMPLE & LOCAL
#STATS_FOLDER = os.path.join(DATA_FOLDER, "sum_stats") # IN CLUSTER

ENTRY_NAMES_FOLDER = os.path.join(SPLIT_FOLDER, "entry_names") # IN EXAMPLE & LOCAL
#ENTRY_NAMES_FOLDER = os.path.join(DATA_FOLDER, "entry_names") # IN CLUSTER

USER_JOBS_FOLDER = os.path.join(DATA_FOLDER, "USER_JOBS") # IN EXAMPLE

USER_JOBS_IN_FOLDER = os.path.join(USER_JOBS_FOLDER, "IN") # IN EXAMPLE

USER_JOBS_OUT_FOLDER = os.path.join(USER_JOBS_FOLDER, "OUT") # IN EXAMPLE