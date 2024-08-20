function toggleSurfaceVisibility() {
    var button = document.getElementById('surfButton');
    if (surfaceVisible) { // hide all surfaces
        if (activeModel == "superposition") {
            for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                if (key == "non_binding") {
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: 'white', opacity:0.0});
                }
                else {
                    let siteColor = chartColors[Number(key.split("_").pop())];
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity:0.0});
                }
            }
        }
        else {
            viewer.setSurfaceMaterialStyle(surfsDict[activeModel].surfid, {color: 'white', opacity:0.0});
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
            let surfid = surfsDict["superposition"][clickedElementId].surfid;
            viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity:0.9}); // show ONLY surface of clicked row
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
                viewer.setSurfaceMaterialStyle(surfsDict[activeModel].surfid, {color: 'white', opacity:0.7});
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

let ligandLabel = null; // Shared variable for the label
let interLabel = null; // Shared variable for the label
let protLabel = null; // Shared variable for the label

const undefInters = ["covalent", "vdw", "vdw_clash", "proximal"]

function findMiddlePoint(bgnCoords, endCoords) {
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

function toggleContactsVisibility() {
    var button = document.getElementById('contactsButton');
    if (contactsVisible) {
        button.value = 'Contacts OFF'; // Change the button text
        button.style = "font-weight: bold; color: #674ea7;";

        // loop through contactCylinders and delete using removeShape, then empty list
        for (let i = 0; i < contactCylinders.length; i++) {
            viewer.removeShape(contactCylinders[i]);
        }
        contactCylinders = [];
        viewer.addStyle({resi: bindingRess}, {stick: {hidden: true, color: "white", radius: 0.25}});
        console.log("Contacts removed!");
        contactsVisible = false;
        viewer.render();
    } else {

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
            let contacts = JSON.parse(data.contacts);
            let strucLigData = data.ligands;
            bindingRess = Array.from(new Set(contacts.map(item => item.auth_seq_id_end)));

                
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
                    if (relevantInters.length > 0) {
                        console.log("Relevant interactions:", relevantInters);
                    }
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
                contactCylinders.push(contactCylinder); // Add the cylinder to the contactCylinders list
            });

            viewer.addStyle({resi: bindingRess}, {stick: {hidden: false, color: "white", radius: 0.25}}); // Show the binding residues sticks
            
            for (let i = 0; i < strucLigData.length; i++) { // Loop through the ligands and colour them based on their site
                let ligand = strucLigData[i];
                let ligandResn = ligand[0]
                let ligandChain = ligand[1];
                let ligandResi = ligand[2];
                let ligandColor = chartColors[ligand[3]];
                viewer.addStyle({resi: ligandResi, chain: ligandChain, resn: ligandResn}, {stick: {hidden: false, color: ligandColor, radius: 0.25}});
            }

            viewer.render();
            button.value = 'Contacts ON'; // Change the button text
            button.style = "font-weight: bold; color:#B22222;";
            contactsVisible = true;
        })
        .catch(error => console.error('Error fetching contacts:', error));
    }
}
