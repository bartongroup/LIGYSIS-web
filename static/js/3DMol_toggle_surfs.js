let ligandLabel = null; // Shared variable for the label
let interLabel = null; // Shared variable for the label
let protLabel = null; // Shared variable for the label

const undefInters = ["covalent", "vdw", "vdw_clash", "proximal"]

let ligandSitesHash = {}; // this hash follows structure: {model: {ligandName: [ligand-binding residues selection]}}
let allBindingRess;

function findMiddlePoint(bgnCoords, endCoords) { // returns the middle point between two coordinates (used for labeling interaction cylinder)
    if (bgnCoords.length !== 3 || endCoords.length !== 3) {
        throw new Error('Both coordinates must be arrays of three elements.');
    }

    let middlePoint = [
        (bgnCoords[0] + endCoords[0]) / 2,
        (bgnCoords[1] + endCoords[1]) / 2,
        (bgnCoords[2] + endCoords[2]) / 2
    ];

    return middlePoint;
}

function toggleSurfaceVisibility() {
    if (surfaceVisible) { // hide all surfaces
        if (activeModel == "superposition") {
            for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                if (key == "non_binding") {
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: 'white', opacity: surfaceHiddenOpacity});
                }
                else {
                    let siteColor = chartColors[Number(key.split("_").pop())];
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                }
            }
        }
        else {
            if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key !== "lig_inters") {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: 'white', opacity: surfaceHiddenOpacity}); // hide ligand-binding residues surface
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
        surfButton.value = 'Surface OFF'; // Change the button text
        surfButton.style = "font-weight: bold; color: #674ea7;";
        
    }
    else {
        // check if any rows are clicked
        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements.length > 0) { // show surface only of clicked row
            let clickedElement = clickedElements[0];
            let clickedElementId = clickedElement.id;
            let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
            if (activeModel == "superposition") {
                let surfid = surfsDict["superposition"][clickedElementId].surfid;
                viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity:0.9}); // show ONLY surface of clicked row
            }
            else {
                if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                    for (const [key, value] of Object.entries(surfsDict[activeModel]['lig_inters'])) {
                        let ligColor = chartColors[strucProtData[key][1]];
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: ligColor, opacity: 0.9});
                    }
                }
                for (const [key, value] of Object.entries(surfsDict[activeModel][clickedElementId])) {
                    let surfid = value.surfid;
                    viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity:0.9}); // show ONLY surface of clicked row
                }
            }
        }
        else {
            // change surface opacity
            if (activeModel == "superposition") {
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: 'white', opacity:0.7});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity:0.8});
                    }
                }
            }
            else {
                if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                    for (const [key, value] of Object.entries(surfsDict[activeModel]['lig_inters'])) {
                        let ligColor = chartColors[strucProtData[key][1]];
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: ligColor, opacity: 0.9});
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key !== "lig_inters") {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "non_binding") {
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: 'white', opacity: 0.7}); // 0.7
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: siteColor, opacity: 0.8}); //0.8
                                }
                            }
                        }
                    }
                }
            }
        }
        surfButton.value = "Surface ON"; // Change the button text
        surfButton.style = "font-weight: bold; color: #B22222;";
    }
    surfaceVisible = !surfaceVisible; // Toggle the visibility state
    viewer.render();
}

