// SOME FUNCTIONS

function showHoverLabel(atom, viewer) { // show label of hovered atom
    if(!atom.label) {
        atom.label = viewer.addLabel(
            modelOrderRev[atom.model] + " " + atom.chain + " " + atom.resn + " " + atom.resi + " " + atom.atom,
            {position: atom, backgroundColor: 'mintcream', fontColor:'black', borderColor: 'black', borderThickness: 2}
        );
    }
}

function removeHoverLabel(atom, viewer) { // remove label of hovered atom
    if(atom.label) {
        viewer.removeLabel(atom.label);
        delete atom.label;
    }
}

function loadModel(simplePdb) { // Load a structure for each one of the simple pdbs (only one has protein atoms, the other just ligands)
    return new Promise((resolve, reject) => {
        jQuery.ajax(simplePdb, {
            success: function(data) {
                let model = viewer.addModel(data, "cif", {unboundCations: true}); // Add the model to the viewer
                let hydrogenAtoms = model.selectedAtoms({elem: "H"}); // Get hydrogen atoms
                model.removeAtoms(hydrogenAtoms); // Remove hydrogen atoms
                let modelID = model.getID(); // Get the model ID. Used throughout to refere to a specific model
                let baseName = simplePdb.split("/").pop(); // Get the base name of the file (without the path)
                let pdbID = baseName.split("_")[0]; // Get the PDB ID
                modelOrder[baseName] = modelID; // Store the model ID in the modelOrder dictionary: pdb file name --> model ID
                modelOrderRev[modelID] = pdbID; // Store the pdb ID in the modelOrderRev dictionary: model ID --> pdb ID
                models.push(model); // Add the model to the models list
                loadedCount++; // Increment the loaded structures counter (used later to know how many models comprise the superposition)

                viewer.setHoverable( // sets individual model as hoverable
                    {model: modelID}, true,  
                    showHoverLabel,
                    removeHoverLabel,
                );
                resolve();  // Resolve the promise when the model is fully loaded and processed
            },
            error: function(hdr, status, err) {
                console.error("Failed to load PDB " + simplePdb + ": " + err);
                reject(err);  // Reject the promise if there's an error
            },
        });
    });
}

function loadAllModels(simplePdbs) { // Load all structures
    const loadPromises = simplePdbs.map(simplePdb => loadModel(simplePdb)); // Create an array of promises for each structure

    Promise.all(loadPromises).then(() => { // When all promises are resolved (al models have finished loading)
        console.log("All structures loaded");

        suppModels = Array.from({length: models.length}, (_, i) => 0 + i); // Create an array of model IDs from 0 to N-1 where N is the number of superposition models

        protAtomsModel = modelOrder[`${protAtomsRep}_trans.cif`]

        suppModelsNoProt = suppModels.filter(model => model !== protAtomsModel); // Create an array of model IDs without the protein atoms model

        viewer.setViewStyle({style: "outline", width: outlineWidth, color: outlineColor, "maxpixels": 2}); // cartoon outline

        protAtomsProtModelSel = {...protAtoms, model: protAtomsModel} // this is generating a new selection object including protein atoms of a specific model
        hetAtomsNotHohSuppModelSel = {...hetAtomsNotHoh, model: suppModels} // this is generating a new selection object including ligands (not water) of a specific model
        protAtomsSuppModelsSel = {...protAtoms, model: suppModelsNoProt} // this is generating a new selection object including protein atoms of all models
        hohAtomsSuppModelsSel = {...hohAtoms, model: suppModels} // this is generating a new selection object including water atoms of all models
        ionAtomsSuppModelsSel = {...ionAtoms, model: suppModels} // this is generating a new selection object including ion atoms of all models

        viewer.setStyle(protAtomsProtModelSel, {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity}}); // cartoon representation for protein
        viewer.setStyle(hetAtomsNotHohSuppModelSel, {stick: {hidden: true, radius: 0}}); // stick representation for ligands (HETATM), hidden by default
        viewer.setStyle(ionAtomsSuppModelsSel, {sphere: {hidden: true, radius: sphereRadius}}); // sphere representation for ions, hidden by default
        viewer.setStyle(protAtomsSuppModelsSel, {cartoon: {hidden: true, style: cartoonStyle, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity}}); // hide protein atoms in the superposition models
        viewer.setStyle(hohAtomsSuppModelsSel, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}}); // sphere representation for water atoms, hidden by default

        // Send modelOrder to Flask
        fetch('/process-model-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({modelOrder: modelOrder, segmentName: segmentName}),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data here
            const resultTuples = data.resultTuples;
            const maxId = data.maxId;
            resultTuples.forEach(([modId, chain, resi, pBs]) => {

                var mySel = viewer.models[modId].atoms.filter(atom => atom.chain === chain & atom.resi === resi);
                mySel.forEach(atom => {atom.properties["bs"] = pBs;});
            });
            
            myMap = [...Array(maxId+1).keys()].reduce((acc, curr) => {
                acc[curr] = chartColors[curr];
                return acc;
            }, {});
            myMap[-1] = "grey";
            myScheme = {prop: "bs", map: myMap}

            suppLigsSels["clust"] = {...hetAtomsNotHoh, model: suppModels, not: {properties: {bs: -1}}}

            suppLigsSels["clust_ions"] = {...ionAtoms, model: suppModels, not: {properties: {bs: -1}}}

            suppLigsSels["not_clust"] = {...hetAtomsNotHoh, model: suppModels, properties: {bs: -1}}

            suppLigsSels["not_clust_ions"] = {...ionAtoms, model: suppModels, properties: {bs: -1}}
            
            suppLigsSels["water"] = {...hohAtoms, model: suppModels}

            viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});

            viewer.addStyle(suppLigsSels["clust_ions"], {sphere: {hidden: true, colorscheme: myScheme, radius: ionSphereRadius}});
        
            viewer.addStyle(suppLigsSels["not_clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});

            viewer.addStyle(suppLigsSels["not_clust_ions"], {sphere: {hidden: true, colorscheme: myScheme, radius: ionSphereRadius}});

            viewer.addStyle(suppLigsSels["water"], {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});

            viewer.render();

        })
        .catch(error => {
            console.error('Error:', error);
        });

        for (const [key, value] of Object.entries(seg_ress_dict)) { 
            let PDBResNums = seg_ress_dict[key]
                .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el))
                .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
            if (key == "ALL_BINDING") {

                let surfSel = {...protAtoms, model: protAtomsModel, not: {resi: PDBResNums}, chain: authAsymId}
        
                surfsDict["superposition"]["non_binding"] = viewer.addSurface(
                    $3Dmol.SurfaceType.ISO,
                    {
                        color: defaultColor,
                        opacity: surfHiddenOpacity,
                    },
                    surfSel,
                    surfSel,
                );
            }
            else {
                let surfSel = {...protAtoms, model: protAtomsModel, resi: PDBResNums, chain: authAsymId}

                let siteColor = chartColors[Number(key.split("_").pop())];
                surfsDict["superposition"][key] = viewer.addSurface(
                    $3Dmol.SurfaceType.ISO,
                    {
                        color: siteColor,
                        opacity: surfHiddenOpacity,
                    },
                    surfSel,
                    surfSel,
                );
            }
        }

        viewer.setClickable(
            {model: suppModels}, // Select all atoms or define specific criteria
            true,      // Enable clicking
            function(atom) { 
                if (atom && atom.resn) {
                    // Construct the URL using the residue name (resn) of the clicked atom
                    const url = `${pdbeChemUrlRoot}${atom.resn}`;
                    // Open the URL in a new tab or window
                    window.open(url, '_blank');
                } else {
                    console.log("Clicked an atom without a residue name");
                }
            }
        );
        
        console.log("Surfaces added");

        viewer.zoomTo(); 
        viewer.render();

        labelsHash['superposition'] = {"clickedSite": {}, "hoveredRes": [], };

        slab = viewer.getSlab();
        initialNearSlab = slab['near'];
        initialFarSlab = slab['far'];
        nearPlane = Math.trunc(initialNearSlab);
        farPlane = Math.trunc(initialFarSlab);

        nearSlider.min = initialNearSlab;
        nearSlider.max = initialFarSlab;
        nearSlider.value = initialNearSlab;
        
        farSlider.min = initialNearSlab;
        farSlider.max = initialFarSlab;
        farSlider.value = initialFarSlab;

    }).catch(error => {
        console.error('Error loading one or more models:', error);
    }).finally(() => {
        // Hide spinner after all models are loaded or if an error occurs
        toggleSpinner1();
    });
}

