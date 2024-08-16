// VIEWER CONFIG

let element = document.querySelector('#container-01');

let config = {
    backgroundColor: 'white',
    id: "3DmolCanvas",
}

let viewer = $3Dmol.createViewer(element, config );

$3Dmol.setSyncSurface(true); // all surfaces appear at once

// SOME FUNCTIONS

function showHoverLabel(atom, viewer) {
    if(!atom.label) {
        atom.label = viewer.addLabel(
            modelOrderRev[atom.model] + " " + atom.chain + " " + atom.resn + " " + atom.resi + " " + atom.atom,
            {position: atom, backgroundColor: 'mintcream', fontColor:'black', borderColor: 'black', borderThickness: 2}
        );
    }
}

function removeHoverLabel(atom) {
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
let modelOrder = {}; // Dictionary: pdb ID --> model ID
let modelOrderRev = {}; // Dictionary: model ID --> pdb ID
simplePdbs.forEach(simplePdb => {
    jQuery.ajax(simplePdb, {
        success: function(data) {
            let model = viewer.addModel(data, "cif",); // Load data
            let modelID = model.getID(); // Gets the ID of the GLModel
            let baseName = simplePdb.split("/").pop() // Name of the structure (.cif) file
            let pdbID = baseName.split("_")[0]; // PDB ID from file name
            modelOrder[baseName] = modelID; // populate dictionary
            modelOrderRev[modelID] = pdbID; // populate dictionary
            models.push(model); // add model at the end of list
            loadedCount++; // Increment counter
            if (loadedCount === simplePdbs.length) { // All structures are loaded, apply styles
                console.log("All structures loaded");
                // console.log("Model order", modelOrder);

                viewer.setViewStyle({style:"outline", width:0.0625, color:"black"}); // cartoon outline
                viewer.setStyle({hetflag: false}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: 0.25, opacity: 0.8}}); // cartoon representation for protein
                viewer.setStyle({hetflag: true}, {stick: {hidden: true, radius: 0}}); // stick representation for ligands (HETATM), hidden by default

                viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {stick: {hidden: true, color: "blue", radius: 0.25}}); // stick representation for ligands (not HOH)
                viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {sphere: {hidden: true, color: "red", radius: 0.20}}); // make ligand (not HOH) spheres smaller so only stick is visible
                viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}}); // water molecules represented as gold spheres

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
                        // Execute your JavaScript commands here using these values
                        // console.log(modId, chain, resi, pBs);
                        var mySel = viewer.models[modId].atoms.filter(atom => atom.chain === chain & atom.resi === resi);
                        mySel.forEach(atom => {atom.properties["bs"] = pBs;});
                    });
                    
                    myMap = [...Array(maxId+1).keys()].reduce((acc, curr) => {
                        acc[curr] = chartColors[curr];
                        return acc;
                    }, {});
                    myMap[-1] = "grey";
                    myScheme = {prop: "bs", map: myMap}

                    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: 0.25}});
                    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: 0.20}});
                
                
                    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: 0.25}});
                    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: 0.20}}); 
                
                
                    viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}});
                    viewer.addStyle({resn: "HOH"}, {stick: {hidden: true, color: "gold", radius: 0.25}});

                    viewer.render();

                })
                .catch(error => {
                    console.error('Error:', error);
                });



                viewer.setHoverable({}, true, 
                    showHoverLabel,
                    removeHoverLabel,
                );

                for (const [key, value] of Object.entries(seg_ress_dict)) {
                    let PDBResNums = seg_ress_dict[key].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                    if (key == "ALL_BINDING") {
                
                        surfsDict["non_binding"] = viewer.addSurface(
                            $3Dmol.SurfaceType.ISO,
                            {
                                color: 'white',
                                opacity: 0.0,
                            },
                            {resi: PDBResNums, invert: true},
                            {hetflag: false},
                        );
                        //print resnums
                        // console.log(PDBResNums);
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        surfsDict[key] = viewer.addSurface(
                            $3Dmol.SurfaceType.ISO,
                            {
                                color: siteColor,
                                opacity: 0.0,
                            },
                            {resi: PDBResNums},
                            {resi: PDBResNums},
                        );
                    }
                }
                
                // add individual residue labels here
                // print that surfaces are added
                console.log("Surfaces added");
                
                
                viewer.render();

                viewer.zoomTo(); 
                viewer.render(); 
            }
        },
        error: function(hdr, status, err) {
            console.error("Failed to load PDB " + simplePdb + ": " + err);
        },
    });
});

viewer.resize();