function toggleLabelsVisibility() {
    if (labelsVisible) {
        labelButton.value = 'Labels OFF'; // Change the button text
        labelButton.style = "font-weight: bold; color: #674ea7;";

        //viewer.removeAllLabels();
        for (const [key, value] of Object.entries(labelsHash)) {
            for (let i = 0; i < value.length; i++) {
                viewer.removeLabel(value[i]);
            }
            labelsHash[key] = [];
        }
    }
    else {
        labelButton.value = "Labels ON"; // Change the button text
        labelButton.style = "font-weight: bold; color: #B22222;";
        
        // add labels if any site is clicked already
        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements) { // any row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
                if (activeModel == "superposition") {
                    let siteSuppPDBResNums = seg_ress_dict[clickedElementId]
                        .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                        .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                    for (siteSuppPDBResNum of siteSuppPDBResNums) {
                        let resSel = {resi: siteSuppPDBResNum}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpDict[repPdbId][repPdbChainId][siteSuppPDBResNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            true,
                        );
                        labelsHash["clickedSite"].push(label);
                    }
                    viewer.render();
                }
                else {
                    siteAssemblyPDBResNums = [];
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let siteAssemblyPDBResNum = seg_ress_dict[clickedElementId]
                            .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                            .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                        siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                    });
                    for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                        for (siteAssemblyPDBResNumber of siteAssemblyPDBResNum) { // variable name not ideal as siteAssemblyPDBResNum is an array
                            let resSel = {model: activeModel, resi: siteAssemblyPDBResNumber, chain: element, hetflag: false}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[chainsMapAssembly[element]][siteAssemblyPDBResNumber]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                true,
                            );
                            labelsHash["clickedSite"].push(label);
                        }
                    }
                }
                viewer.render();
            }
        }
        // show labels if CONTACTS is on
        if (contactsVisible) {
            for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                let bingingSite = strucProtData[key][1];
                let ligColor = chartColors[Number(bingingSite)];
                for (let i = 0; i < value.length; i++) {
                    let sel = value[i];
                    let label = viewer.addLabel(
                        sel.resn + String(Pdb2UpMapAssembly[chainsMapAssembly[sel.chain]][sel.resi]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: ligColor, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        sel,
                        true,
                    );
                    labelsHash["contactSites"].push(label);
                }
            }
            viewer.render();
        }
    }
    labelsVisible = !labelsVisible; // Toggle the visibility state

}

