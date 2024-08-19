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
        var consButton = document.getElementById('contactsButton');

        // turn contactsButton off
        consButton.value = 'Contacts OFF'; // Change the button text
        consButton.style = "font-weight: bold; color: #674ea7;";
        console.log("Contacts removed!");
        contactsVisible = false;


        if (previousSelection === 'Superposition') { // changing from Ligand Superposition to any assembly

            viewer.setHoverable({model: suppModels}, false, // Hovering disabled for ligand superposition models (otherwise get wrong labels)
                showHoverLabel,
                removeHoverLabel,
            );

            openStructure(option);
        }

        if (previousSelection !== 'Superposition') {

            // loop through contactCylinders and delete using removeShape, then empty list
            for (let i = 0; i < contactCylinders.length; i++) {
                viewer.removeShape(contactCylinders[i]);
            }
            contactCylinders = [];

            viewer.removeSurface(surfsDict[activeModel].surfid); // Remove surface from previous assembly
            console.log("Assembly surface removed!");

            viewer.setHoverable({model: activeModel}, false, // Hovering disabled for previous assembly
                showHoverLabel,
                removeHoverLabel,
            );
            console.log("Hvering removed from previous assembly!");
        
            if (option !== 'Superposition') {

                openStructure(option);
            }

            if (option == 'Superposition') {

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

                console.log("Hovering activated again for supperposition!");

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
    //path to assembly cif
    //let path = '/static/data/' + proteinId + '/' + segmentId + '/assemblies/' + pdbId + '_bio.cif';
    let pdbUri = `/static/data/${proteinId}/${segmentId}/assemblies/${pdbId}_bio.cif`;
    
    jQuery.ajax( pdbUri, { 
        success: function(data) {
            let model = viewer.addModel(data, "cif",); // Load data
            let modelID = model.getID(); // Gets the ID of the GLModel
            activeModel = modelID;

            // Hide ligand superposition models
            for (let i = 0; i <= models.length-1; i++) {
                viewer.getModel(i).hide();    
            }

            viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true, thickness: 0.25, opacity:1.0}});
            viewer.center({model: modelID});
            viewer.zoomTo({model: modelID})

            viewer.setHoverable({model: modelID}, true,  // Hovering enabled for new assembly
                showHoverLabel,
                removeHoverLabel,
            );

            surfsDict[activeModel] = viewer.addSurface( // Add surface to the new assembly
                $3Dmol.SurfaceType.ISO,
                {
                    color: 'white',
                    opacity: 0.0,
                },
                {model: modelID, hetflag: false}, 
                {hetflag: false},
            );
            viewer.render();

            let baseName = pdbUri.split("/").pop() // Name of the structure (.cif) file
            let pdbID = baseName.split("_")[0]; // PDB ID from file name
            modelOrder[baseName] = modelID; // populate dictionary
            modelOrderRev[modelID] = pdbID; // populate dictionary
            models.push(model); // add model at the end of list
            loadedCount++; // Increment counter
        },
        error: function(hdr, status, err) {
            console.error( "Failed to load PDB " + pdbUri + ": " + err );
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