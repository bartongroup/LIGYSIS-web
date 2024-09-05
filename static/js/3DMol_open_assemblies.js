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

function selectOption(option) {
    if (option !== previousSelection) { // if the option is changed, otherwise do nothing
        const button = document.querySelector('.dropup-button');
        button.textContent = option;

        let clickedElements = document.getElementsByClassName("clicked-row");
        if (clickedElements.length > 0) {
            let clickedPointLabel = chartData[chartLab][clickedElements[0].id]; // label of the clicked binding site row
            resetChartStyles(myChart, clickedPointLabel, "black", 1, 12); // changes chart styles to default for the previously clicked site
            clickedElements[0].classList.remove("clicked-row"); // unclick the clicked row
        } 

        if (watersVisible) { // if waters were visible, hide them

            viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: waterColor, radius: sphereRadius}}); // hide all water molecules from superposition

            // turn waterButton off
            waterButton.value = 'Waters OFF';
            waterButton.style = "font-weight: bold; color: #674ea7;";
            watersVisible = false;
        }

        if (labelsVisible) { // if labels were visible, hide them

            for ([key, value] of Object.entries(labelsHash)) {
                for (let i = 0; i < value.length; i++) {
                    viewer.removeLabel(value[i]);
                }
                labelsHash[key] = [];
            }

            // turn labelButton off
            labelButton.value = 'Labels OFF';
            labelButton.style = "font-weight: bold; color: #674ea7;";
            labelsVisible = false;
        }

        if (previousSelection === 'Superposition') { // changing from Ligand Superposition to any assembly

            if (surfaceVisible) { // if surface was visible, hide it

                for (const [key, value] of Object.entries(surfsDict["superposition"])) { // hiding all surfaces from ligand superposition
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: 'white', opacity: surfaceHiddenOpacity});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                    }
                }
                // turn surfButton off
                surfButton.value = 'Surface OFF';
                surfButton.style = "font-weight: bold; color: #674ea7;";
                surfaceVisible = false;
            }

            if (ligandsVisible) { // if ligands were visible, hide them
                viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, properties:{ bs: -1}}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, properties:{ bs: -1}}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});
                viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, not: {properties:{ bs: -1}}}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle({model: suppModels, hetflag: true, not:{resn: "HOH"}, not: {properties:{ bs: -1}}}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});

                // turn ligandButton off
                ligandButton.value = 'Ligands OFF';
                ligandButton.style = "font-weight: bold; color: #674ea7;";
                ligandsVisible = false;
            }

            viewer.setHoverable({model: suppModels}, false, // Hovering disabled for ligand superposition models (otherwise get wrong labels)
                showHoverLabel,
                removeHoverLabel,
            );

            contactsButton.disabled = false;
            contactsButton.style.color = '#674ea7';  // Active font color
            contactsButton.style.fontWeight = 'bold'; // Bold font when active

            saveAssemblyButton.disabled = false;
            saveAssemblyButton.style.color = 'black';  // Active font color

            openStructure(option);
        }

        if (previousSelection !== 'Superposition') {

            if (contactsVisible) { // if contacts were visible, hide them}

                // loop through contactCylinders and delete using removeShape, then empty list
                for (let i = 0; i < contactCylinders.length; i++) {
                    viewer.removeShape(contactCylinders[i]);
                }
                contactCylinders = [];

                contactsButton.value = 'Contacts OFF';
                contactsButton.style = "font-weight: bold; color: #674ea7;";
                contactsVisible = false;
            }

            if (surfaceVisible) { // if surface was visible, hide it
                for (const [key, value] of Object.entries(surfsDict[activeModel])) { 
                    for (const [key2, value2] of Object.entries(value)) {
                        viewer.removeSurface(value2.surfid); // Remove surfaces from previous assembly
                    }
                }

                surfButton.value = 'Surface OFF';
                surfButton.style = "font-weight: bold; color: #674ea7;";
                surfaceVisible = false;
                console.log("Assembly surfaces removed!");
            }

            if (ligandsVisible) { // if ligands were visible, hide them
                viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {stick: {hidden: true, colorscheme: myScheme, radius: stickRadius}});
                viewer.addStyle({model: activeModel, hetflag: true, not:{resn: "HOH"}}, {sphere: {hidden: true, colorscheme: myScheme, radius: sphereRadius}});

                // turn ligandButton off
                ligandButton.value = 'Ligands OFF';
                ligandButton.style = "font-weight: bold; color: #674ea7;";
                ligandsVisible = false;
            }

            viewer.setHoverable({model: activeModel}, false, // Hovering disabled for previous assembly
                showHoverLabel,
                removeHoverLabel,
            );

            if (option !== 'Superposition') {

                openStructure(option);

                contactsButton.disabled = false;
                contactsButton.style.color = '#674ea7';  // Active font color
                contactsButton.style.fontWeight = 'bold'; // Bold font when active

                saveAssemblyButton.disabled = false;
                saveAssemblyButton.style.color = 'black';  // Active font color
            }
            else {

                contactsButton.disabled = true;
                contactsButton.style.color = 'darkgray';
                contactsButton.style.fontWeight = 'normal'; // Bold font when active

                saveAssemblyButton.disabled = true;
                saveAssemblyButton.style.color = 'darkgray';  // Active font color

                console.log(`Reading SIFTS mapping for ${repPdbId} chain ${repPdbChainId}`);

                for (let i = 0; i <= simplePdbs.length-1; i++) {
                    viewer.getModel(i).show(); // Show all ligand superposition models
                }
                
                for (let i = simplePdbs.length; i <= models.length-1; i++) { 
                    viewer.getModel(i).hide(); // Hide all assemblies 
                }

                activeModel = 'superposition';

                viewer.setHoverable({model: suppModels}, true, // Hovering re-enabled for superposition
                    showHoverLabel,
                    removeHoverLabel,
                );

                viewer.setStyle({model: suppModels}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: cartoonThickness, opacity: cartoonOpacity}});
                viewer.render();
            }
        }

        previousSelection = option; // Update the previous selection
    }
    toggleMenu(); // Optionally hide the menu after selection
}

