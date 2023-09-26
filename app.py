### PACKAGE IMPORTS ###

import os
import pickle
import pandas as pd

from flask import Flask, render_template, url_for, request, redirect, jsonify

from config import DATA_FOLDER

### FUNCTIONS ###

def load_pickle(f_in):
    """
    Loads data from pickle.
    """
    with open(f_in, "rb") as f:
        data = pickle.load(f)
    return data

### READING INPUT DATA ###

bss_data = pd.read_pickle(os.path.join(DATA_FOLDER, "bss_data.pkl"))
bss_ress = pd.read_pickle(os.path.join(DATA_FOLDER, "all_bs_ress_v2_08_2023.pkl"))
prot_ids = load_pickle(os.path.join(DATA_FOLDER, "prot_ids.pkl"))

### FORMATTING DATA ###

bss_ress = bss_ress.explode("binding_sites")
bss_ress["bs_id"] = bss_ress.up_acc + "_" + bss_ress.seg_id.astype(str) + "_" + bss_ress.binding_sites.astype(str)
bss_ress.UniProt_ResNum = bss_ress.UniProt_ResNum.astype(int)
bss_ress = bss_ress.drop_duplicates(["up_acc", "seg_id", "binding_sites", "UniProt_ResNum"]) # drop duplicate residues within the binding site

bs_ress_dict =  {
    "P78540_1_0": [83, 84],
    "P78540_1_1": [24, 26, 58, 61, 62, 63, 323],
    "P78540_1_2": [107, 133, 134, 135, 136, 245, 290],
    "P78540_1_3": [120, 143, 145, 147, 149, 155, 156, 160, 161, 200, 202, 205, 251, 253, 265, 296]
}

### SOME FIXED VARIABLES ###

colors = load_pickle(os.path.join(DATA_FOLDER, "sample_colors_hex.pkl"))

headings = bss_data.columns.tolist()

data_prots = [el.split("_") for el in bss_data.lab.unique().tolist()]

cc = [
    'UniProt_ResNum', 'alignment_column', 'abs_norm_shenkin',
    'oddsratio', 'pvalue', 'AA', 'RSA', 'SS'
]

#### FLASK APP ###

app = Flask(__name__)
    
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':

        prot_id = request.form['proteinId']

        if prot_id in prot_ids:
            return redirect(url_for('results', prot_id = prot_id)) # renders results page
        else:
            return render_template('error.html', prot_id = prot_id)

    else:
        return render_template('index.html') # renders home page with all tasks
    
@app.route('/results/<prot_id>', methods = ['POST', 'GET'])
def results(prot_id):

    bss_prot = bss_data[bss_data.lab.str.contains(prot_id)]

    data1 = bss_prot.to_dict(orient="list")

    prot_ress = bss_ress.query('up_acc == @prot_id')[cc]

    data2 = prot_ress.to_dict(orient="list")
    
    return render_template('structure.html', data = data1, headings = headings, data2 = data2, cc = cc, colors = colors, bs_ress_dict = bs_ress_dict)

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

    prot_ress = bss_ress.query('bs_id == @lab')[cc]

    site_data = prot_ress.to_dict(orient="list")

    # Your logic here to select the right DataFrame based on data_point_index

    return jsonify(site_data)

### LAUNCHING SERVER ###

if __name__ == "__main__":
    app.run(port = 9000, debug = True)
    
# the end