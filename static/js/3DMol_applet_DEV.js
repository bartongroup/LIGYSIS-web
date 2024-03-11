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

let pdbUris = [
    '/static/data/P00517/3e8c_F_trans.cif',
    '/static/data/P00517/1szm_B_trans.cif',
    '/static/data/P00517/3e8e_G_trans.cif',
    '/static/data/P00517/2gnh_A_trans.cif',
    '/static/data/P00517/1xh9_A_trans.cif',
    '/static/data/P00517/3zo1_A_trans.cif',
    '/static/data/P00517/4c35_A_trans.cif',
    '/static/data/P00517/2uzv_B_trans.cif',
    '/static/data/P00517/2vnw_A_trans.cif',
    '/static/data/P00517/1xha_A_trans.cif',
    '/static/data/P00517/2uw0_A_trans.cif',
    '/static/data/P00517/2uzt_A_trans.cif',
    '/static/data/P00517/4ie9_A_trans.cif',
    '/static/data/P00517/3dnd_A_trans.cif',
    '/static/data/P00517/3e8e_A_trans.cif',
    '/static/data/P00517/3zo4_A_trans.cif',
    '/static/data/P00517/3bwj_A_trans.cif',
    '/static/data/P00517/2uw5_A_trans.cif',
    '/static/data/P00517/1q8w_A_trans.cif',
    '/static/data/P00517/1yds_A_trans.cif',
    '/static/data/P00517/1xh5_A_trans.cif',
    '/static/data/P00517/4yxr_A_trans.cif',
    '/static/data/P00517/2vo0_A_trans.cif',
    '/static/data/P00517/1sve_A_trans.cif',
    '/static/data/P00517/1q61_A_trans.cif',
    '/static/data/P00517/2jdt_A_trans.cif',
    '/static/data/P00517/2vo3_A_trans.cif',
    '/static/data/P00517/4axa_A_trans.cif',
    '/static/data/P00517/1xh6_A_trans.cif',
    '/static/data/P00517/5vhb_A_trans.cif',
    '/static/data/P00517/3ag9_A_trans.cif',
    '/static/data/P00517/4z84_A_trans.cif',
    '/static/data/P00517/1q8t_A_trans.cif',
    '/static/data/P00517/2uw6_A_trans.cif',
    '/static/data/P00517/3e8e_K_trans.cif',
    '/static/data/P00517/5vib_A_trans.cif',
    '/static/data/P00517/2uzw_A_trans.cif',
    '/static/data/P00517/2uw3_A_trans.cif',
    '/static/data/P00517/2uvx_A_trans.cif',
    '/static/data/P00517/3e8c_A_trans.cif',
    '/static/data/P00517/3zo2_A_trans.cif',
    '/static/data/P00517/1veb_A_trans.cif',
    '/static/data/P00517/4c36_A_trans.cif',
    '/static/data/P00517/2vo6_A_trans.cif',
    '/static/data/P00517/1smh_A_trans.cif',
    '/static/data/P00517/6e9l_A_trans.cif',
    '/static/data/P00517/2f7x_A_trans.cif',
    '/static/data/P00517/4ij9_A_trans.cif',
    '/static/data/P00517/2gnl_A_trans.cif',
    '/static/data/P00517/3ag9_B_trans.cif',
    '/static/data/P00517/3e8e_E_trans.cif',
    '/static/data/P00517/2jdv_A_trans.cif',
    '/static/data/P00517/2ojf_A_trans.cif',
    '/static/data/P00517/1ydr_A_trans.cif',
    '/static/data/P00517/2oh0_A_trans.cif',
    '/static/data/P00517/3e8c_D_trans.cif',
    '/static/data/P00517/4c38_A_trans.cif',
    '/static/data/P00517/2c1b_A_trans.cif',
    '/static/data/P00517/4yxs_A_trans.cif',
    '/static/data/P00517/1xh4_A_trans.cif',
    '/static/data/P00517/1stc_A_trans.cif',
    '/static/data/P00517/2uw4_A_trans.cif',
    '/static/data/P00517/3dne_A_trans.cif',
    '/static/data/P00517/3e8c_B_trans.cif',
    '/static/data/P00517/1svh_A_trans.cif',
    '/static/data/P00517/2uzu_A_trans.cif',
    '/static/data/P00517/4c34_A_trans.cif',
    '/static/data/P00517/1xh8_A_trans.cif',
    '/static/data/P00517/2uvz_A_trans.cif',
    '/static/data/P00517/3e8e_C_trans.cif',
    '/static/data/P00517/2jds_A_trans.cif',
    '/static/data/P00517/2f7e_A_trans.cif',
    '/static/data/P00517/2uw8_A_trans.cif',
    '/static/data/P00517/2gni_A_trans.cif',
    '/static/data/P00517/2f7z_A_trans.cif',
    '/static/data/P00517/4z83_A_trans.cif',
    '/static/data/P00517/1ydt_A_trans.cif',
    '/static/data/P00517/1q24_A_trans.cif',
    '/static/data/P00517/1szm_A_trans.cif',
    '/static/data/P00517/2gnj_A_trans.cif',
    '/static/data/P00517/3kkv_A_trans.cif',
    '/static/data/P00517/2vo7_A_trans.cif',
    '/static/data/P00517/3e8c_E_trans.cif',
    '/static/data/P00517/3e8e_I_trans.cif',
    '/static/data/P00517/2uvy_A_trans.cif',
    '/static/data/P00517/4c37_A_trans.cif',
    '/static/data/P00517/3zo3_A_trans.cif',
    '/static/data/P00517/3e8c_C_trans.cif',
    '/static/data/P00517/2uw7_A_trans.cif',
    '/static/data/P00517/6e99_A_trans.cif',
    '/static/data/P00517/2gnf_A_trans.cif',
    '/static/data/P00517/2c1a_A_trans.cif',
    '/static/data/P00517/1xh7_A_trans.cif',
    '/static/data/P00517/2vny_A_trans.cif',
    '/static/data/P00517/1q8u_A_trans.cif',
    '/static/data/P00517/1svg_A_trans.cif'
]
let myMap = {};
let myScheme = {};
let loadedCount = 0; // Counter for loaded structures
let models = [];
let modelOrder = {}; // creating dictionary to save the order in which files get loaded
let modelOrderRev = {};
pdbUris.forEach(pdbUri => {
    jQuery.ajax(pdbUri, {
        success: function(data) {
            let model = viewer.addModel(data, "cif",); // Load data
            let modelID = model.getID();
            let baseName = pdbUri.split("/").pop()
            let pdbID = baseName.split("_")[0];
            modelOrder[baseName] = modelID;
            modelOrderRev[modelID] = pdbID;
            models.push(model);
            loadedCount++; // Increment counter
            if (loadedCount === pdbUris.length) { // All structures are loaded, apply styles
                console.log("All structures loaded");
                // console.log("Model order", modelOrder);

                viewer.setViewStyle({style:"outline", width:0.0625, color:"black"});
                viewer.setStyle({hetflag: false}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true,  thickness: 0.25}});
                viewer.setStyle({hetflag: true}, {stick: {hidden: true, radius: 0.25}});

                viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {stick: {hidden: true, color: "blue", radius: 0.25}}); 
                viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {sphere: {hidden: true, color: "red", radius: 0.20}});
                viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}});

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

                viewer.zoomTo(); 
                viewer.render(); 
            }
        },
        error: function(hdr, status, err) {
            console.error("Failed to load PDB " + pdbUri + ": " + err);
        },
    });
});

viewer.resize();