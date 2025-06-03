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
        option.textContent = id;
        option.onclick = () => selectOption(id);
        menu.appendChild(option);
    });
}

async function selectOption(option) {
    toggleSpinner1(); // Show spinner
    if (option !== previousSelection) { // if the option is changed, otherwise do nothing
        const button = document.querySelector('.dropup-button');
        button.textContent = option;

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
            }
        }

        if (previousSelection === 'Superposition') { // changing from Ligand Superposition to any assembly

            if (surfaceVisible) { // if surface was visible, hide it

                for (const [key, value] of Object.entries(surfsDict["superposition"])) { // hiding all surfaces from ligand superposition
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                    }
                }
            }

            if (ligandsVisible) { // if ligands were visible, hide them

                viewer.addStyle(suppLigsSels["not_clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle(suppLigsSels["clust_ions"], {sphere: {hidden: true, colorscheme: myScheme, radius: ionSphereRadius}});
                viewer.addStyle(suppLigsSels["not_clust_ions"], {sphere: {hidden: true, colorscheme: myScheme, radius: ionSphereRadius}});

                // Not changing the ligand button text here, but still need to show them!
                
                // document.getElementById("ligandButton").textContent = "LIGAND ✘";
                // ligandButton.style.borderColor = "#ffa500";
                // ligandButton.style.fontWeight = "normal";
                // ligandButton.style.color = "#ffa500";
                // ligandButton.style.borderWidth = "1px";

                // ligandsVisible = false;
            }

            viewer.setHoverable({model: suppModels}, false, // Hovering disabled for ligand superposition models (otherwise get wrong labels)
                showHoverLabel,
                removeHoverLabel,
            );

            contactsButton.disabled = false;

            contactsButton.style.borderColor = "#ffa500";
            contactsButton.style.fontWeight = "normal";
            contactsButton.style.color = "#ffa500";
            contactsButton.style.borderWidth = "1px";

            saveAssemblyButton.disabled = false;
            saveAssemblyButton.style.color = 'black';  // Active font color
            saveAssemblyButton.style.borderColor = 'black';  // Active font color
            saveAssemblyDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

            saveArpeggioDataButton.disabled = false;
            saveArpeggioDataButton.style.color = 'black';  // Active font color
            saveArpeggioDataButton.style.borderColor = 'black';  // Active font color
            saveAssemblyContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

            for (const model of suppModels) { // hide ligand superposition models using suppModels array
                viewer.getModel(model).hide();
            }

            await openStructure(option); // act here if model is already open

            if (clickedElements.length > 0) {
                let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                let pointColor = chartColors[clickedPointLabel]; // color of the clicked data point
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let siteAssemblyPDBResNum = seg_ress_dict[clickedPointLabel]
                        .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                        .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                    siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                
                    let assemblySel = {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}};
                    AssemblyClickedSiteResidues.push(assemblySel);
                });
                viewer.setStyle(
                    {model: activeModel, or: AssemblyClickedSiteResidues},
                    {
                        cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: pointColor},
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
                            // console.log(`Site ${clickedElementId} not clicked yet. Creating labels...`);
                            labelsHash[activeModel]["clickedSite"][clickedElementId] = [];
                            siteAssemblyPDBResNums = [];
                            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                let siteAssemblyPDBResNum = seg_ress_dict[clickedElementId]
                                    .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                    .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                            });
                            for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                                for (siteAssemblyPDBResNumber of siteAssemblyPDBResNum) { // variable name not ideal as siteAssemblyPDBResNum is an array
                                    let resSel = {model: activeModel, resi: siteAssemblyPDBResNumber, chain: element}
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
                                    labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                                }
                            }
                        }
                    // viewer.render();
                    }
                }

                if (surfaceVisible) {
                    // let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                    // let pointColor = chartColors[clickedPointLabel]; // color of the clicked data point
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key == "lig_inters") {
                            // pass
                        }
                        else {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == clickedPointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity: surfHighOpacity});
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                }
                            }
                        }
                    }
                }
            }
            else {
                if (surfaceVisible) {
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
            if (ligandsVisible) { // if ligands were visible, show them
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

                document.getElementById("contactsButton").textContent = "CONTACTS ✘";
                contactsButton.style.borderColor = "#ffa500";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "#ffa500";
                contactsButton.style.borderWidth = "1px";

                contactsVisible = false;
            }

            if (surfaceVisible) { // if surface was visible, hide it
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { 
                    for (const [key2, value2] of Object.entries(value)) {
                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                    }
                }
            }

            if (ligandsVisible) { // if ligands were visible, hide them
                viewer.addStyle(
                    {...hetAtomsNotHoh, model: activeModel},
                    {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}}
                );

                // document.getElementById("ligandButton").textContent = "LIGAND ✘";
                // ligandButton.style.borderColor = "#ffa500";
                // ligandButton.style.fontWeight = "normal";
                // ligandButton.style.color = "#ffa500";
                // ligandButton.style.borderWidth = "1px";

                // ligandsVisible = false;
            }

            viewer.setHoverable({model: activeModel}, false, // Hovering disabled for previous assembly
                showHoverLabel,
                removeHoverLabel,
            );

            if (option !== 'Superposition') { // CHANGINF FROM ASSEMBLY TO A DIFFERENT ASSEMBLY

                viewer.getModel(activeModel).hide(); // Hide the active assembly

                await openStructure(option); // act heere if model is not already open

                contactsButton.disabled = false;

                contactsButton.style.borderColor = "#ffa500";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "#ffa500";
                contactsButton.style.borderWidth = "1px";

                // document.getElementById("ligandButton").textContent = "LIGAND ✘"; // NOW, LIGANDS ALWAYS  SHOWN AFTER GOING BACK TO SUPERPOSITION
                // ligandButton.style.borderColor = "##ffa500";
                // ligandButton.style.fontWeight = "normal";
                // ligandButton.style.color = "##ffa500";
                // ligandButton.style.borderWidth = "1px";
                // ligandsVisible = false;

                saveAssemblyButton.disabled = false;
                saveAssemblyButton.style.color = 'black';  // Active font color
                saveAssemblyButton.style.borderColor = 'black';  // Active font color
                saveAssemblyDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

                saveArpeggioDataButton.disabled = false;
                saveArpeggioDataButton.style.color = 'black';  // Active font color
                saveArpeggioDataButton.style.borderColor = 'black';  // Active font color
                saveAssemblyContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download.svg`);

                //let clickedElements = document.getElementsByClassName("clicked-row");
                if (clickedElements.length > 0) {
                    let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                    let pointColor = chartColors[clickedPointLabel]; // color of the clicked data point
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let siteAssemblyPDBResNum = seg_ress_dict[clickedPointLabel]
                            .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                            .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                        siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                    
                        let assemblySel = {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}};
                        AssemblyClickedSiteResidues.push(assemblySel);
                    });
                    viewer.setStyle(
                        {model: activeModel, or: AssemblyClickedSiteResidues},
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
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
                                // console.log(`Site ${clickedElementId} not clicked yet. Creating labels...`);
                                labelsHash[activeModel]["clickedSite"][clickedElementId] = [];
                                siteAssemblyPDBResNums = [];
                                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                    let siteAssemblyPDBResNum = seg_ress_dict[clickedElementId]
                                        .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                        .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                    siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                                });
                                for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                                    for (siteAssemblyPDBResNumber of siteAssemblyPDBResNum) { // variable name not ideal as siteAssemblyPDBResNum is an array
                                        let resSel = {model: activeModel, resi: siteAssemblyPDBResNumber, chain: element}
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
                                        labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                                    }
                                }
                            }
                        }
                    }
                    if (surfaceVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            if (key == "lig_inters") {
                                // pass
                            }
                            else {
                                for (const [key2, value2] of Object.entries(value)) {
                                    if (key == clickedPointLabel) {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity: surfHighOpacity});
                                    }
                                    else {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                    }
                                }
                            }
                        }
                    }
                    viewer.render();
                } 
                else {
                    if (surfaceVisible) {
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
                if (ligandsVisible) { // if ligands were visible, show them
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
            else { // CHANGING FROM ASSEMBLY TO SUPERPOSITION
                document.getElementById("ligandButton").textContent = "LIGAND ✓"; // NOW, LIGANDS ALWAYS  SHOWN AFTER GOING BACK TO SUPERPOSITION
                ligandButton.style.borderColor = "#007bff";
                ligandButton.style.fontWeight = "bold";
                ligandButton.style.color = "#007bff";
                ligandButton.style.borderWidth = "2.5px";
                ligandsVisible = true;

                contactsButton.disabled = true;
                contactsButton.style.borderColor = "darkgray";
                contactsButton.style.fontWeight = "normal";
                contactsButton.style.color = "darkgray";
                contactsButton.style.borderWidth = "1px";

                saveAssemblyButton.disabled = true;
                saveAssemblyButton.style.color = 'darkgray';  // Active font color
                saveAssemblyButton.style.borderColor = 'darkgray';  // Active font color
                saveAssemblyDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                saveArpeggioDataButton.disabled = true;
                saveArpeggioDataButton.style.color = 'darkgray';  // Active font color
                saveArpeggioDataButton.style.borderColor = 'darkgray';  // Active font color
                saveAssemblyContactsDownloadIcon.setAttribute('src', `${window.appBaseUrl}/static/images/download_gray.svg`);

                // console.log(`Reading SIFTS mapping for ${repPdbId} chain ${repPdbChainId}`);

                for (let i = 0; i <= simplePdbs.length-1; i++) {
                    viewer.getModel(i).show(); // Show all ligand superposition models
                }

                viewer.getModel(activeModel).hide(); // Hide the active assembly

                activeModel = 'superposition';

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

                //viewer.center({model: protAtomsModel}); // center on suppModels again
                //viewer.zoomTo({model: protAtomsModel});
                if (clickedElements.length > 0) {
                    let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
                    let pointColor = chartColors[clickedPointLabel]; // color of the clicked data point
                        siteSuppPDBResNums = seg_ress_dict[clickedPointLabel]
                        .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                        .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
                    
                    SuppClickedSiteResidues = {model: protAtomsModel, resi: siteSuppPDBResNums, chain: authAsymId, not: {atom: bboneAtoms}};

                    viewer.setStyle(
                        SuppClickedSiteResidues,
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
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
                                // console.log(`Site ${clickedElementId} not clicked yet. Creating labels...`);
                                labelsHash[activeModel]["clickedSite"][clickedElementId] = [];
                                let siteSuppPDBResNums = seg_ress_dict[clickedElementId]
                                    .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                                    .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
        
                                console.log(`Site ${clickedElementId} residues: ${siteSuppPDBResNums}`);
                                for (siteSuppPDBResNum of siteSuppPDBResNums) {
                                    let resSel = {model: protAtomsModel, chain: authAsymId, resi: siteSuppPDBResNum}
                                    let resName = viewer.selectedAtoms(resSel)[0].resn
                                    let label = viewer.addLabel(
                                        resName + String(Pdb2UpDict[repPdbId][labelAsymId][siteSuppPDBResNum]),
                                        {
                                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                            font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                        },
                                        resSel,
                                        true,
                                    );
                                    labelsHash[activeModel]["clickedSite"][clickedElementId].push(label);
                                }
                            }
                        }
                    }
                    if (surfaceVisible) {
                        let surfid = surfsDict["superposition"][clickedPointLabel].surfid;
                        viewer.setSurfaceMaterialStyle(surfid, {color: pointColor, opacity: surfHighOpacity}); // show ONLY surface of clicked row
                    }
                    viewer.render();
                }
                else {
                    if (surfaceVisible) {
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
    toggleSpinner1(); // Hide spinner
    toggleMenu(); // Optionally hide the menu after selection
}

let modelID;

function openStructure(pdbId) {
    return new Promise((resolve, reject) => {
        // Example function call to 3DMol.js to load a structure
        console.log("Opening structure:", pdbId);
        //let path = '/static/data/' + proteinId + '/' + segmentId + '/assemblies/' + pdbId + '_bio.cif';
        // let pdbUri = `/static/data/${proteinId}/${segmentId}/assemblies/${pdbId}_bio.cif`; //path to assembly cif
        //let pdbUri = `${window.appBaseUrl}/assemblies/${pdbId}_bio.cif`; //path to assembly cif
        let pdbUri = `${window.appBaseUrl}/assemblies/${proteinId}/${segmentId}/${pdbId}_bio.cif`; //path to assembly cif
        
        let cifName = `${pdbId}_bio.cif`;
        
        $.ajax({ // get UniProt residue mappings when loading a new assembly
            type: 'POST', 
            url: `${window.appBaseUrl}/get-uniprot-mapping`, // server route
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'pdbId': pdbId, 'proteinId': proteinId, 'segmentId': segmentId}), // sending PDB, Protein and Segment IDs
            success: function(response) {

                let allMappings = response; // extract the different mapping dictionaries
                console.log(`Reading SIFTS mapping for ${pdbId}`)
                Pdb2UpMapAssembly = allMappings['pdb2up'][pdbId];
                Up2PdbMapAssembly = allMappings['up2pdb'][pdbId];
                Chain2AccMapAssembly = allMappings['chain2acc'];
                chainsMapAssembly = allMappings['chains'];

                proteinChains = Object.keys(chainsMapAssembly) // the BIO UNIT chain IDs
                    .filter(key => Chain2AccMapAssembly[chainsMapAssembly[key]] === proteinId); // which ASYM UNIT chain equivalents belong to protein of interest

                // console.log('UniProt mappings received!');

                jQuery.ajax( pdbUri, { 
                    success: function(data) {


                        if (cifName in modelOrder) { // if the model is already loaded, just show it
                            // console.log(`Model has already been loaded with modelID = ${modelOrder[cifName]}!`);
                            modelID = modelOrder[cifName];
                            activeModel = modelID;
                            viewer.getModel(modelID).show(); // Show the model
                        }
                        else {
                            let model = viewer.addModel(data, "cif", {unboundCations: true}); // Load data
                            let hydrogenAtoms = model.selectedAtoms({elem: "H"}); // Get hydrogen atoms
                            model.removeAtoms(hydrogenAtoms); // Remove hydrogen atoms
                            modelID = model.getID(); // Gets the ID of the GLModel
                            activeModel = modelID;
                            surfsDict[activeModel] = {"non_binding": {}, "lig_inters": {},}; // Initialize dictionary for the new assembly
                            labelsHash[activeModel] =  {"clickedSite": {}, "hoveredRes": [], "contactSites": []};

                            // implement surface addition for binding sites
                
                            for (const [key, value] of Object.entries(seg_ress_dict)) { 

                                if (key !== "ALL_BINDING") {
                                    surfsDict[activeModel][key] = {}; // Initialize dictionary for each binding site
                                }

                                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
            
                                    let surfAssemblyPDBResNums = seg_ress_dict[key]
                                        .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                        .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                        
                                    if (key == "ALL_BINDING") {
                                
                                        surfsDict[activeModel]["non_binding"][element] = viewer.addSurface(
                                            $3Dmol.SurfaceType.ISO,
                                            {
                                                color: defaultColor,
                                                opacity: surfHiddenOpacity,
                                            },
                                            {...protAtoms, model: activeModel, not:{resi: surfAssemblyPDBResNums}, chain: element},
                                            {...protAtoms, model: activeModel, not:{resi: surfAssemblyPDBResNums}, chain: element},
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
                                            {...protAtoms, model: activeModel, resi: surfAssemblyPDBResNums, chain: element},
                                            {...protAtoms, model: activeModel, resi: surfAssemblyPDBResNums, chain: element},
                                        );
                                    }
                                });
                            }

                            let baseName = pdbUri.split("/").pop() // Name of the structure (.cif) file
                            let pdbID = baseName.split("_")[0]; // PDB ID from file name
                            ligandSitesHash[activeModel] = {};
                            modelOrder[baseName] = modelID; // populate dictionary
                            modelOrderRev[modelID] = pdbID; // populate dictionary
                            models.push(model); // add model at the end of list
                            loadedCount++; // Increment counter

                            contactCylinders[activeModel] = []; // Initialize contactCylinders for the new assembly (previous ones are untouched and keep their cylinders)
                        }
            
                        viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity, gapcutoff: gapCutOff}}); // Set cartoon style for the model
                        
                        if (watersVisible) { // if waters were visible, show them
                            viewer.addStyle({model: activeModel, resn: "HOH"}, {sphere: {hidden: false, color: waterColor, radius: sphereRadius}});
                        }
                        // viewer.addStyle({model: modelID, elem:"H"},{stick:{hidden:true},sphere:{hidden:true}}); // Hide hydrogens
                        //viewer.center({model: modelID});
                        //viewer.zoomTo({model: modelID})
            
                        viewer.setHoverable({model: modelID}, true,  // Hovering enabled for new assembly
                            showHoverLabel,
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