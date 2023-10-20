### PACKAGE IMPORTS ###

import os
import pickle
import pandas as pd

from flask import Flask, render_template, url_for, request, redirect, jsonify

from config import DATA_FOLDER, BIOLIP_FOLDER

### FUNCTIONS ###

def load_pickle(f_in):
    """
    Loads data from pickle.
    """
    with open(f_in, "rb") as f:
        data = pickle.load(f)
    return data

### READING INPUT DATA ###

bss_data = pd.read_pickle(os.path.join(BIOLIP_FOLDER, "biolip_bss_data_100_accs.pkl"))

bss_ress = pd.read_pickle(os.path.join(BIOLIP_FOLDER, "biolip_ress_data_100_accs.pkl"))

prot_ids = load_pickle(os.path.join(BIOLIP_FOLDER, "biolip_100_accs.pkl"))

prot_seg_rep_strucs = load_pickle(os.path.join(BIOLIP_FOLDER, "biolip_prot_seg_rep_filt_100_acc.pkl"))

#good_segs_dict = pd.read_csv(os.path.join(BIOLIP_FOLDER, "biolip_good_segs_dict_100_accs.csv"))

#print(good_segs[:5])

### FORMATTING DATA ###

bss_ress = bss_ress.explode("binding_sites")
bss_ress["bs_id"] = bss_ress.up_acc + "_" + bss_ress.seg_id.astype(str) + "_" + bss_ress.binding_sites.astype(str)
bss_ress.UniProt_ResNum = bss_ress.UniProt_ResNum.astype(int)
bss_ress = bss_ress.drop_duplicates(["up_acc", "seg_id", "binding_sites", "UniProt_ResNum"]) # drop duplicate residues within the binding site

bs_ress_dict = load_pickle(os.path.join(BIOLIP_FOLDER, "biolip_bs_ress_100_accs2.pkl"))

### SOME FIXED VARIABLES ###

colors = load_pickle(os.path.join(DATA_FOLDER, "sample_colors_hex.pkl"))

headings = bss_data.columns.tolist()

#data_prots = [el.split("_") for el in bss_data.lab.unique().tolist()]

cc = [
    'UniProt_ResNum', 'alignment_column', 'abs_norm_shenkin',
    'oddsratio', 'pvalue', 'AA', 'RSA', 'SS'
]

bs_table_tooltips = [
    "This is the ligand binding site identifier",
    "This is the site's avg. RSA",
    "This is the site's avg. divergence score",
    "This is the site's avg. missense enrichment score",
    "This is the site's size (in aa)",
]


#### FLASK APP ###

app = Flask(__name__)
    
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':

        prot_id = request.form['proteinId']

        if prot_id in prot_ids:

            first_seg = sorted(list(prot_seg_rep_strucs[prot_id].keys()))[0]

            #print(first_seg)

            return redirect(url_for('results', prot_id = prot_id, seg_id = first_seg)) # renders results page
        else:
            return render_template('error.html', prot_id = prot_id)

    else:
        return render_template('index.html') # renders home page with all tasks
    
@app.route('/results/<prot_id>/<seg_id>', methods = ['POST', 'GET'])
def results(prot_id, seg_id):

    seg_name = prot_id + "_" + seg_id

    bss_prot = bss_data[bss_data.lab.str.contains(seg_name)]

    first_site = bss_prot.lab.unique().tolist()[0]

    first_site_data = bss_ress.query('bs_id == @first_site')[cc].to_dict(orient="list")

    data1 = bss_prot.to_dict(orient="list")

    prot_ress = bss_ress.query('up_acc == @prot_id')[cc]

    segment_reps = prot_seg_rep_strucs[prot_id]

    segment_reps = dict(sorted(segment_reps.items()))    

    data2 = prot_ress.to_dict(orient="list")

    seg_ress_dict = bs_ress_dict[prot_id][seg_id]
    
    return render_template(
        'structure.html', data = data1, headings = headings, data2 = data2, cc = cc, colors = colors,
        seg_ress_dict = seg_ress_dict, prot_id = prot_id, seg_id = seg_id, segment_reps = segment_reps,
        first_site_data = first_site_data, bs_table_tooltips = bs_table_tooltips,
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

    site_ress = bss_ress.query('bs_id == @lab')[cc]

    site_data = site_ress.to_dict(orient="list")

    #print(site_data)

    return jsonify(site_data)

### LAUNCHING SERVER ###

if __name__ == "__main__":
    app.run(port = 9000, debug = True)
    
# the end