# LIGYSIS web

This is the repository for out ligand binding site analysis, **LIGYSIS**, [web server](https://www.compbio.dundee.ac.uk/ligysis/). LIGYSIS is a Python Flask Web application.

## Dependencies

Third party dependencies include:

- 3Dmol.js
- Chart.js

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

## References
