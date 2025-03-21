let ligandLabel = null; // Shared variable for the label
let interLabel = null; // Shared variable for the label
let protLabel = null; // Shared variable for the label

let contacts;
let strucProtData;

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

function toggleSliceVisibility() {
    if (sliceVisible) {
        document.getElementById("sliceButton").textContent = "SLICE ✘";
        sliceButton.style.borderColor = "#ffa500";
        sliceButton.style.fontWeight = "normal";
        sliceButton.style.color = "#ffa500";
        sliceButton.style.borderWidth = "1px";

        controls.style.display = "none";
    }
    else {
        document.getElementById("sliceButton").textContent = "SLICE ✓";
        sliceButton.style.fontWeight = "bold";
        sliceButton.style.color = "#007bff";
        sliceButton.style.borderColor = "#007bff";
        sliceButton.style.borderWidth = "2.5px";

        controls.style.display = "flex";
    }
    sliceVisible = !sliceVisible; // Toggle the visibility state
}

function toggleSurfaceVisibility() {
    if (surfaceVisible) { // hide all surfaces
        if (activeModel == "superposition") {
            for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                if (key == "non_binding") {
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                }
                else {
                    let siteColor = chartColors[Number(key.split("_").pop())];
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                }
            }
        }
        else {
            if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key !== "lig_inters") {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide ligand-binding residues surface
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
        document.getElementById("surfButton").textContent = "SURF ✘";
        surfButton.style.borderColor = "#ffa500";
        surfButton.style.fontWeight = "normal";
        surfButton.style.color = "#ffa500";
        surfButton.style.borderWidth = "1px";

        
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
                viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity: surfHighOpacity}); // show ONLY surface of clicked row
            }
            else {
                if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                    for (const [key, value] of Object.entries(surfsDict[activeModel]['lig_inters'])) {
                        let ligColor = ligandSitesHash[activeModel][key][2]
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: ligColor, opacity: surfHighOpacity});
                    }
                }
                for (const [key, value] of Object.entries(surfsDict[activeModel][clickedElementId])) {
                    let surfid = value.surfid;
                    viewer.setSurfaceMaterialStyle(surfid, {color: siteColor, opacity: surfHighOpacity}); // show ONLY surface of clicked row
                }
            }
        }
        else {
            // change surface opacity
            if (activeModel == "superposition") {
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfLowOpacity});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfMediumOpacity});
                    }
                }
            }
            else {
                if (contactsVisible) { // if contacts are visible, show only surface of ligand interacting residues
                    for (const [key, value] of Object.entries(surfsDict[activeModel]['lig_inters'])) {
                        let ligColor = ligandSitesHash[activeModel][key][2]
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: ligColor, opacity: surfHighOpacity});
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key !== "lig_inters") {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "non_binding") {
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: defaultColor, opacity: surfLowOpacity});
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: siteColor, opacity: surfMediumOpacity});
                                }
                            }
                        }
                    }
                }
            }
        }
        document.getElementById("surfButton").textContent = "SURF ✓";
        surfButton.style.fontWeight = "bold";
        surfButton.style.color = "#007bff";
        surfButton.style.borderColor = "#007bff";
        surfButton.style.borderWidth = "2.5px";
    }
    surfaceVisible = !surfaceVisible; // Toggle the visibility state
    viewer.render();
}

