let previousSelection = 'Superposition'; // Default initial selection

function populateMenu() {
    const menu = document.querySelector('.dropup-content');
    menu.innerHTML = ''; // Clear previous entries
    const superpositionOption = document.createElement('a');
    superpositionOption.href = "#";
    superpositionOption.textContent = 'Superposition';
    superpositionOption.onclick = () => selectOption('Superposition');
    menu.appendChild(superpositionOption);

    assemblyPdbIds.forEach(id => {
        const option = document.createElement('a');
        option.href = "#";
        option.textContent = id.split(".")[0];
        option.onclick = () => selectOption(id);
        menu.appendChild(option);
    });
}

async function selectOption(option) {
    toggleSpinner1();
    if (option !== previousSelection) { // if the option is changed, otherwise do nothing
        const strucName = option.split(".")[0]; // Name of the structure
        const button = document.querySelector('.dropup-button');
        button.textContent = option.split(".")[0]; // Update the button text

        let clickedElements = document.getElementsByClassName("clicked-row");

        if (watersVisible) { // if waters were visible, hide them
            viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}}); // hide all water molecules from superposition
        }

        if (labelsVisible) { // if labels were visible, hide them
            for ([key, value] of Object.entries(labelsHash[activeModel])) {
                if (key === 'hoveredRes') {
                    for (const label of value) {
                        label.hide();
                    }
                }
                else if (key === 'contactSites') {
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
                else if (key === 'clickedResidues') {
                    for (const [key2, value2] of Object.entries(value[CurrentDisplayedSite])) {
                        value2.hide(); // value 2 is a label object
                    }
                }
            }
        }

        if (previousSelection === 'Superposition') { // changing from Ligand Superposition to any assembly

            if (surfaceVisible) { // if surface was visible, hide it

                for (const [key, value] of Object.entries(surfsDict["superposition"])) { // hiding all surfaces from ligand superposition
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                    }
                    else if (key == "single_residues") {
                        for (const [key2, value2] of Object.entries(value[CurrentDisplayedSite])) {
                            let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity}); // hiding surfaces of supp single residues
                        }
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                    }
                }
            }

            if (ligandsVisible) { // if ligands were visible, hide them

                viewer.addStyle(suppLigsSels["not_clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
            }

            viewer.setHoverable({model: suppModels}, false, // Hovering disabled for ligand superposition models (otherwise get wrong labels)
                showHoverLabelNoModel,
                removeHoverLabel,
            );

            if (strucName in strucCount) {

                contactsButton.disabled = false;
                contactsButton.style.borderColor = "#ffa500";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "#ffa500";
                contactsButton.style.borderWidth = "1px";

                saveStructureButton.disabled = false;
                saveStructureButton.style.color = 'black';  // Active font color
                saveStructureButton.style.borderColor = 'black';  // Active font color
                saveStructureDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

                saveArpeggioDataButton.disabled = false;
                saveArpeggioDataButton.style.color = 'black';  // Active font color
                saveArpeggioDataButton.style.borderColor = 'black';  // Active font color
                saveStructureContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);
            } else {
                contactsButton.disabled = true;
                contactsButton.style.borderColor = "darkgray";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "darkgray";
                contactsButton.style.borderWidth = "1px";

                saveStructureButton.disabled = true;
                saveStructureButton.style.color = 'darkgray';  // Active font color
                saveStructureButton.style.borderColor = 'darkgray';  // Active font color
                saveStructureDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                saveArpeggioDataButton.disabled = true;
                saveArpeggioDataButton.style.color = 'darkgray';  // Active font color
                saveArpeggioDataButton.style.borderColor = 'darkgray';  // Active font color
                saveStructureContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);
            }

            for (const model of suppModels) { // hide ligand superposition models using suppModels array
                viewer.getModel(model).hide();
            }

            await openStructure(option); // act here if model is already open
            let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
            if (clickedElements.length > 0) {
                clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site
                let siteAssemblyPDBResNum = seg_ress_dict[clickedElements[0].id]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
                siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                AssemblyClickedSiteResidues = siteAssemblyPDBResNums;  

                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                    {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick:{color: clickedSiteColor,}, }
                );
                
                if (labelsVisible) {
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
                                    resSel, //{model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    false,
                                );
                                labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                            }
                        }
                    }
                }

                if (surfaceVisible) {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key !== "lig_inters") {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == clickedPointLabel) {
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: clickedSiteColor, opacity: surfHighOpacity});
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                }
                            }
                        }
                    }
                }
            }
            else { // no clicked binding site
                if (surfaceVisible) {
                    if (clickedBindingRess.length == 0) { // if no binding site was clicked, show all surfaces
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
                    else {
                        for (const bindingRes of clickedBindingRess) {
                        let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                        if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                            for (const [chain, resi] of bindingResPDBResNum) {
                                let ResKey = chain + "_" + resi; // create a key for the residue
                                if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                }
                                else {
                                    let surfSel = {model: activeModel, resi: resi, chain: chain};
                                    let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                        .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                                        .flatMap(el => {
                                            let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                                            return dataArray.map(data => {
                                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                            });
                                        }
                                    );
                                    let SiteSel = {model: activeModel, or: SitePDBResNums};
                                    surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                        $3Dmol.SurfaceType.ISO,
                                        {
                                            color: currentSiteColor,
                                            opacity: surfHighOpacity,
                                        },
                                        surfSel,
                                        SiteSel,
                                    );
                                }
                            }
                        }
                    }                    
                }
                if (labelsVisible) {
                    if (clickedBindingRess.length > 0) {
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                            if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                for (const [chain, resi] of bindingResPDBResNum) {
                                    let ResKey = chain + "_" + resi; // create a key for the residue
                                    if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                                    }
                                    else {
                                        let resSel = {model: activeModel, resi: resi, chain: chain};
                                        let resName = viewer.selectedAtoms(resSel)[0].resn;
                                        let label = viewer.addLabel(
                                            resName + String(Pdb2UpMapAssembly[chain][resi]),
                                            {
                                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                                font: 'Arial', fontColor: currentSiteColor, fontOpacity: 1, fontSize: 12,
                                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                            },
                                            resSel,
                                            false,
                                        );
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // show sidechains of clicked residues
                if (clickedBindingRess.length > 0) { // if binding residues were clicked, show sidechains
                    for (const bindingRes of clickedBindingRess) {
                        let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                        if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                            for (const [chain, resi] of bindingResPDBResNum) {
                                viewer.setStyle(
                                    {model: activeModel, chain: chain, resi: resi, not: {atom: bboneAtoms}},
                                    {cartoon: {hidden: false, style: cartoonStyle, color: currentSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity},
                                    stick: {hidden: false, color: currentSiteColor, radius: stickRadius}
                                    }
                                );
                            }
                        }
                    }
                }
            }

            if (ligandsVisible) {
                viewer.addStyle(
                {...hetAtomsNotHoh, model: activeModel},
                {stick: {hidden: false, radius: stickRadius}}
                );
                viewer.addStyle(
                    {...ionAtoms, model: activeModel},
                    {sphere: {hidden: false, radius: ionSphereRadius}}
                );
            }
            viewer.render();
        }

        if (previousSelection !== 'Superposition') {

            if (contactsVisible) { // if contacts were visible, hide them}

                // loop through contactCylinders and hide using updateStyle
                for (const cylinder of contactCylinders[activeModel]) {
                    cylinder.updateStyle({hidden: true})
                }

                document.getElementById("contactsButton").textContent = "CONTACT ✘";
                contactsButton.style.borderColor = "#ffa500";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "#ffa500";
                contactsButton.style.borderWidth = "1px";

                contactsVisible = false;
            }

            if (surfaceVisible) { // if surface was visible, hide it
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key == "lig_inters") {
                        //
                    }
                    if (key !== "single_residues") {
                        for (const [key2, value2] of Object.entries(value)) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                        }
                    }
                    else {
                        let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                        for (const [key2, value2] of Object.entries(value[CurrentDisplayedSite])) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity}); // hiding surfaces of assembly single residues
                        }
                    }
                }
            }

            if (ligandsVisible) { // if ligands were visible, hide them
                viewer.addStyle(
                    {...hetAtomsNotHoh, model: activeModel},
                    {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}}
                );
            }

            if (option !== 'Superposition') { // CHANGING FROM ASSEMBLY TO DIFFERENT ASSEMBLY

                viewer.setHoverable({model: activeModel}, false, // Hovering disabled for previous assembly
                    showHoverLabelNoModel,
                    removeHoverLabel,
                );

                viewer.getModel(activeModel).hide(); // Hide the active assembly

                await openStructure(option); // act heere if model is not already open

                if (strucName in strucCount) { // if the structure is in the strucCount dictionary, enable contacts and save buttons

                    contactsButton.disabled = false;
                    contactsButton.style.borderColor = "#ffa500";
                    contactsButton.style.fontWeight = "normal";
                    contactsButton.style.color = "#ffa500";
                    contactsButton.style.borderWidth = "1px";

                    saveStructureButton.disabled = false;
                    saveStructureButton.style.color = 'black';  // Active font color
                    saveStructureButton.style.borderColor = 'black';  // Active font color
                    saveStructureDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

                    saveArpeggioDataButton.disabled = false;
                    saveArpeggioDataButton.style.color = 'black';  // Active font color
                    saveArpeggioDataButton.style.borderColor = 'black';  // Active font color
                    saveStructureContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);
                } else {
                    contactsButton.disabled = true;
                    contactsButton.style.borderColor = "darkgray";
                    contactsButton.style.fontWeight = "normal";
                    contactsButton.style.color = "darkgray";
                    contactsButton.style.borderWidth = "1px";

                    saveStructureButton.disabled = true;
                    saveStructureButton.style.color = 'darkgray';  // Active font color
                    saveStructureButton.style.borderColor = 'darkgray';  // Active font color
                    saveStructureDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                    saveArpeggioDataButton.disabled = true;
                    saveArpeggioDataButton.style.color = 'darkgray';  // Active font color
                    saveArpeggioDataButton.style.borderColor = 'darkgray';  // Active font color
                    saveStructureContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);
                }
                if (clickedElements.length > 0) {
                    clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                    let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site
                    let siteAssemblyPDBResNum = seg_ress_dict[clickedElements[0].id]
                        .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                    AssemblyClickedSiteResidues = siteAssemblyPDBResNums;  

                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick:{color: clickedSiteColor,}, }
                    );
                    
                    if (labelsVisible) {
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
                                        resSel, // {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                        false,
                                    );
                                    labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                                }
                            }
                        }
                    }

                    if (surfaceVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            if (key !== "lig_inters") {
                                for (const [key2, value2] of Object.entries(value)) {
                                    if (key == clickedPointLabel) {
                                        viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: clickedSiteColor, opacity: surfHighOpacity});
                                    }
                                    else {
                                        viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][key2].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    if (surfaceVisible) {
                        if (clickedBindingRess.length == 0) { // if no binding site was clicked, show all surfaces
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
                        else {
                            let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                            for (const bindingRes of clickedBindingRess) {
                                let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                                if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                    for (const [chain, resi] of bindingResPDBResNum) {
                                        let ResKey = chain + "_" + resi; // create a key for the residue
                                        if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                            var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                        }
                                        else {
                                            let surfSel = {model: activeModel, resi: resi, chain: chain};
                                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                                .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                                                .flatMap(el => {
                                                    let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                                                    return dataArray.map(data => {
                                                        return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                                    });
                                                }
                                            );
                                            let SiteSel = {model: activeModel, or: SitePDBResNums};
                                            surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                                $3Dmol.SurfaceType.ISO,
                                                {
                                                    color: currentSiteColor,
                                                    opacity: surfHighOpacity,
                                                },
                                                surfSel,
                                                SiteSel,
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (labelsVisible) { // if labels were visible, show them. This is for clicked residues (they might not exist, as this is a new assembly)
                        let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                            if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                for (const [chain, resi] of bindingResPDBResNum) {
                                    let ResKey = chain + "_" + resi; // create a key for the residue
                                    if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                                    }
                                    else {
                                        let resSel = {model: activeModel, resi: resi, chain: chain};
                                        let resName = viewer.selectedAtoms(resSel)[0].resn;
                                        let label = viewer.addLabel(
                                            resName + String(Pdb2UpMapAssembly[chain][resi]),
                                            {
                                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                                font: 'Arial', fontColor: currentSiteColor, fontOpacity: 1, fontSize: 12,
                                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                            },
                                            resSel,
                                            false,
                                        );
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label;
                                    }
                                }
                            }
                        }
                    }
                    // show sidechains of clicked residuesAdd commentMore actions
                    if (clickedBindingRess.length > 0) { // if binding residues were clicked, show sidechains
                        let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbMapAssembly[bindingRes];
                            if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                for (const [chain, resi] of bindingResPDBResNum) {
                                    viewer.setStyle(
                                        {model: activeModel, chain: chain, resi: resi, not: {atom: bboneAtoms}},
                                        {cartoon: {hidden: false, style: cartoonStyle, color: currentSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity},
                                        stick: {hidden: false, color: currentSiteColor, radius: stickRadius}
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                if (ligandsVisible) {
                    viewer.addStyle(
                    {...hetAtomsNotHoh, model: activeModel},
                    {stick: {hidden: false, radius: stickRadius}}
                    );
                    viewer.addStyle(
                        {...ionAtoms, model: activeModel},
                        {sphere: {hidden: false, radius: ionSphereRadius}}
                    );
                }
                viewer.render();
            }
            else { // CHANGING FROM ASSEMBLY BACK TO SUPERPOSITION
                document.getElementById("ligandButton").textContent = "LIGAND ✓"; // NOW, LIGANDS ALWAYS  SHOWN AFTER GOING BACK TO SUPERPOSITION
                ligandButton.style.borderColor = "#007bff";
                ligandButton.style.fontWeight = "bold";
                ligandButton.style.color = "#007bff";
                ligandButton.style.borderWidth = "2.5px";
                ligandsVisible = true;

                contactsButton.disabled = true;
                // document.getElementById("ligandButton").textContent = "LIGAND ✘";
                contactsButton.style.borderColor = "darkgray";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "darkgray";
                contactsButton.style.borderWidth = "1px";

                saveStructureButton.disabled = true;
                saveStructureButton.style.color = 'darkgray';  // Active font color
                saveStructureButton.style.borderColor = 'darkgray';  // Active font color
                saveStructureDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                saveArpeggioDataButton.disabled = true;
                saveArpeggioDataButton.style.color = 'darkgray';  // Active font color
                saveArpeggioDataButton.style.borderColor = 'darkgray';  // Active font color
                saveStructureContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                console.log(`Reading SIFTS mapping for ${protAtomsStruc}`);

                for (let i = 0; i <= simplePdbs.length-1; i++) {
                    viewer.getModel(i).show(); // Show all ligand superposition models
                }

                viewer.getModel(activeModel).hide(); // Hide the active assembly

                activeModel = 'superposition';

                // add currently displayed site to surfsDict and labelsHashAdd commentMore actions
                if (!surfsDict[activeModel]["single_residues"].hasOwnProperty(CurrentDisplayedSite)) {
                    surfsDict[activeModel]["single_residues"][CurrentDisplayedSite] = {}; 
                }
                if (!labelsHash[activeModel]["clickedResidues"].hasOwnProperty(CurrentDisplayedSite)) {
                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite] = {};
                }

                viewer.setHoverable({model: suppModels}, true, // Hovering re-enabled for superposition
                    showHoverLabel,
                    removeHoverLabel,
                );

                viewer.setStyle(
                    {model: protAtomsModel},
                    {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity, gapcutoff: gapCutOff}}
                );

                viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: false, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle(suppLigsSels["clust_ions"], {sphere: {hidden: false, colorscheme: myScheme, radius: ionSphereRadius}});

                if (watersVisible) { // if waters were visible, show them
                    viewer.addStyle(suppLigsSels["water"], {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
                }
                
                if (clickedElements.length > 0) {
                    clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                    let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site
                    siteSuppPDBResNums = seg_ress_dict[clickedElements[0].id]
                        .filter(el => Up2PdbDict.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbDict[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    
                    SuppClickedSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}};

                    viewer.setStyle(
                        SuppClickedSiteResidues,
                        {
                            cartoon: {style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                            stick:{color: clickedSiteColor},
                        },
                    );
                    if (labelsVisible) {
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
                                        resSel, // {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                        true,
                                    );
                                    labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                                }
                            }
                        }
                    }
                    if (surfaceVisible) {
                        let surfid = surfsDict["superposition"][clickedElementId].surfid;
                        viewer.setSurfaceMaterialStyle(surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // show ONLY surface of clicked row
                    }
                }
                else { // no binding site is clicked
                    let currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                    if (surfaceVisible) {
                        if (clickedBindingRess.length == 0) { // if no binding site was clicked, show all surfaces
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
                            for (const res of clickedBindingRess) {
                                let bindingResPDBResNum = Up2PdbDict[res];
                                if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                    for (const [chain, resi] of bindingResPDBResNum) {
                                        let ResKey = chain + "_" + resi; // create a key for the residue
                                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                            var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                        }
                                        else {
                                            let surfSel = {model: protAtomsModel, resi: resi, chain: chain};
                                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                                .filter(el => Up2PdbDict.hasOwnProperty(el))
                                                .flatMap(el => {
                                                    let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                                    return dataArray.map(data => {
                                                        return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                                    });
                                                }
                                            );
                                            let SiteSel = {model: protAtomsModel, or: SitePDBResNums};
                                            surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                                $3Dmol.SurfaceType.ISO,
                                                {
                                                    color: currentSiteColor,
                                                    opacity: surfHighOpacity,
                                                },
                                                surfSel,
                                                SiteSel,
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (labelsVisible) { // if labels were visible, show them. This is for clicked residues (they might already exist)
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbDict[bindingRes];
                            if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                for (const [chain, resi] of bindingResPDBResNum) {
                                    let ResKey = chain + "_" + resi; // create a key for the residue
                                    if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                                    }
                                    else {
                                        let resSel = {model: protAtomsModel, resi: resi, chain: chain};
                                        let resName = viewer.selectedAtoms(resSel)[0].resn;
                                        let label = viewer.addLabel(
                                            resName + String(Pdb2UpDict[chain][resi]),
                                            {
                                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                                font: 'Arial', fontColor: currentSiteColor, fontOpacity: 1, fontSize: 12,
                                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                            },
                                            resSel,
                                            true,
                                        );
                                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label;
                                    }
                                }
                            }
                        }
                    }
                    if (clickedBindingRess.length > 0) { // if binding residues were clicked, show sidechains
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbDict[bindingRes];
                            if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                for (const [chain, resi] of bindingResPDBResNum) {
                                    viewer.setStyle(
                                        {model: protAtomsModel, chain: chain, resi: resi, not: {atom: bboneAtoms}},
                                        {cartoon: {hidden: false, style: cartoonStyle, color: currentSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity},
                                        stick: {hidden: false, color: currentSiteColor, radius: stickRadius}
                                        }
                                    );
                                }
                            }
                        }
                    }
                }

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

                viewer.render();
            }
        }

        previousSelection = option; // Update the previous selection
    }
    toggleSpinner1();
    toggleMenu(); // Optionally hide the menu after selection
}