// VIEWER

let myMap = {}; // Dictionary for color mapping
let myScheme = {}; // Scheme object for ligand colouring: takes binding site (bs) property and myMap
let loadedCount = 0; // Counter for loaded structures
let models = []; // List of GLModels
let suppModels; // List of superposition models IDs (will be an array [0, N-1] where N is the number of models)
let modelOrder = {}; // Dictionary: pdb ID --> model ID
let modelOrderRev = {}; // Dictionary: model ID --> pdb ID
let protAtomsModel; // Model ID for the structure with protein atoms
let suppModelsNoProt; // List of superposition models IDs without the protein atoms model

let protAtomsProtModelSel; // Selection object for protein atoms in the protein atoms model
let hetAtomsNotHohSuppModelSel; // Selection object for ligands (not water) in the superposition models
let protAtomsSuppModelsSel; // Selection object for protein atoms in the superposition models

let element; // Structure viewer container element
let viewer; // Viewer object
let config; // Viewer configuration

document.addEventListener("DOMContentLoaded", () => {
    contactsButton = document.getElementById('contactsButton');
    ligandButton = document.getElementById('ligandButton');
    waterButton = document.getElementById('waterButton');
    labelButton = document.getElementById('labelButton');
    surfButton = document.getElementById('surfButton');

    // Get references to the sliders and value displays
    nearSlider = document.getElementById('near');
    farSlider = document.getElementById('far');

    // Update near plane value
    nearSlider.addEventListener('input', function() {
        nearPlane = Math.trunc(parseFloat(this.value));
        updateSlab();
    });

    // Update far plane value
    farSlider.addEventListener('input', function() {
        farPlane = Math.trunc(parseFloat(this.value));
        updateSlab();
    });

    spinner1 = document.querySelector('#spinner1');
    spinner1Image = document.querySelector('#spinnerImage1');

    spinner2 = document.querySelector('#spinner2');
    spinner2Image = document.querySelector('#spinnerImage2');
    overlay2 = document.querySelector('#overlay2');

    spinner3 = document.querySelector('#spinner3');
    spinner3Image = document.querySelector('#spinnerImage3');
    overlay3 = document.querySelector('#overlay3');

    element = document.querySelector('#container-01'); // get structure viewer container element

    config = { // viewer configuration
        backgroundColor: bgColor,
        id: "3DmolCanvas",
    }

    viewer = $3Dmol.createViewer(element, config ); // create viewer object

    $3Dmol.setSyncSurface(true); // all surfaces appear at once

    loadAllModels(simplePdbs); // Load all structures

});