function toggleLabelsVisibility() {
    if (labelsVisible) {
        document.getElementById("labelButton").textContent = "LABEL ✘";
        labelButton.style.borderColor = "#ffa500";
        labelButton.style.fontWeight = "normal";
        labelButton.style.color = "#ffa500";
        labelButton.style.borderWidth = "1px";

        for (const [key, value] of Object.entries(labelsHash[activeModel])) {
            if (key === 'hoveredRes') {
                for (const label of value) {
                    label.hide();
                }
            }
            else if (key === 'clickedSite') {
                for (const [key2, value2] of Object.entries(value)) {
                    for (const label of value2) {
                        label.hide();
                    }
                }
            }
            else if (key === 'contactSites') {
                for (const label of value) {
                    label.hide();
                }
            }
        }
        viewer.render();
    }
    else { // add labels if any site is clicked already

        document.getElementById("labelButton").textContent = "LABEL ✓";
        labelButton.style.fontWeight = "bold";
        labelButton.style.color = "#007bff";
        labelButton.style.borderColor = "#007bff";
        labelButton.style.borderWidth = "2.5px";

        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements) { // any row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                let siteColor = chartColors[Number(clickedElementId.split("_").pop())];

                if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(clickedElementId)) {
                    console.log(`Site ${clickedElementId} already clicked and labels exist`);
                    for (const label of labelsHash[activeModel]["clickedSite"][clickedElementId]) {
                        label.show();
                    }
                }
                else {
                    console.log(`Site ${clickedElementId} not clicked yet. Creating labels...`);
                    labelsHash[activeModel]["clickedSite"][clickedElementId] = [];
                    if (activeModel == "superposition") {
                        let siteSuppPDBResNums = seg_ress_dict[clickedElementId]
                            .filter(el => Up2PdbDict.hasOwnProperty(el))
                            .flatMap(el => {
                                let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                return dataArray.map(data => {
                                    return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                });
                            });
                        for (siteSuppPDBResNum of siteSuppPDBResNums) { // this is an array of dictionaries : {chain: chain, resi: resi}
                            let resChain = siteSuppPDBResNum['chain'];
                            let resNum = siteSuppPDBResNum['resi'];
                            let resSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpDict[resChain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                true,
                            );
                            labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                        }
                        viewer.render();
                    }
                    else {
                        siteAssemblyPDBResNums = [];

                        let siteAssemblyPDBResNum = seg_ress_dict[clickedElementId]
                            .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                            .flatMap(el => {
                                let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                                return dataArray.map(data => {
                                    return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                });
                            });
                        siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}

                        for (let residue of siteAssemblyPDBResNums) {
                            let resChain = residue['chain'];
                            let resNum = residue['resi'];
                            let resSel = {model: activeModel, resi: resNum, chain: resChain}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                false,
                            );
                            labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                            
                        }
                    }
                }
                viewer.render();
            }
        }
        if (contactsVisible) { // show labels if CONTACTS is on
            for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                for (const bindingRes of value[0]) {
                    let label = viewer.addLabel(
                        bindingRes.resn + String(Pdb2UpMapAssembly[bindingRes.chain][bindingRes.resi]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: value[2], fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        {model: bindingRes.model, resi: bindingRes.resi, chain: bindingRes.chain, atom: 'CA'},
                        true,
                    );
                    labelsHash[activeModel]["contactSites"].push(label);
                }
            }
            viewer.render();
        }
    }
    labelsVisible = !labelsVisible; // Toggle the visibility state

}

