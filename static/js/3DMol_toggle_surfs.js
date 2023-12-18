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
    
    // viewer.render();
}