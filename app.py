import pandas as pd
import pickle

from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy

### FUNCTIONS ###

def load_pickle(f_in):
    """
    loads pickle
    """
    with open(f_in, "rb") as f:
        data = pickle.load(f)
    return data

bss_data = pd.read_pickle("./static/data/bss_data.pkl")
colors = load_pickle("./static/data/sample_colors_hex.pkl")
bss_ress = pd.read_pickle("./static/data/all_bs_ress_v2_08_2023.pkl")

bss_ress = bss_ress.explode("binding_sites")
bss_ress["bs_id"] = bss_ress.up_acc + "_" + bss_ress.seg_id.astype(str) + "_" + bss_ress.binding_sites.astype(str)
bss_ress.UniProt_ResNum = bss_ress.UniProt_ResNum.astype(int)
bss_ress = bss_ress.drop_duplicates(["up_acc", "seg_id", "binding_sites", "UniProt_ResNum"]) # drop duplicate residues within the binding site

cc = [
    'UniProt_ResNum', 'alignment_column', 'abs_norm_shenkin',
    'oddsratio', 'pvalue', 'AA', 'RSA', 'SS'
]


app = Flask(__name__)
    
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':

        prot_id = request.form['content']

        bss_prot = bss_data[bss_data.lab.str.contains(prot_id)]

        headings = bss_prot.columns.tolist()

        data = bss_prot.to_dict(orient="list")

        prot_ress = bss_ress.query('up_acc == @prot_id')

        prot_ress = prot_ress[cc]

        data2 = prot_ress.to_dict(orient="list")

        return render_template('structure.html',  bss_prot = bss_prot, headings=headings, data=data, colors = colors, data2 = data2, cc = cc) # renders update page

    else:
        return render_template('index.html') # renders home page with all tasks
    
#@app.route('/results', methods = ['POST', 'GET'])
#def results():



if __name__ == "__main__":
    app.run(port = 9000, debug = True)
    
# the end