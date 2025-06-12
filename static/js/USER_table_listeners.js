// This script is used to highlight/clear a binding site chart point when the corresponding table row is hovered over/mouseout.

$('table#bss_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows

    siteAssemblyPDBResNums = [];

    SuppHoveredSiteResidues = null;
    AssemblyHoveredSiteResidues = [];

    let rowId = this.id;  // gets the row id of the table row that is hovered over
    let siteColor = chartColors[Number(rowId)]; // gets the binding site color of the table row that is hovered over

    if (!this.classList.contains('clicked-row')) { // row is not clicked

        highlightTableRow(rowId); // highlights the table row of the binding site

        let index = chartData[chartLab].indexOf(Number(rowId)); // gets the index of the row id in the chart data

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        if (surfaceVisible) { // if surface is visible
            if (activeModel == "superposition") {
                if (clickedBindingRess.length > 0) { // if binding residues are clicked, hide all their surfaces
                    let commonRess = clickedBindingRess.filter(res => seg_ress_dict[rowId].includes(res)); // find common residues between clicked binding residues and hovered binding siteAdd commentMore actions
                    if (commonRess.length > 0) { // if there are common residues, show their surfaces
                        for (const commonRes of commonRess) {
                            let commonRessPDBResNum = Up2PdbDict[commonRes];
                            for (const [chain, resi] of commonRessPDBResNum) {
                                let ResKey = chain + "_" + resi; // create a key for the residue
                                if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                    var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: siteColor, opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                }
                            }
                        }
                    }
                }
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                        }
                    }
                }
            }
        }
    }

    if (activeModel == "superposition") {

        siteSuppPDBResNums = seg_ress_dict[rowId]
            .filter(el => Up2PdbDict.hasOwnProperty(el))
            .flatMap(el => {
                let dataArray = Up2PdbDict[el]; // Get the array of tuples
                return dataArray.map(data => {
                    return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                });
            });

        SuppHoveredSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}}

        viewer.setStyle(
            SuppHoveredSiteResidues,
            {
                cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                stick:{color: siteColor},
            }
        );
    }
    else {

        siteAssemblyPDBResNum = seg_ress_dict[rowId]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
        siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
        AssemblyHoveredSiteResidues = siteAssemblyPDBResNums
        
        if (contactsVisible) {
            let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
            defaultColors.C = siteColor;
            viewer.setStyle(
                {model: activeModel, or: AssemblyHoveredSiteResidues, not: {atom: bboneAtoms}},
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{colorscheme: defaultColors},
                }
            );
        }
        else {
            viewer.setStyle(
                {model: activeModel, or: AssemblyHoveredSiteResidues, not: {atom: bboneAtoms}},
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: siteColor},
                }
            );
        }
    }
    viewer.render();
    
}).on('mouseout', 'tr', function () {

    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
    let siteColor = chartColors[Number(rowId)];
    let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let classList = this.classList;
    let clickedElements = document.getElementsByClassName("clicked-row");
    
    if (!classList.contains('clicked-row')) { // row is not clicked

        if (classList.contains('highlighted-row')) {
            clearHighlightedRow(); // clears highlighted table row
            resetChartStyles(myChart, index, "black", 1, 12); // resets chart styles to default
        }

        if (activeModel == "superposition") {
            viewer.setStyle(
                SuppHoveredSiteResidues,
                {
                    cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                }
            );
            // colour again clicked residues
            if (!clickedBindingRess.length == 0) {
                let clickedBindingRessSel = [];
                let displayedSiteColour = chartColors[Number(CurrentDisplayedSite)]; // colour of the clicked binding site
                for (const res of clickedBindingRess) {
                    let resPDBResNum = Up2PdbDict[res];
                    for (const [chain, resi] of resPDBResNum) {
                        clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi}); // create a selection for the clicked binding residues
                    }
                }
                viewer.setStyle(
                    {...protAtoms, or: clickedBindingRessSel, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: displayedSiteColour, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: displayedSiteColour},
                    }
                );
            }
        }
        else{
            if (contactsVisible) {
                viewer.setStyle(
                    {model: activeModel, or: AssemblyHoveredSiteResidues, not: {atom: bboneAtoms}}, // hiding all the hovered site residues
                    {
                        cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    }
                );
                // colour ligand-binding residues again
                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = value[2];
                    viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{hidden: false, colorscheme: defaultColors,} // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                viewer.setStyle(
                    {model: activeModel, or: AssemblyHoveredSiteResidues, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    }
                );
            }
        }

        if (clickedElements.length == 0) {
            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    if (clickedBindingRess.length == 0) { // if no binding residues are clicked, show all surfaces
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfLowOpacity});
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity});
                            }
                        }
                    }
                    else {// if binding residues are clicked, hide the un-hovered site surface (clicked residue surfaces will remain)
                        //show surfaces of all clicked binding residues. loop through clickedBindingRessAdd commentMore actions
                        for (const rowId of clickedBindingRess) {
                            let clickedBindingRessPDBResNum = Up2PdbDict[rowId];
                            if (clickedBindingRessPDBResNum !== undefined) { // check if clickedBindingRessPDBResNum is defined
                                for (const [chain, resi] of clickedBindingRessPDBResNum) {
                                    let ResKey = chain + "_" + resi; // create a key for the residue
                                    if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                        var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                        viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                                    }
                                    else { // need to create surfaces because they were not created before since site was already clicked
                                        let surfSel = {model: protAtomsModel, resi: resi, chain: chain};
                                        let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                            .filter(el => Up2PdbDict.hasOwnProperty(el))
                                            .flatMap(el => {
                                                let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                                return dataArray.map(data => {
                                                    return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                                });
                                            });
                                        let SiteSel = {model: protAtomsModel, or: SitePDBResNums};
                                        surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                            $3Dmol.SurfaceType.ISO,
                                            {
                                                color: siteColor,
                                                opacity: surfHighOpacity,
                                            },
                                            surfSel,
                                            SiteSel,
                                        );
                                    }
                                }
                            }
                        }
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][rowId].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                    }
                }
                else {
                    if (contactsVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel][rowId])) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "lig_inters") { // do nothing for these surfaces
                                    // pass
                                }
                                else if (key == "non_binding") {
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
        }
        else {
            let clickedElement = clickedElements[0]; // clicked row
            
            let clickedSiteColor = chartColors[Number(clickedElement.id)]; // color of the clicked binding site

            if (activeModel == "superposition") {
                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    SuppClickedSiteResidues,
                    {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: clickedSiteColor,}, }
                );
            }
            else {
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = clickedSiteColor;
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{colorscheme: defaultColors,}, }
                    );
                }
                else {
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: clickedSiteColor,}, }
                    );
                }
            }
            if (surfaceVisible) {
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
        viewer.render();
    }
    
}).on('click', 'tr', function () {
    
    let rowId = this.id;  // gets the row id of the table row that is clicked
    let index = chartData[chartLab].indexOf(Number(rowId)); // gets the index of the row id in the chart data
    let siteColor = chartColors[Number(rowId)];//.split("_").pop())]; // gets the binding site color of the table row that is hovered over
    let classList = this.classList;
    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedSite !== null) { // if there is already clicked site, remove its labels
        if (labelsVisible) {
            for (const label of labelsHash[activeModel]["clickedSite"][clickedSite]) {
                label.hide();
            }
            if (clickedBindingRess.length > 0) { // but there are clicked binding residues. We need to create/show their labels
                for (const res of clickedBindingRess) {
                    let resPDBResNum = Up2PdbDict[res];
                    for (const [chain, resi] of resPDBResNum) {
                        let ResKey = chain + "_" + resi; // create a key for the residue
                        if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show(); // show the label if it exists
                        }
                        else {
                            let resSel = {model: protAtomsModel, resi: resi, chain: chain};
                            let resName = viewer.selectedAtoms(resSel)[0].resn;
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpDict[chain][resi]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                false,
                            );
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label; // add the label to the clicked residues
                        }
                    }
                }
            }
        }
    }
    
    if (classList.contains('clicked-row')) { // row is already clicked
        
        clearClickedRows();
        clickedSite = null;

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        highlightTableRow(rowId); // highlights the table row of the binding site

        SuppClickedSiteResidues = null;
        AssemblyClickedSiteResidues = [];

        if (surfaceVisible) {
            if (activeModel == "superposition") {
                if (clickedBindingRess.length == 0) { // if no binding residues are clicked, show all surfaces
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
                    // hide clicked residue surfacesAdd commentMore actions
                    for (const clickedRes of clickedBindingRess) {
                        let clickedResPDBResNum = Up2PdbDict[clickedRes];
                        for (const [chain, resi] of clickedResPDBResNum) {
                            let ResKey = chain + "_" + resi; // create a key for the residue
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                    // show surface of just unclicked site
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][rowId].surfid, {color: siteColor, opacity: surfHighOpacity});
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (contactsVisible) {
                            if (key == "lig_inters") { // do nothing for these surfaces
                                // pass
                            }
                            else if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                        else {
                            if (key == "lig_inters") { // do nothing for these surfaces
                                // pass
                            }
                            else if (key == "non_binding") {
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

        if (activeModel == "superposition") {
            viewer.zoomTo({model: protAtomsModel});
        }
        else {
            viewer.zoomTo({model: activeModel});
        }
        viewer.setSlab(nearPlane, farPlane);
        viewer.render();
    }
    else {
        let previouslyDisplayedSite = CurrentDisplayedSite; // store the previously clicked site before changing it
        let fullPointLabel = jobId + "_" + rowId;
        CurrentDisplayedSite = Number(rowId); // changing displayed site
        if (labelsHash[activeModel]["clickedResidues"].hasOwnProperty(rowId)) {
            //
        }
        else {
            labelsHash[activeModel]["clickedResidues"][rowId] = {}; // create an empty array for clicked residues if it doesn't exist
        }
        if (surfsDict["superposition"]["single_residues"].hasOwnProperty(rowId)) {
            //
        }
        else {
            surfsDict["superposition"]["single_residues"][rowId] = {}; // create an empty object for clicked residues if it doesn't exist
        }
        // do the AJAX  call only if the clicked site is not the same as the previously displayed siteAdd commentMore actions
        if (previouslyDisplayedSite == rowId) {
            //
        }
        else {
            $.ajax({ // AJAX request to get the table data from the server
                type: 'POST', // POST request
                url: `${window.appBaseUrl}/user-get-table`, // URL to send the request to
                contentType: 'application/json;charset=UTF-8', // content type
                // data to send in the body of the request
                data: JSON.stringify({
                    'label': fullPointLabel,
                    'session_id': session_id,
                    'submission_time': submission_time,
                }),
                success: function(response) { // function to execute when the request is successful
                    const keyOrder = cc; // order of the keys in the response object
                    let tableBody = $('#bs_ress_table tbody'); // tbody of the table
                    tableBody.empty(); // empty the tbody
                    for (var i = 0; i < response[keyOrder[0]].length; i++) { // First loop to iterate through rows
                        let newRow = $('<tr class="table__row">'); // Create a new row
                        newRow.attr('id', response[newChartLab][i]); // Assign ID dynamically to each row
                        $.each(keyOrder, function(j, key) { // Second loop to iterate through keys (columns)
                            newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                        });
                        newRow[0].style.setProperty('color', siteColor, "important");
                        newRow[0].style.setProperty('--bs-table-color', siteColor);
                        newRow[0].style.setProperty('--bs-table-hover-color', siteColor);
                        tableBody.append(newRow); // Append the new row to the table body
                    }

                    newChartData = response;
                    newChart.data.datasets[0].data = newChartData[newChartY];  // New data
                    newChart.data.datasets[0].backgroundColor = siteColor;
                    newChart.data.datasets[0].pointHoverBackgroundColor = siteColor;
                    newChart.data.labels = newChartData[newChartX];  // New labels (if needed)
                    newChart.update(); // Update the chart
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Request failed:');
                    console.error('Status:', textStatus);
                    console.error('Error:', errorThrown);
                    console.error('Response:', jqXHR.responseText);
                },
            });
        }
        clearHighlightedRow(); // clears highlighting from table row, before applying clicked styles
        if (clickedElements) { // any OTHER row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                if (activeModel == "superposition") {
                    viewer.setStyle( // colour white previously clicked site residues
                        SuppClickedSiteResidues,
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                        }
                    );
                }
                else {
                    if (contactsVisible) {
                        console.log("Contacts visible when clicking on a new site");
                        viewer.setStyle(
                            {model: activeModel, or: AssemblyClickedSiteResidues, not: {or: allBindingRess}},  
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                            }
                        );
                    }
                    else {
                        viewer.setStyle(
                            {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                            }
                        );
                    }
                    
                }
                viewer.render();
            }
            clearClickedRows();

            myChart.data.datasets[0].data.forEach(function(point, i) {
                resetChartStyles(myChart, i, "black", 1, 12); // resets chart styles to default
            });
        }

        SuppClickedSiteResidues = null;
        AssemblyClickedSiteResidues = [];

        if (activeModel == "superposition") {
            let siteSuppPDBResNums = seg_ress_dict[rowId]
                .filter(el => Up2PdbDict.hasOwnProperty(el))
                .flatMap(el => {
                    let dataArray = Up2PdbDict[el]; // Get the array of tuples
                    return dataArray.map(data => {
                        return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                    });
                });

            SuppClickedSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}}
            // update selection so that it ignores backbone atoms

            // need to colour the clicked site residues here. Before we were not as it was already hovered. However, when overlap between sites, we need to colour the clicked site.
            viewer.setStyle(
                SuppClickedSiteResidues,
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: siteColor},
                }
            );

            if (rowId != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove labels of previously displayed site
                if (clickedBindingRess.length > 0) {
                    let clickedBindingRessSel = [];
                    for (const res of clickedBindingRess) {
                        let resPDBResNum = Up2PdbDict[res];
                        for (const [chain, resi] of resPDBResNum) {
                            clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi}); // create a selection for the clicked binding residues
                        }
                    }
                    viewer.setStyle(
                        {...protAtoms, or: clickedBindingRessSel},
                        {
                            cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: defaultColor, hidden: true,},
                        }
                    );
                    if (surfaceVisible) {
                        for (const res of clickedBindingRess) {
                            let resPDBResNum = Up2PdbDict[res];
                            for (const [chain, resi] of resPDBResNum) {
                                let ResKey = chain + "_" + resi; // create a key for the residue
                                if (surfsDict["superposition"]["single_residues"][previouslyDisplayedSite].hasOwnProperty(ResKey)) {
                                    var surfObject = surfsDict["superposition"]["single_residues"][previouslyDisplayedSite][ResKey];
                                    var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                }
                            }
                        }
                    }
                    clickedBindingRess = []; // clear clicked binding residues, since we are in a new site
                }
            }
            viewer.zoomTo(SuppClickedSiteResidues);
        }
    
        else {

            let siteAssemblyPDBResNum = seg_ress_dict[rowId]
                .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                .flatMap(el => {
                    let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                    return dataArray.map(data => {
                        return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                    });
                });
            siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
            AssemblyClickedSiteResidues = siteAssemblyPDBResNums;  

            if (contactsVisible) {
                let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                defaultColors.C = siteColor;
                viewer.setStyle(
                    {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{colorscheme: defaultColors},
                    }
                );
            }
            else{
                
                viewer.setStyle(
                    {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: siteColor},
                    }
                );
            }
            viewer.zoomTo({model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}});
        }

        if (index !== -1) {
            resetChartStyles(myChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the clicked binding site
        }

        clickTableRow(this);
        clickedSite = rowId; // assigning new value to clickedSite so that we keep track of which site is clicked. Necessary to remove labels when another site is clicked

        // I DO NOT COLOUR THE CLICKED SITE, BECAUSE IN PRINCIPLE, YOU CAN'T CLICK WITHOUT HOVERING FIRST, SO THE SITE IS ALREADY COLOURED.

        if (labelsVisible) {

            // dealing with labels of clicked individual residuesAdd commentMore actions
            if (rowId == previouslyDisplayedSite) {
                // if clicked site is the same as displayed site (on residues table), don't need to remove labels
            }
            else {
                //console.log(`Clicked site ${rowId} is different from displayed site ${CurrentDisplayedSite}. Removing labels...`);
                // loop throuth labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite] dictionary
                for (const [key, label] of Object.entries(labelsHash[activeModel]["clickedResidues"][previouslyDisplayedSite])) {
                    label.hide();
                }
            }
            for (const label of labelsHash[activeModel]["hoveredRes"]) { // don't know how, I guess fast hovering from residues table/chart might leave one label left
                viewer.removeLabel(label);
            }
            labelsHash[activeModel]["hoveredRes"] = [];

            // check if rowId in labelsHash[activeModel]["clickedSite"]
            if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(rowId)) {
                console.log(`Site ${rowId} already clicked and labels exist`);
                for (const label of labelsHash[activeModel]["clickedSite"][rowId]) {
                    label.show();
                }
            }
            else {
                console.log(`Site ${rowId} not clicked yet. Creating labels...`);
                labelsHash[activeModel]["clickedSite"][rowId] = [];
                if (activeModel == "superposition") {
                    for (siteSuppPDBResNum of siteSuppPDBResNums) {
                        let resChain = siteSuppPDBResNum['chain'];
                        let resNum = siteSuppPDBResNum['resi'];
                        let resSel = {model: protAtomsModel, resi: resNum, chain: resChain}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpDict[resChain][resNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                            false,
                        );
                        labelsHash[activeModel]["clickedSite"][rowId].push(label);
                    }
                }
                else {
                    for (residue of siteAssemblyPDBResNums) {
                        let resChain = residue['chain'];
                        let resNum = residue['resi'];
                        let resSel = {model: activeModel, resi: resNum, chain: resChain}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                            false,
                        );
                        labelsHash[activeModel]["clickedSite"][index].push(label);
                    }

                }
            }
        }
        if (surfaceVisible) {
            if (activeModel == "superposition") {
                // if (rowId != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove surfaces of previously displayed siteAdd commentMore actions
                //     if (clickedBindingRess.length > 0) {
                //         // hide clicked residue surfaces
                //         for (const clickedRes of clickedBindingRess) {
                //             if (surfsDict["superposition"]["single_residues"][previouslyDisplayedSite].hasOwnProperty(clickedRes)) {
                //                 var surfObject = surfsDict["superposition"]["single_residues"][previouslyDisplayedSite][clickedRes];
                //                 var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                //                 viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity});
                //             }
                //         }
                //     }
                // }
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity});
                    }
                    else {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key == 'lig_inters') {
                        // pass
                    }
                    else {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity});
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
    }
    viewer.render();
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row ID of the table row that is hovered over (this corresponds to the UniProt residue number of this row)
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let rowColor = window.getComputedStyle(this).getPropertyValue('color');
    let rowColorHex = rgbToHex(rowColor);

    let clickedElements = document.getElementsByClassName("clicked-row");

    AssemblyPDBResNums = [];

    if (index !== -1) { // will always be true if we hover over a row
        
        if (clickedBindingRess.includes(rowId)) {
            //
        }
        else { 
            resetChartStyles(newChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
            SuppPDBResNum = Up2PdbDict[rowId]; // this is an array of tuples, anticipating multimeric structures
            let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                return { chain: tuple[0], resi: tuple[1] };
            });
            if (SuppPDBResNum !== undefined) {
                viewer.setStyle(
                    {model: protAtomsModel, or: SuppPDBResNumSel, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: rowColorHex},
                    }
                );
            }
            else {
                console.log("Residue not found in structure!");
            }
        }
        else {
            let AssemblyPDBResNum = Up2PdbMapAssembly[rowId]

            if (AssemblyPDBResNum !== undefined) {
                let AssemblyPDBResNumSel = AssemblyPDBResNum.map(tuple => {
                    return { chain: tuple[0], resi: tuple[1] };
                });
                AssemblyPDBResNums = AssemblyPDBResNumSel;
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                    defaultColors.C = rowColorHex;
                    viewer.setStyle(
                        {model: activeModel, or: AssemblyPDBResNumSel, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{colorscheme: defaultColors},
                        }
                    );
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, or: AssemblyPDBResNumSel, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: rowColorHex},
                        }
                    );
                }
                
            }
            else {
                console.log("Residue not found in assembly!");
            }
        }

        if (labelsVisible) {
            for (const label of labelsHash[activeModel]["hoveredRes"]) {
                viewer.removeLabel(label);
            }
            labelsHash[activeModel]["hoveredRes"] = [];

            if (activeModel == "superposition") {
                if (SuppPDBResNum !== undefined) {
                    labelsHash[activeModel]["hoveredRes"] = [];
                    let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                        return { chain: tuple[0], resi: tuple[1] };
                    });
                    SuppPDBResNumSel.forEach((residue) => {
                        let resChain = residue['chain'];
                        let resNum = residue['resi'];
                        let resSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpDict[resChain][resNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                            true,
                        );
                        labelsHash[activeModel]["hoveredRes"].push(label);
                    });
                }
            }
            else {
                AssemblyPDBResNums.forEach((residue) => {
                    let resChain = residue['chain'];
                    let resNum = residue['resi'];
                    let resSel = {model: activeModel, resi: resNum, chain: resChain}
                    let resName = viewer.selectedAtoms(resSel)[0].resn
                    let label = viewer.addLabel(
                        resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                        true,
                    );
                    labelsHash[activeModel]["hoveredRes"].push(label);
                });
            }
        }
        if (surfaceVisible) {
            // only show individual residue surfaces if a site is not clickedAdd commentMore actions
            if (clickedElements.length == 0) {

                console.log("THIS IS BEING EXECUTED");  
                if (activeModel == "superposition") {
                    SuppPDBResNum = Up2PdbDict[rowId]; // this is an array of tuples, anticipating multimeric structures
                    if (SuppPDBResNum !== undefined) {
                        for (const [resChain, resNum] of SuppPDBResNum) {
                            let ResKey = resChain + "_" + resNum;
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                            }
                            else { // need to create residue surface
                                let surfSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                                let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                    .filter(el => Up2PdbDict.hasOwnProperty(el))
                                    .flatMap(el => {
                                        let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                        return dataArray.map(data => {
                                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                        });
                                    });
                                let SiteSel = {model: protAtomsModel, or: SitePDBResNums};
                                surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                    $3Dmol.SurfaceType.ISO,
                                    {
                                        color: rowColorHex,
                                        opacity: surfHighOpacity,
                                    },
                                    surfSel,
                                    SiteSel,
                                );
                            }
                        }
                    }
                }
                else {
                    // need to implement this for assemblies
                }
            }
            else {
                console.log("Clicked elements exist, not showing individual residue surfaces");
            }
        }
        viewer.render();
    }

}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows

    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over

    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data

    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedElements.length == 0) {

        if (clickedBindingRess.includes(rowId)) { // if the binding site residue is clicked, we do not reset the styleAdd commentMore actions
            //
        }
        else {
            resetChartStyles(newChart, index, "black", 2, 8); // resets chart styles to default
        }

        if (activeModel == "superposition") {
            if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                viewer.setStyle(
                    {...protAtoms, model: protAtomsModel},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
            }
            else {
                let clickedRessSels = []
                for (const res of clickedBindingRess) {
                    if (Up2PdbDict.hasOwnProperty(res)) {
                        let dataArray = Up2PdbDict[res];
                        clickedRessSels.push(...dataArray.map(data => ({ chain: data[0], resi: data[1] })));
                    }
                }
                viewer.setStyle(
                    {model: protAtomsModel, not: {or: clickedRessSels}},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
            }
        }
        else {
            if (contactsVisible) {
                viewer.setStyle(
                    {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );

                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                    defaultColors.C = value[2];
                    viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{hidden: false, colorscheme: defaultColors,}  // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                viewer.setStyle(
                    {...protAtoms, model: activeModel},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
                
            }
        }
        viewer.render();
    }
    else { // there is a clicked row
        if (clickedBindingRess.includes(rowId)) { // if the binding site residue is clicked, we do not reset the style
            //
        }
        else {
            resetChartStyles(newChart, index, "black", 2, 8); // resets chart styles to default
        }
    }

    if (labelsVisible) {
        for (const label of labelsHash[activeModel]["hoveredRes"]) {
            viewer.removeLabel(label);
        }
        labelsHash[activeModel]["hoveredRes"] = [];
    }
    if (surfaceVisible) {
        if (clickedElements.length == 0) { // no binding sites are clicked
            if (clickedBindingRess.includes(rowId)) {
                // do nothing
            }
            else {
                if (activeModel == "superposition") {
                    let SuppPDBResNum = Up2PdbDict[rowId]; // this is an array of tuples, anticipating multimeric structures
                    if (SuppPDBResNum !== undefined) {
                        for (const [resChain, resNum] of SuppPDBResNum) {
                            let ResKey = resChain + "_" + resNum;
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {opacity: surfHiddenOpacity});
                            }
                        }
                    }
                    if (clickedBindingRess.length == 0) { // no binding site residues are clickedAdd commentMore actions
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfLowOpacity});
                            }
                            else if (key == "single_residues") {
                                //
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity});
                            }
                        }
                    }
                }
                // else {
                //     for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                //         for (const [key2, value2] of Object.entries(value)) {
                //             if (key == rowId) {
                //                 viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                //             }
                //         }
                //     }
                // }
            }
        }
        else {
                // do not touch surfaces if a site is clicked
        }
        viewer.render();
    }
}).on('click', 'tr', function () { // implementing new click event listener for binding site residues table rowsAdd commentMore actions
    let rowId = Number(this.id);  // gets the row ID of the table row that is hovered over (this corresponds to the UniProt residue number of this row)
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let rowColor = window.getComputedStyle(this).getPropertyValue('color');
    let rowColorHex = rgbToHex(rowColor);

    let clickedElements = document.getElementsByClassName("clicked-row");
    
    if (clickedBindingRess.includes(rowId)) {
        clickedBindingRess = clickedBindingRess.filter(res => res !== rowId); // removes the row id from the clicked binding residues array
        if (index !== -1) {
            resetChartStyles(newChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }
        clearClickedResidueRow(this); // clears the clicked residue row styles
        if (labelsVisible) {
            if (activeModel == "superposition") {
                SuppPDBResNum = Up2PdbDict[rowId]; // this is now an array (anticipating multimeric structures)
                if (SuppPDBResNum !== undefined) {
                    for (const tuple of SuppPDBResNum) {
                        let resChain = tuple[0];
                        let resNum = tuple[1];
                        let ResKey = resChain + "_" + resNum;
                        if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].hide(); // hides the label for the clicked residue
                        }
                    }
                }
            }
            else {
                let AssemblyPDBResNum = Up2PdbMapAssembly[rowId];
                if (AssemblyPDBResNum !== undefined) {
                    for (const tuple of AssemblyPDBResNum) {
                        let resChain = tuple[0];
                        let resNum = tuple[1];
                        let ResKey = resChain + "_" + resNum;
                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].hide(); // hides the label for the clicked residue
                    }
                }
            }
        }
        if (surfaceVisible) {
            // if (activeModel == "superposition") {
            //     let SuppPDBResNum = Up2PdbDict[rowId]; // this is an array of tuples, anticipating multimeric structures
            //     if (SuppPDBResNum !== undefined) {
            //         for (const [resChain, resNum] of SuppPDBResNum) {
            //             let ResKey = resChain + "_" + resNum;
            //             if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
            //                 viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {opacity: surfHiddenOpacity});
            //             }
            //         }
            //     }
            // }
            // else {
            //     if (surfsDict[activeModel]["single_residues"].hasOwnProperty(rowId)) {
            //         viewer.setSurfaceMaterialStyle(surfsDict[activeModel]["single_residues"][rowId].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
            //     }
            // }
        }
        viewer.render();
    }
    else {
        clickedBindingRess.push(rowId); // adds the row id to the clicked binding residues array
        if (index !== -1) {
            resetChartStyles(newChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the clicked binding site
        }
        clearHighlightedResidueRow(this); // clears the highlighted residue row styles before applying clicked styles
        clickResiduesTableRow(this);

        if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
            if (clickedElements.length == 0){ // only do this if no binding sites are clicked
                SuppPDBResNum = Up2PdbDict[rowId]; // this is now an array (anticipating multimeric structures)
                if (SuppPDBResNum !== undefined) {
                    let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                            return { chain: tuple[0], resi: tuple[1] };
                        });
                    viewer.setStyle(
                        {model: protAtomsModel, or: SuppPDBResNumSel, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: rowColorHex},
                        }
                    );
                    if (labelsVisible) {
                        for (const tuple of SuppPDBResNum) {
                            let resChain = tuple[0];
                            let resNum = tuple[1];
                            let ResKey = resChain + "_" + resNum;
                            if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show(); // shows the label for the clicked residue
                            }
                            else {
                                let resSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpDict[resChain][resNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    false,
                                );
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label;
                            }
                        }
                    }
                    if (surfaceVisible) {
                        // need to hide all other surfaces first
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                            else if (key == "single_residues") {
                                // do nothing for these surfaces
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                        for (const [resChain, resNum] of SuppPDBResNum) {
                            let ResKey = resChain + "_" + resNum;
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                            }
                            else { // need to create residue surface
                                let surfSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                                let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                    .filter(el => Up2PdbDict.hasOwnProperty(el))
                                    .map(el => {
                                        let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                        return dataArray.map(data => {
                                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                        });
                                    });
                                let SiteSel = {model: protAtomsModel, or: SitePDBResNums};
                                surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                    $3Dmol.SurfaceType.ISO,
                                    {
                                        color: rowColorHex,
                                        opacity: surfHighOpacity,
                                    },
                                    surfSel,
                                    SiteSel,
                                );
                            }
                        }
                    }
                }
                else {
                    console.log("Residue not found in structure!");
                }
            }
        }
        else {
            let AssemblyPDBResNum = Up2PdbMapAssembly[rowId];
            if (AssemblyPDBResNum !== undefined) {
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                    defaultColors.C = rowColorHex;
                    for (const element of AssemblyPDBResNum) {
                        viewer.setStyle(
                            {model: activeModel, resi: element[1], chain: element[0], not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{colorscheme: defaultColors},
                            }
                        );
                    }
                }
                else {
                    for (const element of AssemblyPDBResNum) {
                        viewer.setStyle(
                            {model: activeModel, resi: element[1], chain: element[0], not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: rowColorHex},
                            }
                        );
                    }                   
                }
            }
            else {
                console.log("Residue not found in assembly!");
            }
        }
        viewer.render();
    }
});