let modelID;

function openStructure(pdbId) {
    return new Promise((resolve, reject) => {
        // Example function call to 3DMol.js to load a structure
        console.log("Opening structure:", pdbId);

        let pdbUri = `${window.appBaseUrl}/user-files/${session_id}/${submission_time}/supp_cifs/${pdbId}`; // Updated path to assembly cif
        
        $.ajax({ // get UniProt residue mappings when loading a new assembly
            type: 'POST', 
            url: `${window.appBaseUrl}/user-get-uniprot-mapping`, // server route
            contentType: 'application/json;charset=UTF-8',
            // data sent to the server
            data: JSON.stringify({
                'jobId': jobId,
                'pdbFile': pdbId,
                'session_id': session_id,
                'submission_time': submission_time,
            }),
            // beforeSend: function() {
            //     toggleSpinner();
            // },
            success: function(response) {

                let allMappings = response; // extract the different mapping dictionaries
                console.log(`Reading SIFTS mapping for ${pdbId}`)
                Pdb2UpMapAssembly = allMappings['pdb2up'];
                Up2PdbMapAssembly = allMappings['up2pdb'];

                console.log('UniProt mappings received!');

                jQuery.ajax( pdbUri, { 
                    success: function(data) {


                        if (pdbId in modelOrder) { // if the model is already loaded, just show it
                            console.log(`Model has already been loaded with modelID = ${modelOrder[pdbId]}!`);
                            modelID = modelOrder[pdbId];
                            activeModel = modelID;
                            viewer.getModel(modelID).show(); // Show the model

                            // add currently displayed site to surfsDict and labelsHashAdd commentMore actions
                            if (!surfsDict[activeModel]["single_residues"].hasOwnProperty(CurrentDisplayedSite)) {
                                surfsDict[activeModel]["single_residues"][CurrentDisplayedSite] = {}; // Initialize dictionary for the new assembly
                            }
                            if (!labelsHash[activeModel]["clickedResidues"].hasOwnProperty(CurrentDisplayedSite)) {
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite] = {}; // Initialize dictionary for the new assembly
                            }
                        }
                        else {
                            let model = viewer.addModel(data, "cif", {unboundCations: true}); // Load data
                            let hydrogenAtoms = model.selectedAtoms({elem: "H"}); // Get hydrogen atoms
                            model.removeAtoms(hydrogenAtoms); // Remove hydrogen atoms
                            modelID = model.getID(); // Gets the ID of the GLModel
                            activeModel = modelID;
                            surfsDict[activeModel] = {"non_binding": {}, "lig_inters": {}, "single_residues": {[CurrentDisplayedSite]: {}}}; // Initialize dictionary for the new assembly
                            labelsHash[activeModel] =  {"clickedSite": {}, "hoveredRes": [], "contactSites": [], "clickedResidues": {[CurrentDisplayedSite]:{}}};

                            // implement surface addition for binding sites
                
                            for (const [key, value] of Object.entries(seg_ress_dict)) { 

                                if (key !== "ALL_BINDING") {
                                    surfsDict[activeModel][key] = {}; // Initialize dictionary for each binding site
                                }

                                let surfAssemblyPDBResNums = seg_ress_dict[key]
                                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                                    .flatMap(el => {
                                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                                        return dataArray.map(data => {
                                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                        });
                                    });
                                    
                                if (key == "ALL_BINDING") {
                            
                                    surfsDict[activeModel]["non_binding"][element] = viewer.addSurface(
                                        $3Dmol.SurfaceType.ISO,
                                        {
                                            color: defaultColor,
                                            opacity: surfHiddenOpacity,
                                        },
                                        {...protAtoms, model: activeModel, not:{or: surfAssemblyPDBResNums}},
                                        {...protAtoms, model: activeModel, not:{or: surfAssemblyPDBResNums}},
                                    );
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    surfsDict[activeModel][key][element] = viewer.addSurface(
                                        $3Dmol.SurfaceType.ISO,
                                        {
                                            color: siteColor,
                                            opacity: surfHiddenOpacity,
                                        },
                                        {...protAtoms, model: activeModel, or: surfAssemblyPDBResNums},
                                        {...protAtoms, model: activeModel, or: surfAssemblyPDBResNums},
                                    );
                                }
                            }

                            let baseName = pdbUri.split("/").pop() // Name of the structure (.cif) file
                            let pdbID = baseName// .split("_")[0]; // PDB ID from file name
                            ligandSitesHash[activeModel] = {};
                            modelOrder[baseName] = modelID; // populate dictionary
                            modelOrderRev[modelID] = pdbID; // populate dictionary
                            models.push(model); // add model at the end of list
                            loadedCount++; // Increment counter

                            contactCylinders[activeModel] = []; // Initialize contactCylinders for the new assembly (previous ones are untouched and keep their cylinders)
                        }
            
                        viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity, gapcutoff: gapCutOff}});
                        
                        if (watersVisible) { // if waters were visible, show them
                            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
                        }

                        // viewer.center({model: modelID});
                        // viewer.zoomTo({model: modelID})
            
                        viewer.setHoverable({model: modelID}, true,  // Hovering enabled for new assembly
                            showHoverLabelNoModel,
                            removeHoverLabel,
                        );

                        viewer.setClickable(
                            {model: activeModel}, // Select all atoms or define specific criteria
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

                        //slab = viewer.getSlab();Add commentMore actions
                        // initialNearSlab = slab['near'];
                        // initialFarSlab = slab['far'];
                        initialNearSlab = -1000; // Set initial near slab to -1000
                        initialFarSlab = 1000; // Set initial far slab to 1000
                        nearPlane = Math.trunc(initialNearSlab);
                        farPlane = Math.trunc(initialFarSlab);
                        viewer.setSlab(initialNearSlab, initialFarSlab); // Set slab clipping planes

                        nearSlider.min = initialNearSlab;
                        nearSlider.max = initialFarSlab;
                        nearSlider.value = initialNearSlab;
                        
                        farSlider.min = initialNearSlab;
                        farSlider.max = initialFarSlab;
                        farSlider.value = initialFarSlab;

                        viewer.render();

                        resolve();
                    },
                    error: function(hdr, status, err) {
                        console.error( "Failed to load PDB " + pdbUri + ": " + err );
                    },
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Request failed:');
                console.error('Status:', textStatus);
                console.error('Error:', errorThrown);
                console.error('Response:', jqXHR.responseText);
            },
            // complete: function() {
            //     toggleSpinner();
            // }
        });
    });
}

// Function to toggle the visibility of the dropup content
function toggleMenu() {
    const content = document.querySelector('.dropup-content');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

document.querySelector('.dropup-button').addEventListener('click', toggleMenu);
document.addEventListener('DOMContentLoaded', populateMenu);