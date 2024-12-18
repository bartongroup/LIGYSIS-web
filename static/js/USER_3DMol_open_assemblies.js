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
        if (clickedElements.length > 0) {
            let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
            resetChartStyles(myChart, clickedPointLabel, "black", 1, 12); // changes chart styles to default for the previously clicked site
            clickedElements[0].classList.remove("clicked-row"); // unclick the clicked row
            clickedSite = null; // reset clickedSite
        } 

        if (watersVisible) { // if waters were visible, hide them

            viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}}); // hide all water molecules from superposition

            document.getElementById("waterButton").textContent = "HOH ✘";
            waterButton.style.borderColor = "#ffa500";
            waterButton.style.fontWeight = "normal";
            waterButton.style.color = "#ffa500";
            waterButton.style.borderWidth = "1px";

            watersVisible = false;
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

            document.getElementById("labelButton").textContent = "LABEL ✘";
            labelButton.style.borderColor = "#ffa500";
            labelButton.style.fontWeight = "normal";
            labelButton.style.color = "#ffa500";
            labelButton.style.borderWidth = "1px";

            labelsVisible = false;
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

                document.getElementById("surfButton").textContent = "SURF ✘";
                surfButton.style.borderColor = "#ffa500";
                surfButton.style.fontWeight = "normal";
                surfButton.style.color = "#ffa500";
                surfButton.style.borderWidth = "1px";

                surfaceVisible = false;
            }

            if (ligandsVisible) { // if ligands were visible, hide them

                viewer.addStyle(suppLigsSels["not_clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle(suppLigsSels["clust"], {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});

                document.getElementById("ligandButton").textContent = "LIGANDS ✘";
                ligandButton.style.borderColor = "#ffa500";
                ligandButton.style.fontWeight = "normal";
                ligandButton.style.color = "#ffa500";
                ligandButton.style.borderWidth = "1px";

                ligandsVisible = false;
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
                    for (const [key2, value2] of Object.entries(value)) {
                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity});
                    }
                }

                document.getElementById("surfButton").textContent = "SURF ✘";
                surfButton.style.borderColor = "#ffa500";
                surfButton.style.fontWeight = "normal";
                surfButton.style.color = "#ffa500";
                surfButton.style.borderWidth = "1px";

                surfaceVisible = false;
                // console.log("Assembly surfaces removed!");
            }

            if (ligandsVisible) { // if ligands were visible, hide them
                viewer.addStyle(
                    {...hetAtomsNotHoh, model: activeModel},
                    {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}}
                );

                document.getElementById("ligandButton").textContent = "LIGAND ✘";
                ligandButton.style.borderColor = "#ffa500";
                ligandButton.style.fontWeight = "normal";
                ligandButton.style.color = "#ffa500";
                ligandButton.style.borderWidth = "1px";

                ligandsVisible = false;
            }

            if (option !== 'Superposition') {

                viewer.setHoverable({model: activeModel}, false, // Hovering disabled for previous assembly
                    showHoverLabelNoModel,
                    removeHoverLabel,
                );

                viewer.getModel(activeModel).hide(); // Hide the active assembly

                await openStructure(option); // act heere if model is not already open

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
                
            }
            else {

                contactsButton.disabled = true;

                document.getElementById("ligandButton").textContent = "LIGAND ✘";
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

                viewer.setHoverable({model: suppModels}, true, // Hovering re-enabled for superposition
                    showHoverLabel,
                    removeHoverLabel,
                );

                viewer.setStyle(
                    {model: protAtomsModel},
                    {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity}}
                );

                viewer.center({model: protAtomsModel}); // center on suppModels again

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
            
                        viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, thickness: cartoonThickness, opacity: cartoonOpacity}});
                        viewer.center({model: modelID});
                        viewer.zoomTo({model: modelID})
            
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