// THIS IS THE EVENT LISTENER THAT CHANGES THE AXES OF THE BINDING SITES PLOTS ACCORDING TO DROPDOWNS

document.addEventListener("DOMContentLoaded", function () {

    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");

    xAxisTitleDropdown.value = myChart.options.scales.x.title.text;
    yAxisTitleDropdown.value = myChart.options.scales.y.title.text;

    xAxisTitleDropdown.addEventListener("change", function () {
        updateChart("x", xAxisTitleDropdown, myChart, chartData, myChartLims);
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        updateChart("y", yAxisTitleDropdown, myChart, chartData, myChartLims);
    });

});

// THIS IS THE EVENT LISTENER THAT CHANGES THE SIZE OF THE TABLE OF BINDING SITE RESIDUES SO ONLY TOP 5 ROWS ARE SHOWN

document.addEventListener('DOMContentLoaded', function() {
    var table = document.getElementById('bs_ress_table');
    
    // Assuming a consistent border width for all rows, we can get the border from the first row.
    var rowBorderWidth = window.getComputedStyle(table.rows[0], null).getPropertyValue('border-bottom-width');
    var firstRowHeight = window.getComputedStyle(table.rows[0], null).getPropertyValue('height');
    // Convert the border width from string (like "1px") to an integer value
    rowBorderWidth = parseFloat(rowBorderWidth, 10);
    firstRowHeight = parseFloat(firstRowHeight, 10);
    
    var numberOfRowsToShow = 6;

    // Add the border height (number of borders will be numberOfRowsToShow - 1)
    var maxHeight = (firstRowHeight * numberOfRowsToShow) + (numberOfRowsToShow - 3) * rowBorderWidth;

    table.parentElement.style.maxHeight = maxHeight + 'px';
});