function toggleWatersVisibility() {
    if (watersVisible) {
        waterButton.value = 'Waters OFF'; // Change the button text
        waterButton.style = "font-weight: bold; color: #674ea7;";
        if (activeModel == "superposition") {
            viewer.addStyle({model: suppModels, resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});
            console.log(`Waters hidden for ${activeModel} models!`);
        }
        else {
            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});
            console.log(`Waters hidden for model ${activeModel}!`);
        }
    }
    else {
        waterButton.value = 'Waters ON'; // Change the button text
        waterButton.style = "font-weight: bold; color:#B22222;";
        if (activeModel == "superposition") {
            viewer.addStyle({model: suppModels, resn: "HOH"}, {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
            console.log(`Waters shown for ${activeModel} models!`);
        }
        else {
            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
            console.log(`Waters shown for model ${activeModel}!`);
        }
        
    }
    watersVisible = !watersVisible;
    viewer.render();
}

function toggleLigandsVisibility() {
    if (ligandsVisible) {
        ligandButton.value = 'Ligands OFF'; // Change the button text
        ligandButton.style = "font-weight: bold; color: #674ea7;";

        if (activeModel == "superposition") {
            viewer.addStyle({and:[{model: suppModels, hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle({and:[{model: suppModels, hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});
            viewer.addStyle({and:[{model: suppModels, hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle({and:[{model: suppModels, hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});
            console.log(`Ligands hidden for ${activeModel} model!`);
        }
        else {
            viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {stick: {hidden: true, radius: stickRadius}});
            viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {sphere: {hidden: true, radius: sphereRadius}})
            console.log(`Ligands hidden for model ${activeModel}!`);
        }

        if (contactsVisible) {
            contactsButton.value = 'Contacts OFF'; // Change the button text
            contactsButton.style = "font-weight: bold; color: #674ea7;";

            // loop through contactCylinders and delete using removeShape, then empty list
            for (let i = 0; i < contactCylinders.length; i++) {
                viewer.removeShape(contactCylinders[i]);
            }
            contactCylinders = [];

            viewer.addStyle({model: activeModel, hetflag: false}, {cartoon: {color: 'white'}, stick: {hidden: true}}); // remove ligand-interacting sticks and colour cartoon white

            if (labelsVisible) {
                // viewer.removeAllLabels(); // remove ligand-binding residue labels
                for (label of labelsHash["contactSites"]) {
                    viewer.removeLabel(label);
                }
                labelsHash["contactSites"] = [];
            }

            if (surfaceVisible) {
                //var surfButton = document.getElementById('surfButton');
                for (const [key, value] of Object.entries(surfsDict[activeModel]['lig_inters'])) { // hide surfaces of ligand-interacting residues
                    viewer.setSurfaceMaterialStyle(value.surfid, {opacity:0.0});
                }
                surfButton.value = 'Surface OFF'; // Change the button text
                surfButton.style = "font-weight: bold; color: #674ea7;";
                surfaceVisible = !surfaceVisible; // Toggle the visibility state
            }
            contactsVisible = false;
        }
    }
    else {
        ligandButton.value = 'Ligands ON'; // Change the button text
        ligandButton.style = "font-weight: bold; color:#B22222;";

        if (activeModel == "superposition") {
            viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});
            viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: false, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: false, colorscheme: myScheme, radius: sphereRadius}});
            console.log(`Ligands shown for ${activeModel} models!`);
        }
        else {
            viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {stick: {hidden: false, radius: stickRadius}});
            viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {sphere: {hidden: false, radius: sphereRadius}});
            console.log(`Ligands shown for model ${activeModel}!`);
        }
    }
    ligandsVisible = !ligandsVisible;
    viewer.render();
}

let contacts;
let strucProtData;

function toggleContactsVisibility() {
    if (contactsVisible) {
        contactsButton.value = 'Contacts OFF'; // Change the button text
        contactsButton.style = "font-weight: bold; color: #674ea7;";

        let clickedElements = document.getElementsByClassName("clicked-row");

        if (surfaceVisible) { // if clicking off contacts button, but surface button still on (show site definition surfaces)
            
            if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                let clickedElement = clickedElements[0];
                let clickedElementId = clickedElement.id;
                let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
                for (const [key, value] of Object.entries(surfsDict[activeModel]["lig_inters"])) {
                    viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { 
                    if (key == "lig_inters") { // hide surfaces of ligand-interacting residues
                        for (const [key2, value2] of Object.entries(value)) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {opacity:0.0});
                        }
                    }
                    else { // show binding site definition surfaces
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity:0.7});
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.8});
                            }
                        }
                    }
                }
            }
            
        }        

        if (labelsVisible) {
            for (label of labelsHash["contactSites"]) {
                viewer.removeLabel(label);
            }
            labelsHash["contactSites"] = [];
        }

        // loop through contactCylinders and delete using removeShape, then empty list
        // for (let i = 0; i < contactCylinders.length; i++) {
        //     viewer.removeShape(contactCylinders[i]);
        // }
        // contactCylinders = [];
        for (const cylinder of contactCylinders[activeModel]) {
            cylinder.updateStyle({hidden: true})
        }


        if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
            viewer.addStyle(
                {model: activeModel, or:allBindingRess, not: {or: AssemblyClickedSiteResidues}},
                {
                    cartoon:{color: 'white'},
                    stick: {hidden: true}
                }
            );
            
            
        }
        else {
            viewer.addStyle({model: activeModel, hetflag: false}, {cartoon: {color: 'white'}, stick: {hidden: true}}); // needs to change if site is clicked
        
        }
        viewer.addStyle({model: activeModel, hetflag: true, not:{resn: 'HOH'}}, {stick: {hidden: true}});
        viewer.addStyle({model: activeModel, hetflag: true, not:{resn: 'HOH'}}, {sphere: {hidden: true}});

        // turn ligandButton off
        ligandButton.value = 'Ligands OFF';
        ligandButton.style = "font-weight: bold; color: #674ea7;";
        ligandsVisible = false;

        console.log("Contacts removed!");
        contactsVisible = false;
        viewer.render();
    }
    else {
        if (contactCylinders[activeModel].length == 0) { // first time switching contacts on for this model
            fetch('/get-contacts', {
                method: 'POST', // Use POST method to send data
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        modelData: modelOrderRev[activeModel],
                        proteinId: proteinId,
                        segmentId: segmentId,
                    }
                ) // Send the data as JSON
            })
            .then(response => response.json())
            .then(data => {
                contacts = JSON.parse(data.contacts);
                strucProtData = data.protein;
                contactCylinders[activeModel] = []; // starting empty list for contact cylinders of this model
                contacts.forEach((item, index) => { 
                    // Extracting the necessary variables from each item
                    let contactBgnCoords = item.coords_bgn.map(coord => parseFloat(coord)); // Array of coordinates for ligand atom
                    let contactEndCoords = item.coords_end.map(coord => parseFloat(coord)); // Array of coordinates for protein atom

                    let contactType = item.contact;
                    let theContactType; // Variable to store the contact type that will be shown in the label
                    let contactWidth = parseFloat(item.width);           // Radius
                    let contactColor = item.color;           // Color
                    let contactDistance = parseFloat(item.distance); // Distance

                    let proteinChainId = item.auth_asym_id_end;
                    let proteinResName = item.label_comp_id_end;
                    let proteinResNum = item.auth_seq_id_end;
                    let proteinAtomName = item.auth_atom_id_end;

                    let ligandChainId = item.auth_asym_id_bgn;
                    let ligandResName = item.label_comp_id_bgn;
                    let ligandResNum = item.auth_seq_id_bgn;
                    let ligandAtomName = item.auth_atom_id_bgn;

                    // process contact fingerprint to get more relevant interaction type
                    if (contactType.length == 1) {
                        theContactType = contactType[0];
                    }
                    else {
                        let relevantInters = contactType.filter(el => !undefInters.includes(el));
                        theContactType = relevantInters[0];
                    }

                    var contactCylinder = viewer.addCylinder({ // Add a cylinder between the two atoms representing the contact
                        start: { x: contactBgnCoords[0], y: contactBgnCoords[1], z: contactBgnCoords[2] }, // Start of the cylinder (ligand atom)
                        end: { x: contactEndCoords[0], y: contactEndCoords[1], z: contactEndCoords[2] }, // End of the cylinder (protein atom)
                        radius: contactWidth,
                        dashed: true,
                        fromCap: 1,
                        toCap: 1,
                        color: contactColor, // Color of the cylinder based on Arpeggio contact type and colour scheme
                        userData: { // Store the data in the cylinder object to be used on the callback functions
                            contactBgnCoords: contactBgnCoords, // Store the coordinates of the ligand atom
                            contactEndCoords: contactEndCoords, // Store the coordinates of the protein atom
                            contactColor: contactColor, // Store the color of the contact
                            contactDistance: contactDistance, // Store the distance of the contact
                            proteinChainId: proteinChainId, // Store the chain ID of the protein atom
                            ligandChainId: ligandChainId, // Store the chain ID of the ligand atom
                            proteinResNum: proteinResNum, // Store the residue number of the protein atom
                            ligandResNum: ligandResNum, // Store the residue number of the ligand atom
                            proteinResName: proteinResName, // Store the residue name of the protein atom
                            ligandResName: ligandResName, // Store the residue name of the ligand atom
                            proteinAtomName: proteinAtomName, // Store the atom name of the protein atom
                            ligandAtomName: ligandAtomName, // Store the atom name of the ligand atom
                            theContactType: theContactType, // Store the contact type
                            index: index, // Index of the contact row in the table, will also be the key in the cylinderLabels hash
                        },
                        hoverable: true, // Allow the cylinder to be hovered on and trigger the callback
                        hover_callback: function(){ // Callback function for when the cylinder is hovered on (shows labels)
                            var middlePoint = findMiddlePoint( // Find the middle point between the two atoms
                                this.stylespec.userData.contactBgnCoords,
                                this.stylespec.userData.contactEndCoords
                                );

                            ligandLabel = viewer.addLabel( // Add a label for the ligand atom
                                `${this.stylespec.userData.ligandAtomName} ${this.stylespec.userData.ligandResName} ${this.stylespec.userData.ligandResNum} ${this.stylespec.userData.ligandChainId}`,
                                {
                                    position: {
                                        x: this.stylespec.userData.contactBgnCoords[0],
                                        y: this.stylespec.userData.contactBgnCoords[1],
                                        z: this.stylespec.userData.contactBgnCoords[2]
                                    },
                                    alignment: "center", borderColor: "black",
                                    borderThickness: 2, fontSize: 12, 
                                    backgroundColor: 'white',
                                    fontColor: "black",
                                }
                            );

                            interLabel = viewer.addLabel( // Add a label for the interaction type
                                `${theContactType} ${contactDistance}Å`,
                                {
                                    position: {
                                        x: middlePoint[0],
                                        y: middlePoint[1],
                                        z: middlePoint[2]
                                    },
                                    alignment: "center", borderColor: contactColor,
                                    borderThickness: 2, fontSize: 12, 
                                    backgroundColor: 'white',
                                    fontColor: contactColor,
                                }
                            );

                            protLabel = viewer.addLabel( // Add a label for the protein atom
                                `${this.stylespec.userData.proteinAtomName} ${this.stylespec.userData.proteinResName} ${this.stylespec.userData.proteinResNum} ${this.stylespec.userData.proteinChainId}`,
                                {
                                    position: {
                                        x: this.stylespec.userData.contactEndCoords[0],
                                        y: this.stylespec.userData.contactEndCoords[1],
                                        z: this.stylespec.userData.contactEndCoords[2]
                                    },
                                    alignment: "center", borderColor: "black",
                                    borderThickness: 2, fontSize: 12, 
                                    backgroundColor: 'white',
                                    fontColor: "black",
                                }
                            );

                            cylinderLabels[this.stylespec.userData.index] = [ligandLabel, interLabel, protLabel]; // Store the labels in the cylinderLabels hash (dictionary)

                        },
                        unhover_callback: function(){ // Callback function for when the cylinder is unhovered (removes labels)
                            viewer.removeLabel(cylinderLabels[this.stylespec.userData.index][0]); // Remove the ligand atom label
                            viewer.removeLabel(cylinderLabels[this.stylespec.userData.index][1]); // Remove the interaction type label
                            viewer.removeLabel(cylinderLabels[this.stylespec.userData.index][2]); // Remove the protein atom label
                        }
                    });

                    contactCylinders[activeModel].push(contactCylinder); // Add the cylinder to the contactCylinders list
                });

                for (const [ligNam, ligDat] of Object.entries(strucProtData)) {
                    let ligComps = ligNam.split("_");
                    let ligMol = ligComps[0];
                    let ligChain = ligComps[1];
                    let ligResi = ligComps[2];
                    let protRess = ligDat[0];
                    let bingingSite = ligDat[1];
                    let ligColor = chartColors[Number(bingingSite)];
                    ligandSitesHash[activeModel][ligNam] = [[], ]; // i = 0 will be ligand-binding selection, i = 1 will be ligand molecule, and i = 2 color
                    for (let i = 0; i < protRess.length; i++) {
                        let protRes = protRess[i];
                        let protResn = protRes[0];
                        let protChain = protRes[1];
                        let protResi = protRes[2];
                        let sel = {model: activeModel, resi: protResi, chain: protChain, resn: protResn};
                        ligandSitesHash[activeModel][ligNam][0].push(sel);

                        // add labels 
                        if (labelsVisible) {
                            let label = viewer.addLabel(
                                protResn + String(Pdb2UpMapAssembly[chainsMapAssembly[protChain]][protResi]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: ligColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                sel,
                                true,
                            );
                            labelsHash["contactSites"].push(label);
                        }
                    }

                    ligandSitesHash[activeModel][ligNam].push({model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol})
                    ligandSitesHash[activeModel][ligNam].push(ligColor)
                    viewer.addStyle({model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]}, {cartoon:{hidden: false, color: ligColor}, stick: {hidden: false, color: ligColor, radius: stickRadius}});

                    viewer.addStyle({model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol}, {stick: {hidden: false, color: ligColor, radius: stickRadius}});
                    // add ligand-interacting residues surfaces
                    surfsDict[activeModel]["lig_inters"][ligNam] = viewer.addSurface(
                        $3Dmol.SurfaceType.ISO,
                        {
                            color: ligColor,
                            opacity: surfaceHiddenOpacity,
                        },
                        {model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]},
                        {model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]},
                    );
                    // if labels are on, show labels for ligand-interacting residues
                }
                //allBindingRess = Object.values(ligandSitesHash[activeModel][0]).flat()
                allBindingRess = Object.values(ligandSitesHash[activeModel])
                    .map(item => item[0]) // Get the first element from each array
                    .flat();   

                // if (surfaceVisible) {
                //     let clickedElements = document.getElementsByClassName("clicked-row");
                //     if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                //         let clickedElement = clickedElements[0];
                //         let clickedElementId = clickedElement.id;
                //         for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                //             if (key == "lig_inters") {
                //                 for (const [key2, value2] of Object.entries(value)) {
                //                     let ligColor = chartColors[strucProtData[key2][1]];
                //                     viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: 0.9});
                //                 }
                //             }
                //             else if (key == clickedElementId) {
                //                 // pass
                //             }
                //             else {
                //                 for (const [key2, value2] of Object.entries(value)) {
                //                     viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                //                 }
                //             }
                //         }
                //     }
                //     else {
                //         for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                //             if (key == "lig_inters") {
                //                 for (const [key2, value2] of Object.entries(value)) {
                //                     let ligColor = chartColors[strucProtData[key2][1]];
                //                     viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: 0.9});
                //                 }
                //             }
                //             else {
                //                 for (const [key2, value2] of Object.entries(value)) {
                //                     viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                //                 }
                //             }
                //         }
                //     }   
                // }
                // viewer.render();
                
                // contactsButton.value = 'Contacts ON'; // Change the button text
                // contactsButton.style = "font-weight: bold; color:#B22222;";
                // contactsVisible = true;
            })
            .catch(error => console.error('Error fetching contacts:', error));
        }
        else { // if cylinders have already been created
            for (const cylinder of contactCylinders[activeModel]) {
                cylinder.updateStyle({hidden: false})
            }

            for (const [resSel, ligSel, ligCol] of Object.values(ligandSitesHash[activeModel])) {
                viewer.addStyle({model: activeModel, or: resSel}, {cartoon:{hidden: false, color: ligCol}, stick: {hidden: false, color: ligCol, radius: stickRadius}});
                viewer.addStyle(ligSel, {stick: {hidden: false, color: ligCol, radius: stickRadius}});
            }
        }
        // will execute regardless of whether contacts are being created or read

        //viewer.addStyle({model: activeModel, or:ligandSitesHash[activeModel][ligNam]}, {cartoon:{hidden: false, color: ligColor}, stick: {hidden: false, color: ligColor, radius: stickRadius}});

        //viewer.addStyle({model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol}, {stick: {hidden: false, color: ligColor, radius: stickRadius}});

        // loop through liganSitesHash and display residues and ligands
        // for (const [resSel, ligSel, ligCol] of Object.values(ligandSitesHash[activeModel])) {
        //     viewer.addStyle({model: activeModel, or: resSel}, {cartoon:{hidden: false, color: ligCol}, stick: {hidden: false, color: ligCol, radius: stickRadius}});
        //     viewer.addStyle(ligSel, {stick: {hidden: false, color: ligCol, radius: stickRadius}});
        // }

        if (surfaceVisible) {
            let clickedElements = document.getElementsByClassName("clicked-row");
            if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                let clickedElement = clickedElements[0];
                let clickedElementId = clickedElement.id;
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                    if (key == "lig_inters") {
                        for (const [key2, value2] of Object.entries(value)) {
                            let ligColor = chartColors[strucProtData[key2][1]];
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: 0.9});
                        }
                    }
                    else if (key == clickedElementId) {
                        // pass
                    }
                    else {
                        for (const [key2, value2] of Object.entries(value)) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                        }
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                    if (key == "lig_inters") {
                        for (const [key2, value2] of Object.entries(value)) {
                            let ligColor = chartColors[strucProtData[key2][1]];
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: 0.9});
                        }
                    }
                    else {
                        for (const [key2, value2] of Object.entries(value)) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                        }
                    }
                }
            }   
        }

        viewer.render();

        contactsButton.value = 'Contacts ON'; // Change the button text
        contactsButton.style = "font-weight: bold; color:#B22222;";
        contactsVisible = true;

    }
}