function openStructure(pdbId) {
    // Example function call to 3DMol.js to load a structure
    console.log("Opening structure:", pdbId);
    //let path = '/static/data/' + proteinId + '/' + segmentId + '/assemblies/' + pdbId + '_bio.cif';
    let pdbUri = `/static/data/${proteinId}/${segmentId}/assemblies/${pdbId}_bio.cif`; //path to assembly cif
    
    $.ajax({ // get UniProt residue mappings when loading a new assembly
        type: 'POST', 
        url: '/get-uniprot-mapping', // server route
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'pdbId': pdbId, 'proteinId': proteinId, 'segmentId': segmentId}), // sending PDB, Protein and Segment IDs
        success: function(response) {

            let allMappings = response; // extract the different mapping dictionaries
            console.log(`Reading SIFTS mapping for ${pdbId}`)
            Pdb2UpMapAssembly = allMappings['pdb2up'][pdbId];
            Up2PdbMapAssembly = allMappings['up2pdb'][pdbId];
            Chain2AccMapAssembly = allMappings['chain2acc'];
            chainsMapAssembly = allMappings['chains'];

            proteinChains = Object.keys(chainsMapAssembly)
                .filter(key => Chain2AccMapAssembly[chainsMapAssembly[key]] === proteinId);

            console.log('UniProt mappings received!');

            jQuery.ajax( pdbUri, { 
                success: function(data) {
                    let model = viewer.addModel(data, "cif",); // Load data
                    let modelID = model.getID(); // Gets the ID of the GLModel
                    activeModel = modelID;
                    surfsDict[activeModel] = {"non_binding": {}, "lig_inters": {},}; // Initialize dictionary for the new assembly
        
                    // Hide ligand superposition models
                    for (let i = 0; i <= models.length-1; i++) {
                        viewer.getModel(i).hide();    
                    }
        
                    viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: cartoonThickness, opacity: cartoonOpacity}});
                    viewer.center({model: modelID});
                    viewer.zoomTo({model: modelID})
        
                    viewer.setHoverable({model: modelID}, true,  // Hovering enabled for new assembly
                        showHoverLabel,
                        removeHoverLabel,
                    );
        
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
                                        color: 'white',
                                        opacity: surfaceHiddenOpacity,
                                    },
                                    {model: activeModel, not:{resi: surfAssemblyPDBResNums}, chain: element},
                                    {model: activeModel, not:{resi: surfAssemblyPDBResNums}, chain: element},
                                );
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                surfsDict[activeModel][key][element] = viewer.addSurface(
                                    $3Dmol.SurfaceType.ISO,
                                    {
                                        color: siteColor,
                                        opacity: surfaceHiddenOpacity,
                                    },
                                    {model: activeModel, resi: surfAssemblyPDBResNums, chain: element},
                                    {model: activeModel, resi: surfAssemblyPDBResNums, chain: element},
                                );
                            }
                        });
                    }

                    viewer.render();
        
                    let baseName = pdbUri.split("/").pop() // Name of the structure (.cif) file
                    let pdbID = baseName.split("_")[0]; // PDB ID from file name
                    ligandSitesHash[activeModel] = {};
                    modelOrder[baseName] = modelID; // populate dictionary
                    modelOrderRev[modelID] = pdbID; // populate dictionary
                    models.push(model); // add model at the end of list
                    loadedCount++; // Increment counter
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
    
    
}

// Function to toggle the visibility of the dropup content
function toggleMenu() {
    const content = document.querySelector('.dropup-content');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

document.querySelector('.dropup-button').addEventListener('click', toggleMenu);
document.addEventListener('DOMContentLoaded', populateMenu);