// THIS IS THE EVENT LISTENER THAT CHANGES THE SIZE OF THE TABLE OF BINDING SITEs SO ONLY TOP 5 ROWS ARE SHOWN

document.addEventListener('DOMContentLoaded', function() {
    var table = document.getElementById('bss_table');
    
    // Assuming a consistent border width for all rows, we can get the border from the first row.
    var rowBorderWidth = window.getComputedStyle(table.rows[0], null).getPropertyValue('border-bottom-width');
    var firstRowHeight = window.getComputedStyle(table.rows[0], null).getPropertyValue('height');
    // Convert the border width from string (like "1px") to an integer value
    rowBorderWidth = parseFloat(rowBorderWidth, 10);
    firstRowHeight = parseFloat(firstRowHeight, 10);
    
    var numberOfRowsToShow = 5;

    // Add the border height (number of borders will be numberOfRowsToShow - 1)
    var maxHeight = (firstRowHeight * numberOfRowsToShow) + (numberOfRowsToShow - 3) * rowBorderWidth;

    table.parentElement.style.maxHeight = maxHeight + 'px';
});

function rgbToHex(rgb) {
    const rgbValues = rgb.match(/^rgba?[\s+]?[(]?(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s/]*(?:[\d+.]*)?[)]?$/i);

    if (!rgbValues) {
      return null;  // not an rgb or rgba string
    }

    let r = parseInt(rgbValues[1], 10).toString(16);
    let g = parseInt(rgbValues[2], 10).toString(16);
    let b = parseInt(rgbValues[3], 10).toString(16);

    r = r.length === 1 ? "0" + r : r;
    g = g.length === 1 ? "0" + g : g;
    b = b.length === 1 ? "0" + b : b;

    return "#" + r + g + b;
}
