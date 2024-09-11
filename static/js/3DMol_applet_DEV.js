// VIEWER CONFIG

let element = document.querySelector('#container-01'); // get structure viewer container element

let config = { // viewer configuration
    backgroundColor: 'white',
    id: "3DmolCanvas",
}

let viewer = $3Dmol.createViewer(element, config ); // create viewer object

$3Dmol.setSyncSurface(true); // all surfaces appear at once

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

function loadModel(simplePdb) { // Load a structure for each one of the simple pdbs (only one has protein atoms, the other just ligands)
    return new Promise((resolve, reject) => {
        jQuery.ajax(simplePdb, {
            success: function(data) {
                let model = viewer.addModel(data, "cif"); // Add the model to the viewer
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
        // viewer.setStyle({model: suppModels, hetflag: false}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: cartoonThickness, opacity: cartoonOpacity}}); // cartoon representation for protein
        // viewer.setStyle({model: suppModels, hetflag: true}, {stick: {hidden: true, radius: 0}}); // stick representation for ligands (HETATM), hidden by default

        protAtomsProtModelSel = {...protAtoms, model: protAtomsModel} // this is generating a new selection object including protein atoms of a specific model
        hetAtomsNotHohSuppModelSel = {...hetAtomsNotHoh, model: suppModels} // this is generating a new selection object including ligands (not water) of a specific model
        protAtomsSuppModelsSel = {...protAtoms, model: suppModelsNoProt} // this is generating a new selection object including protein atoms of all models

        viewer.setStyle(protAtomsProtModelSel, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: cartoonThickness, opacity: cartoonOpacity}}); // cartoon representation for protein
        viewer.setStyle(hetAtomsNotHohSuppModelSel, {stick: {hidden: true, radius: 0}}); // stick representation for ligands (HETATM), hidden by default
        viewer.setStyle(protAtomsSuppModelsSel, {cartoon: {hidden: true}}); // hide protein atoms in the superposition models


        //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}}, {stick: {hidden: true, color: "blue", radius: stickRadius}}); // stick representation for ligands (not HOH)
        //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}}, {sphere: {hidden: true, color: "red", radius: sphereRadius}}); // make ligand (not HOH) spheres smaller so only stick is visible
        //viewer.addStyle({model: suppModels, resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}}); // water molecules represented as gold spheres

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

            //suppLigsSels["clust"] = {model: suppModels, hetflag: true, not:{resn: "HOH"}, not: {properties:{ bs: -1}}}
            suppLigsSels["clust"] = {...hetAtomsNotHoh, model: suppModels, not: {properties: {bs: -1}}}

            //suppLigsSels["not_clust"] = {model: suppModels, hetflag: true, not:{resn: "HOH"}, properties:{ bs: -1}}
            suppLigsSels["not_clust"] = {...hetAtomsNotHoh, model: suppModels, properties: {bs: -1}}
            
            //suppLigsSels["water"] = {model: suppModels, resn: "HOH"}
            suppLigsSels["water"] = {...hohAtoms, model: suppModels}

            viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, properties:{ bs: -1}}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});

            //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, properties:{ bs: -1}}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});
        
            viewer.addStyle(suppLigsSels["not_clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, not: {properties:{ bs: -1}}}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});

            //viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, not: {properties:{ bs: -1}}}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}}); 
        
            //viewer.addStyle({model: suppModels, resn: "HOH"}, {stick: {hidden: true, color: waterColor, radius: stickRadius}});

            viewer.addStyle(suppLigsSels["water"], {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});
            //viewer.addStyle({model: suppModels, resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});

            viewer.render();

        })
        .catch(error => {
            console.error('Error:', error);
        });

        for (const [key, value] of Object.entries(seg_ress_dict)) { 
            let PDBResNums = seg_ress_dict[key]
                .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el))
                .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
            if (key == "ALL_BINDING") {

                let surfSel = {...protAtoms, model: protAtomsModel, not: {resi: PDBResNums}, chain: repPdbChainId}
        
                surfsDict["superposition"]["non_binding"] = viewer.addSurface(
                    $3Dmol.SurfaceType.ISO,
                    {
                        color: 'white',
                        opacity: surfaceHiddenOpacity,
                    },
                    //{model: suppModels, not:{resi: PDBResNums}, chain: repPdbChainId, hetflag: false},
                    //{model: suppModels, not:{resi: PDBResNums}, chain: repPdbChainId, hetflag: false},
                    // {and:[{model: protAtomsModel}, {not:{resi: PDBResNums}}, {chain: repPdbChainId}, protAtoms]},
                    // {and:[{model: protAtomsModel}, {not:{resi: PDBResNums}}, {chain: repPdbChainId}, protAtoms]},
                    surfSel,
                    surfSel,
                );
                //console.log(PDBResNums);
            }
            else {
                let surfSel = {...protAtoms, model: protAtomsModel, resi: PDBResNums, chain: repPdbChainId}

                let siteColor = chartColors[Number(key.split("_").pop())];
                surfsDict["superposition"][key] = viewer.addSurface(
                    $3Dmol.SurfaceType.ISO,
                    {
                        color: siteColor,
                        opacity: surfaceHiddenOpacity,
                    },
                    // {model: suppModels, resi: PDBResNums, chain: repPdbChainId, hetflag: false},
                    // {model: suppModels, resi: PDBResNums, chain: repPdbChainId, hetflag: false},
                    surfSel,
                    surfSel,
                );
            }
        }
        
        console.log("Surfaces added");

        viewer.zoomTo(); 
        viewer.render();

        labelsHash['superposition'] = {"clickedSite": {}, "hoveredRes": [], };

    }).catch(error => {
        console.error('Error loading one or more models:', error);
    });
}

loadAllModels(simplePdbs); // Load all structures