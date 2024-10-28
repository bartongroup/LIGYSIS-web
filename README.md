# LIGYSIS web

This is the repository for out ligand binding site analysis, **LIGYSIS**, [web server](https://www.compbio.dundee.ac.uk/ligysis/). LIGYSIS is a Python Flask Web application.

## Dependencies

Third party dependencies include:

- [3Dmol.js](https://3dmol.csb.pitt.edu/doc/index.html) [(BSD 3-Clause License)](https://github.com/3dmol/3Dmol.js/blob/master/LICENSE)
- [Chart.js](https://www.chartjs.org/) [(MIT License)](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md)

Other dependencies constitute standard Python libraries:

- [Flask](https://flask.palletsprojects.com/en/stable/) [(BSD 3-Clause License)](https://github.com/pallets/flask/blob/main/LICENSE.txt)
- [Numpy](https://numpy.org/) [(BSD 3-Clause License)](https://github.com/numpy/numpy/blob/main/LICENSE.txt)
- [Pandas](https://pandas.pydata.org/) [(BSD 3-Clause License)](https://github.com/pandas-dev/pandas/blob/main/LICENSE)
  
## Installation

To install **LIGYSIS WEB** locally, you must simply create the `LIGYSIS_WEB` enviornment with the following command:

```sh
conda create -n LIGYSIS_WEB python numpy pandas flask
```

This will install the necessary libraries to locally run the LIGYSIS web app.

## Run the app

After installation, this is how you can run the LIGYSIS app locally:

```sh
# activate LIGYSIS_WEB conda environment
conda activate LIGYSIS_WEB

# run the LIGYSIS app
python app.py
```

We do not offer full LIGYSIS dataset download, so a local installation of the LIGYSIS web app would only make sense if the customised **LIGYSIS** [pipeline](https://github.com/JavierSanchez-Utges/ligysis_custom/tree/revamped) was installed and a user wanted to explore their results locally without relying on our public server.


## Citation

If you use the **LIGYSIS** web application, please cite:

**Utgés JS**, MacGowan SA, Ives CM, Barton GJ. Classification of likely functional class for ligand binding sites identified from fragment screening. Commun Biol. 2024 Mar 13;7(1):320. doi: [10.1038/s42003-024-05970-8](https://www.nature.com/articles/s42003-024-05970-8). PMID: 38480979; PMCID: PMC10937669.

**Utgés JS** & Barton GJ. Comparative evaluation of methods for the prediction of protein-ligand binding sites, 08 August 2024, PREPRINT (Version 1) available at Research Square [https://doi.org/10.21203/rs.3.rs-4849153/v1](https://doi.org/10.21203/rs.3.rs-4849153/v1)

**Utgés JS**, MacGowan SA, Barton GJ. LIGYSIS-web: a resource for the analysis of protein-ligand binding sites. 2025. <i>Work in progress...</i>.

## References
