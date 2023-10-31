### PACKAGE IMPORTS ###

import os
import pickle
import numpy as np
import pandas as pd

from flask import Flask, render_template, url_for, request, redirect, jsonify

from config import DATA_FOLDER, BIOLIP_FOLDER, SITE_TABLES_FOLDER, RES_TABLES_FOLDER, REP_STRUCS_FOLDER, BS_RESS_FOLDER, MAPPINGS_FOLDER, STATS_FOLDER

### FUNCTIONS ###

def load_pickle(f_in):
    """
    Loads data from pickle.
    """
    with open(f_in, "rb") as f:
        data = pickle.load(f)
    return data

def convert_numpy(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy(v) for v in obj]
    return obj

### READING INPUT DATA ###

prot_ids = load_pickle(os.path.join(BIOLIP_FOLDER, "biolip_up_ids_15000_accs.pkl")) # protein ids

### SOME FIXED VARIABLES ###

colors = load_pickle(os.path.join(DATA_FOLDER, "sample_colors_hex.pkl")) # sample colors

headings = ["ID", "RSA", "DS", "MES", "Size"]

cc_new = ["UPResNum", "MSACol", "DS", "MES", "p", "AA", "RSA", "SS"]

bs_table_tooltips = [
    "This is the ligand binding site identifier",
    "This is the site's avg. RSA",
    "This is the site's avg. divergence score",
    "This is the site's avg. missense enrichment score",
    "This is the site's size (in aa)",
]

bs_ress_table_tooltips = [
    "This is the residue's UniProt number",
    "This is the residue's alignment column",
    "This is the residue's divergence score",
    "This is the residue's missense enrichment score",
    "This is the MES p-value",
    "This is the residue's amino acid",
    "This is the residue's RSA",
    "This is the residue's secondary structure",
]

#### FLASK APP ###

app = Flask(__name__)
    
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':

        prot_id = request.form['proteinId']

        if prot_id in prot_ids:

            prot_seg_rep_strucs = load_pickle(os.path.join(REP_STRUCS_FOLDER, "{}_segs_rep_strucs.pkl".format(prot_id))) # representative structures dict (only successfully run segments)

            first_seg = sorted(list(prot_seg_rep_strucs[prot_id].keys()))[0]

            return redirect(url_for('results', prot_id = prot_id, seg_id = first_seg)) # renders results page
        else:
            return render_template('error.html', prot_id = prot_id)

    else:
        return render_template('index.html', prot_ids = prot_ids) # renders home page with all tasks

@app.route('/results/<prot_id>/<seg_id>', methods = ['POST', 'GET'])
def results(prot_id, seg_id):

    seg_name = prot_id + "_" + seg_id

    bss_data = pd.read_pickle(os.path.join(SITE_TABLES_FOLDER, "{}_bss.pkl".format(prot_id))) # site data
    bss_data = bss_data.fillna("NaN") # pre-processing could also be done before saving the pickle
    bss_data.columns = headings

    # print(bss_data.shape)

    bss_prot = bss_data[bss_data.ID.str.contains(seg_name)].copy()

    # grab only third element of ID column
    bss_prot.ID = bss_prot.ID.str.split("_").str[2]

    bss_prot.ID = bss_prot.ID.astype(int)

    bss_prot = bss_prot.sort_values(by = "ID")

    first_site = bss_prot.ID.unique().tolist()[0]

    first_site_name = seg_name + "_" + str(first_site)

    bss_ress = pd.read_pickle(os.path.join(RES_TABLES_FOLDER, "{}_ress.pkl".format(seg_name))) # residue data
    bss_ress = bss_ress.fillna("NaN") # pre-processing could also be done before saving the pickle

    # print(bss_ress.shape)

    first_site_data = bss_ress.query('bs_id == @first_site_name')[cc_new].to_dict(orient="list")

    print(bss_prot)

    data1 = bss_prot.to_dict(orient="list")

    print(data1)

    prot_ress = bss_ress.query('up_acc == @prot_id')[cc_new]

    prot_seg_rep_strucs = load_pickle(os.path.join(REP_STRUCS_FOLDER, "{}_segs_rep_strucs.pkl".format(prot_id))) # representative structures dict (only successfully run segments)

    segment_reps = prot_seg_rep_strucs[prot_id]

    # segment_reps = dict(sorted(segment_reps.items())) # should not be necessary since I sorted it beforehand

    data2 = prot_ress.to_dict(orient="list")

    bs_ress_dict = load_pickle(os.path.join(BS_RESS_FOLDER, "{}_bs_ress.pkl".format(prot_id)))

    seg_ress_dict = bs_ress_dict[prot_id][seg_id]
    seg_ress_dict = {str(key): value for key, value in seg_ress_dict.items()}

    pdb2up_dict = load_pickle(os.path.join(MAPPINGS_FOLDER, "pdb2up", "{}_pdb2up_mapping.pkl".format(segment_reps[int(seg_id)]["rep"])))

    up2pdb_dict = load_pickle(os.path.join(MAPPINGS_FOLDER, "up2pdb", "{}_up2pdb_mapping.pkl".format(segment_reps[int(seg_id)]["rep"])))

    seg_stats = load_pickle(os.path.join(STATS_FOLDER, "{}_stats.pkl".format(seg_name)))

    # for v in seg_stats[prot_id][seg_id].values():
    #     v = int(v)
    
    seg_stats_converted = convert_numpy(seg_stats)

    up2pdb_dict_converted = {k: {k2:{int(k3):int(v3) for k3, v3 in v2.items()} for k2, v2 in v.items()} for k, v in up2pdb_dict.items()}

    pdb2up_dict_converted = {k: {k2:{int(k3):int(v3) for k3, v3 in v2.items()} for k2, v2 in v.items()} for k, v in pdb2up_dict.items()}
    
    return render_template(
        'structure.html', data = data1, headings = headings, data2 = data2, cc_new = cc_new, colors = colors,
        seg_ress_dict = seg_ress_dict, prot_id = prot_id, seg_id = seg_id, segment_reps = segment_reps,
        first_site_data = first_site_data, bs_table_tooltips = bs_table_tooltips, bs_ress_table_tooltips = bs_ress_table_tooltips,
        pdb2up_dict = pdb2up_dict_converted, up2pdb_dict = up2pdb_dict_converted, seg_stats = seg_stats_converted
    )

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/help')
def help():
    return render_template('help.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/get_table', methods=['POST'])
def get_table():

    lab = request.json.get('label', None)

    prot_id, seg_id, _ = lab.split("_")

    seg_name = prot_id + "_" + seg_id

    seg_ress = pd.read_pickle(os.path.join(RES_TABLES_FOLDER, "{}_ress.pkl".format(seg_name))) # residue data

    seg_ress = seg_ress.fillna("NaN") # pre-processing could also be done before saving the pickle

    site_ress = seg_ress.query('bs_id == @lab')[cc_new]

    site_data = site_ress.to_dict(orient="list")

    #print(site_data)

    return jsonify(site_data)

### LAUNCHING SERVER ###

if __name__ == "__main__":
    app.run(port = 9000, debug = True)
    
# the end