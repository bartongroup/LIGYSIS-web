function toggleSurfaceVisibility() {
    var button = document.getElementById('surfButton');
    if (surfaceVisible) { // hide all surfaces
        for (const [key, value] of Object.entries(surfsDict)) {
            if (key == "non_binding") {
                viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.0});
            }
            else {
                let siteColor = chartColors[Number(key.split("_").pop())];
                viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.0});
            }
        }
        button.value = 'Surface OFF'; // Change the button text
        button.style = "font-weight: bold; color: #674ea7;";
        
    }
    else {
        // check if any rows are clicked
        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements.length > 0) { // show surface only of clicked row
            let clickedElement = clickedElements[0];
            let clickedElementId = clickedElement.id;
            let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
            let surfid = surfsDict[clickedElementId].surfid;
            viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity:0.9}); // show ONLY surface of clicked row
        }
        else {
            // change surface opacity
            for (const [key, value] of Object.entries(surfsDict)) {
                if (key == "non_binding") {
                    viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.7});
                }
                else {
                    let siteColor = chartColors[Number(key.split("_").pop())];
                    viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.8});
                }
            }
        }
        button.value = "Surface ON"; // Change the button text
        button.style = "font-weight: bold; color: #B22222;";
    }
    surfaceVisible = !surfaceVisible; // Toggle the visibility state
    viewer.render();
}

function toggleLabelsVisibility() {
    var button = document.getElementById('labelButton');
    if (labelsVisible) {
        button.value = 'Labels OFF'; // Change the button text
        button.style = "font-weight: bold; color: #674ea7;";

        viewer.removeAllLabels();
    }
    else {
        button.value = "Labels ON"; // Change the button text
        button.style = "font-weight: bold; color: #B22222;";
        
        // add labels if any site is clicked already
        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements) { // any OTHER row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
                // let PDBResNums = seg_ress_dict[clickedElementId].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                let PDBResNums = seg_ress_dict[clickedElementId]
                    .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                    .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                for (PDBResNum of PDBResNums) {
                    let resSel = {resi: PDBResNum}
                    let resName = viewer.selectedAtoms(resSel)[0].resn
                    viewer.addLabel(
                        resName + String(Pdb2UpDict[repPdbId][repPdbChainId][PDBResNum]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        resSel,
                        true,
                    );
                }
                viewer.render({});
            }
        }
    }
    labelsVisible = !labelsVisible; // Toggle the visibility state

}

function toggleWatersVisibility() {
    var button = document.getElementById('waterButton');
    if (watersVisible) {
        button.value = 'Waters OFF'; // Change the button text
        button.style = "font-weight: bold; color: #674ea7;";
        viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}});
        console.log("Waters hidden!");
    }
    else {
        button.value = 'Waters ON'; // Change the button text
        button.style = "font-weight: bold; color:#B22222;";
        viewer.addStyle({resn: "HOH"}, {sphere: {hidden: false, color: "gold", radius: 0.20}});
        console.log("Waters shown!");
    }
    watersVisible = !watersVisible;
    viewer.render();
}


function toggleLigandsVisibility() {
    var button = document.getElementById('ligandButton');
    if (ligandsVisible) {
        button.value = 'Ligands OFF'; // Change the button text
        button.style = "font-weight: bold; color: #674ea7;";

        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: 0.25}});
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: 0.20}});
    
    
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: 0.25}});
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: 0.20}}); 
    
        console.log("Ligands hidden!");
    }
    else {
        button.value = 'Ligands ON'; // Change the button text
        button.style = "font-weight: bold; color:#B22222;";
        // viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {stick: {hidden: false, color: "blue", radius: 0.25}}); 
        // viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {sphere: {hidden: false, color: "red", radius: 0.20}});
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: 0.25}});
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: 0.20}});
    
    
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: false, colorscheme: myScheme, radius: 0.25}});
        viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: false, colorscheme: myScheme, radius: 0.20}}); 
    
    
        // viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}});
        // viewer.addStyle({resn: "HOH"}, {stick: {hidden: true, color: "gold", radius: 0.25}});

        console.log("Ligands shown!");
    }
    ligandsVisible = !ligandsVisible;
    viewer.render();
}