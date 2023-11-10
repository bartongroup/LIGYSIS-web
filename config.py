import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FOLDER = os.path.join(BASE_DIR, "static", "data")
#DATA_FOLDER = "/cluster/gjb_lab/2394007/LIGYSIS_PDB"

BIOLIP_FOLDER = os.path.join(DATA_FOLDER, "biolip", "1500accs")
# BIOLIP_FOLDER = DATA_FOLDER # IN CLUSTER

SPLIT_FOLDER = os.path.join(DATA_FOLDER, "biolip", "split")
# SPLIT_FOLDER = DATA_FOLDER # IN CLUSTER

SITE_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "site_tables")
#SITE_TABLES_FOLDER = os.path.join(DATA_FOLDER, "site_tables") # IN CLUSTER

RES_TABLES_FOLDER = os.path.join(SPLIT_FOLDER, "res_tables")
#RES_TABLES_FOLDER = os.path.join(DATA_FOLDER, "res_tables") # IN CLUSTER

REP_STRUCS_FOLDER = os.path.join(SPLIT_FOLDER, "segment_rep_dicts")
#REP_STRUCS_FOLDER = os.path.join(DATA_FOLDER, "segment_rep_dicts") # IN CLUSTER

BS_RESS_FOLDER = os.path.join(SPLIT_FOLDER, "bs_ress_dicts")
#BS_RESS_FOLDER = os.path.join(DATA_FOLDER, "bs_ress_dicts") # IN CLUSTER

MAPPINGS_FOLDER = os.path.join(SPLIT_FOLDER, "mappings")
#MAPPINGS_FOLDER = os.path.join(DATA_FOLDER, "mappings") # IN CLUSTER

STATS_FOLDER = os.path.join(SPLIT_FOLDER, "sum_stats")
#STATS_FOLDER = os.path.join(DATA_FOLDER, "sum_stats") # IN CLUSTER

ENTRY_NAMES_FOLDER = os.path.join(SPLIT_FOLDER, "entry_names")
#ENTRY_NAMES_FOLDER = os.path.join(DATA_FOLDER, "entry_names") # IN CLUSTER