function toggleWatersVisibility() {
    if (watersVisible) {

        document.getElementById("waterButton").textContent = "HOH ✘";
        waterButton.style.borderColor = "#ffa500";
        waterButton.style.fontWeight = "normal";
        waterButton.style.color = "#ffa500";
        waterButton.style.borderWidth = "1px";

        
        if (activeModel == "superposition") {
            viewer.addStyle(suppLigsSels["water"], {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});
            // console.log(`Waters hidden for ${activeModel} models!`);
        }
        else {
            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}});
            // console.log(`Waters hidden for model ${activeModel}!`);
        }
    }
    else {

        document.getElementById("waterButton").textContent = "HOH ✓";
        waterButton.style.fontWeight = "bold";
        waterButton.style.color = "#007bff";
        waterButton.style.borderColor = "#007bff";
        waterButton.style.borderWidth = "2.5px";


        if (activeModel == "superposition") {
            viewer.addStyle(suppLigsSels["water"], {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
            // console.log(`Waters shown for ${activeModel} models!`);
        }
        else {
            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
            // console.log(`Waters shown for model ${activeModel}!`);
        }
        
    }
    watersVisible = !watersVisible;
    viewer.render();
}

function toggleLigandsVisibility() {
    if (ligandsVisible) {

        document.getElementById("ligandButton").textContent = "LIGAND ✘";
        ligandButton.style.borderColor = "#ffa500";
        ligandButton.style.fontWeight = "normal";
        ligandButton.style.color = "#ffa500";
        ligandButton.style.borderWidth = "1px";

        if (activeModel == "superposition") {
            viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle(suppLigsSels["clust_ions"], {sphere: {hidden: true, colorscheme: myScheme, radius: ionSphereRadius}});
            // console.log(`Ligands hidden for ${activeModel} model!`);
        }
        else {
            viewer.addStyle(
                {...hetAtomsNotHoh, model: activeModel},
                {stick: {hidden: true, radius: stickRadius}}
            )
            viewer.addStyle(
                {...ionAtoms, model: activeModel},
                {sphere: {hidden: true, radius: ionSphereRadius}}
            );
            // console.log(`Ligands hidden for model ${activeModel}!`);
        }

        if (contactsVisible) {

            document.getElementById("contactsButton").textContent = "CONTACT ✘";
            contactsButton.style.borderColor = "#ffa500";
            contactsButton.style.fontWeight = "normal";
            contactsButton.style.color = "#ffa500";
            contactsButton.style.borderWidth = "1px";


            // loop through contactCylinders and delete using removeShape, then empty list
            for (const cylinder of contactCylinders[activeModel]) {
                cylinder.updateStyle({hidden: true})
            }

            viewer.addStyle(
                {...protAtomsModel, model: activeModel},
                {
                    cartoon: {color: defaultColor},
                    stick: {hidden: true}
                }
            ); // remove ligand-interacting sticks and colour cartoon white

            if (labelsVisible) {
                for (label of labelsHash[activeModel]["contactSites"]) {
                    label.hide();
                }
            }

            if (surfaceVisible) {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { // hide surfaces of ligand-interacting residues
                    if (key == "lig_inters") {
                        for (const [key2, value2] of Object.entries(value)) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                        }
                    }
                    else if (key == "non_binding") {
                        if (clickedSite == null) {
                            for (const [key2, value2] of Object.entries(value)) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {opacity:surfLowOpacity, color: defaultColor});
                            }
                        }
                        else {
                            for (const [key2, value2] of Object.entries(value)) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {opacity:surfHiddenOpacity, color: defaultColor});
                            }
                        }
                    }
                    else {
                        if (clickedSite == null) {
                            for (const [key2, value2] of Object.entries(value)) {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value2.surfid, {opacity:surfMediumOpacity, color: siteColor});
                            }
                        }
                        else {
                            if (key == clickedSite) {
                                for (const [key2, value2] of Object.entries(value)) {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {opacity:surfHighOpacity, color: siteColor});
                                }
                            }
                        }
                        
                    }
                }
            }
            contactsVisible = false;
        }
    }
    else {

        document.getElementById("ligandButton").textContent = "LIGAND ✓";
        ligandButton.style.fontWeight = "bold";
        ligandButton.style.color = "#007bff";
        ligandButton.style.borderColor = "#007bff";
        ligandButton.style.borderWidth = "2.5px";

        if (activeModel == "superposition") {
            viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: false, colorscheme: myScheme, radius: stickRadius}});
            viewer.addStyle(suppLigsSels["clust_ions"],
                {sphere: {hidden: false, colorscheme: myScheme, radius: ionSphereRadius}
            });
            // console.log(`Ligands shown for ${activeModel} models!`);
        }
        else {
            viewer.addStyle(
                {...hetAtomsNotHoh, model: activeModel},
                {stick: {hidden: false, radius: stickRadius}}
            );
            viewer.addStyle(
                {...ionAtoms, model: activeModel},
                {sphere: {hidden: false, radius: ionSphereRadius}}
            );
            //console.log(`Ligands shown for model ${activeModel}!`);
        }
    }
    ligandsVisible = !ligandsVisible;
    viewer.render();
}

