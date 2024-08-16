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
    if (option !== previousSelection) {
        const button = document.querySelector('.dropup-button');
        button.textContent = option;

        if (previousSelection === 'Superposition' && option !== 'Superposition') {
            openStructure(option);
        }

        if (previousSelection !== 'Superposition' && option !== 'Superposition') {
            openStructure(option);
        }

        if (previousSelection !== 'Superposition' && option == 'Superposition') {

            for (let i = 0; i <= simplePdbs.length-1; i++) {
                viewer.getModel(i).show();    
            }
            
            for (let i = simplePdbs.length; i <= models.length-1; i++) {
                viewer.getModel(i).hide();    
            }

            viewer.render();
            
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

            // Hide ligand superposition models
            for (let i = 0; i <= models.length-1; i++) {
                viewer.getModel(i).hide();    
            }
            // viewer.render();
            viewer.setStyle({model: modelID}, {cartoon: {hidden: false, style: 'oval', color: 'red', arrows: true, thickness: 0.25, opacity:1.0}});
            viewer.center({model: modelID});
            viewer.zoomTo()
            //viewer.zoom(2,1000);
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