async function toggleContactsVisibility() {
    toggleSpinner1();
    try {
        if (contactsVisible) {

            document.getElementById("contactsButton").textContent = "CONTACT ✘";
            contactsButton.style.borderColor = "#ffa500";
            contactsButton.style.fontWeight = "normal";
            contactsButton.style.color = "#ffa500";
            contactsButton.style.borderWidth = "1px";

            let clickedElements = document.getElementsByClassName("clicked-row");

            if (surfaceVisible) { // if clicking off contacts button, but surface button still on (show site definition surfaces)
                
                if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                    let clickedElement = clickedElements[0];
                    let clickedElementId = clickedElement.id;
                    let siteColor = chartColors[Number(clickedElementId.split("_").pop())];
                    for (const [key, value] of Object.entries(surfsDict[activeModel]["lig_inters"])) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity});
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
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
                                }
                            }
                        }
                    }
                }
                
            }        

            if (labelsVisible) {
                for (label of labelsHash[activeModel]["contactSites"]) {
                    label.hide();
                }
            }

            for (const cylinder of contactCylinders[activeModel]) {
                cylinder.updateStyle({hidden: true})
            }

            if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                viewer.addStyle(
                    {model: activeModel, or:allBindingRess, not: {or: AssemblyClickedSiteResidues}},
                    {
                        cartoon:{color: defaultColor},
                        stick: {hidden: true}
                    }
                );            
            }
            else {
                viewer.addStyle(
                    {...protAtomsModel, model: activeModel},
                    {cartoon: {color: defaultColor}, stick: {hidden: true}}
                ); // needs to change if site is clicked
            }
            viewer.addStyle(
                {...hetAtomsNotHoh, model: activeModel},
                {stick: {hidden: true}}
            );
            viewer.addStyle(
                {...ionAtoms, model: activeModel},
                {sphere: {hidden: true}}
            );

            document.getElementById("ligandButton").textContent = "LIGAND ✘";
            ligandButton.style.borderColor = "#ffa500";
            ligandButton.style.fontWeight = "normal";
            ligandButton.style.color = "#ffa500";
            ligandButton.style.borderWidth = "1px";

            ligandsVisible = false;

            // console.log("Contacts removed!");
            contactsVisible = false;
            viewer.render();
        }
        else {
            if (contactCylinders[activeModel].length == 0) { // first time switching contacts on for this model
                await fetch(`${window.appBaseUrl}/user-get-contacts`, {
                    method: 'POST', // Use POST method to send data
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                        {
                            jobId: jobId,
                            sessionId: session_id,
                            submissionTime: submission_time,
                            strucFile: modelOrderRev[activeModel],
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
                        let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                        defaultColors.C = ligColor;
                        ligandSitesHash[activeModel][ligNam] = [[], ]; // i = 0 will be ligand-binding selection, i = 1 will be ligand molecule, and i = 2 color
                        for (let i = 0; i < protRess.length; i++) {
                            let protRes = protRess[i];
                            let protResn = protRes[0];
                            let protChain = protRes[1];
                            let protResi = protRes[2];
                            let sel = {model: activeModel, resi: protResi, chain: protChain, resn: protResn, not: {atom: bboneAtoms}};
                            ligandSitesHash[activeModel][ligNam][0].push(sel);

                            // add labels 
                            if (labelsVisible) {
                                let label = viewer.addLabel(
                                    protResn + String(Pdb2UpMapAssembly[protChain][protResi]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: ligColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: activeModel, resi: protResi, chain: protChain, resn: protResn, atom: 'CA'},
                                    true,
                                );
                                labelsHash[activeModel]["contactSites"].push(label);
                            }
                        }

                        ligandSitesHash[activeModel][ligNam].push({model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol})
                        ligandSitesHash[activeModel][ligNam].push(ligColor)
                        viewer.addStyle(
                            {model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]},
                            {
                                cartoon:{hidden: false, style: cartoonStyle, color: ligColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick: {hidden: false, colorscheme: defaultColors, radius: stickRadius}
                            }
                        );
                        console.log(ligNam, ligDat, ligColor, defaultColors['C']);

                        if (ionLigs.includes(ligMol)) {
                            viewer.addStyle(
                                {model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol},
                                {sphere: {hidden: false, colorscheme: defaultColors, radius: ionSphereRadius}});
                        }
                        else {
                            viewer.addStyle(
                                {model: activeModel, resi: ligResi, chain: ligChain, resn: ligMol},
                                {stick: {hidden: false, colorscheme: defaultColors, radius: stickRadius}}
                            );
                        }
                        // add ligand-interacting residues surfaces
                        surfsDict[activeModel]["lig_inters"][ligNam] = viewer.addSurface(
                            $3Dmol.SurfaceType.ISO,
                            {
                                color: ligColor,
                                opacity: surfHiddenOpacity,
                            },
                            {model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]},
                            {model: activeModel, or:ligandSitesHash[activeModel][ligNam][0]},
                        );
                        // if labels are on, show labels for ligand-interacting residues
                    }
                    allBindingRess = Object.values(ligandSitesHash[activeModel])
                        .map(item => item[0]) // Get the first element from each array
                        .flat();

                    if (surfaceVisible) {
                        let clickedElements = document.getElementsByClassName("clicked-row");
                        if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                            let clickedElement = clickedElements[0];
                            let clickedElementId = clickedElement.id;
                            for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                                if (key == "lig_inters") {
                                    for (const [key2, value2] of Object.entries(value)) {
                                        let ligColor = chartColors[strucProtData[key2][1]];
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: surfHighOpacity});
                                    }
                                }
                                else if (key == clickedElementId) {
                                    // pass
                                }
                                else {
                                    for (const [key2, value2] of Object.entries(value)) {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                                    }
                                }
                            }
                        }
                        else {
                            for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                                if (key == "lig_inters") {
                                    for (const [key2, value2] of Object.entries(value)) {
                                        let ligColor = chartColors[strucProtData[key2][1]];
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: surfHighOpacity});
                                    }
                                }
                                else {
                                    for (const [key2, value2] of Object.entries(value)) {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                                    }
                                }
                            }
                        }   
                    }
                    viewer.render();
                })
                .catch(error => console.error('Error fetching contacts:', error));
            }
            else { // if cylinders have already been created
                for (const cylinder of contactCylinders[activeModel]) {
                    cylinder.updateStyle({hidden: false})
                }

                for (const [resSel, ligSel, ligCol] of Object.values(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = ligCol;
                    viewer.addStyle(
                        {model: activeModel, or: resSel},
                        {
                            cartoon:{hidden: false, color: ligCol, style: cartoonStyle, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity},
                            stick: {hidden: false, colorscheme: defaultColors, radius: stickRadius}
                        }
                    );
                    if (ionLigs.includes(ligSel.resn)) {
                        viewer.addStyle(ligSel, {sphere: {hidden: false, colorscheme: defaultColors, radius: ionSphereRadius}});
                    }
                    else {
                        viewer.addStyle(ligSel, {stick: {hidden: false, colorscheme: defaultColors, radius: stickRadius}});
                    }
                }

                if (labelsVisible) {
                    for (const label of labelsHash[activeModel]["contactSites"]) {
                        label.show();
                    }
                }
                if (surfaceVisible) {
                    let clickedElements = document.getElementsByClassName("clicked-row");
                    if (clickedElements.length > 0) { // if a row is clicked i just show the surface of the clicked site
                        let clickedElement = clickedElements[0];
                        let clickedElementId = clickedElement.id;
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                            if (key == "lig_inters") {
                                for (const [key2, value2] of Object.entries(value)) {
                                    let ligColor = ligandSitesHash[activeModel][key2][2]
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: surfHighOpacity});
                                }
                            }
                            else if (key == clickedElementId) {
                                // pass
                            }
                            else {
                                for (const [key2, value2] of Object.entries(value)) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                                }
                            }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) { // show surfaces of ligand-interacting residues
                            if (key == "lig_inters") {
                                for (const [key2, value2] of Object.entries(value)) {
                                    let ligColor = ligandSitesHash[activeModel][key2][2]
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: ligColor, opacity: surfHighOpacity});
                                }
                            }
                            else {
                                for (const [key2, value2] of Object.entries(value)) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                                }
                            }
                        }
                    }   
                }
                viewer.render();
            }

            document.getElementById("contactsButton").textContent = "CONTACT ✓";
            contactsButton.style.fontWeight = "bold";
            contactsButton.style.color = "#007bff";
            contactsButton.style.borderColor = "#007bff";
            contactsButton.style.borderWidth = "2.5px";

            contactsVisible = true;
        }
    } finally {
        toggleSpinner1();
    }
}
