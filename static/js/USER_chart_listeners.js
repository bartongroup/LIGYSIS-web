var lastHoveredPoint1 = null;
var newLastHoveredPoint = null;

let siteAssemblyPDBResNumsClicked;

let siteSuppPDBResNumsClicked;

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    siteAssemblyPDBResNums = [];
    siteSuppPDBResNums = [];

    SuppHoveredSiteResidues = null;
    AssemblyHoveredSiteResidues = [];

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor

    let clickedElements = document.getElementsByClassName("clicked-row"); // get all clicked rows (there should only be one)
    
    if (chartElement.length > 0) { // cursor is hovering over a data point

        let firstPoint = chartElement[0];

        if (lastHoveredPoint1 !== firstPoint.index) { // Check if the hovered point has changed

            let pointLabel = chartData[chartLab][firstPoint.index];

            let previousPointLabel = chartData[chartLab][lastHoveredPoint1];

            let siteColor = chartColors[Number(pointLabel)];

            let previousSiteColor = chartColors[Number(previousPointLabel)];

            resetChartStyles(myChart, firstPoint.index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site

            if (clickedElements.length > 0) { // a row is clicked
                
                let clickedElement = clickedElements[0]; // clicked row

                siteAssemblyPDBResNumsClicked = [];
                
                clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

                let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

                if (activeModel == "superposition") {
                    viewer.setStyle(// colour everything white except for clicked site. To make disappear before hovering on other site (can happen when two sites are close in the graph)
                        {...protAtoms, model: protAtomsModel, not: SuppClickedSiteResidues},
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick: {color: defaultColor, hidden: true},
                        }
                    );     
                }
                else  {
                    if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                        viewer.setStyle(
                            {...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues.concat(allBindingRess)},},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick: {color: defaultColor, hidden: true},
                            }
                        );
                    }
                    else {
                        viewer.setStyle(// colour everything white except for clicked site. To make disappear before hovering on other site (can happen when two sites are close in the graph)
                            {...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues},},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick: {color: defaultColor, hidden: true},
                            }
                        );
                    }
                }
                    
                if (surfaceVisible) {
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity}); // show surface of hovered site visible at 80% opacity
                            }
                            else if (key == clickedPointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked table row site visible at 90% opacity
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                            }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity}); // show surface of hovered site visible at 80% opacity
                                }
                                else if (key == clickedPointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked table row site visible at 90% opacity
                                }
                                else if (key == "lig_inters") {
                                    if (contactsVisible) {
                                        // pass
                                    }
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                                }
                            }
                        }
                    }
                }
            }
            else { // no row is clicked
                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not:{or:allBindingRess}},
                        {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                    );   
                }
                else {
                    viewer.setStyle(
                        protAtoms,
                        {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                    );
                }
                if (surfaceVisible) { // if surface is visible
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                            }
                            else if (key == previousPointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: previousSiteColor, opacity: surfMediumOpacity}); // change the surface color of the previously hovered binding site row
                            }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                                }
                                else if (key == previousPointLabel) {
                                    if (contactsVisible) {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                    }
                                    else {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: previousSiteColor, opacity: surfMediumOpacity}); // change the surface color of the previously hovered binding site row
                                    }
                                }
                            }
                        }
                    }
                }
            }

            highlightTableRow(pointLabel);

            if (activeModel == "superposition") {
                siteSuppPDBResNums = seg_ress_dict[pointLabel]
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
                        stick:{color: siteColor,},
                    }
                );
            }
            else {

                siteAssemblyPDBResNum = seg_ress_dict[pointLabel]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
                siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}

                viewer.setStyle(
                    {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: siteColor},
                    }
                );
            }
            viewer.render();       
            
            clearHighlightedRow();

            lastHoveredPoint1 = firstPoint.index;
        }
    }
    else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)

        if (clickedElements.length > 0) { // a row is clicked

            let clickedElement = clickedElements[0]; // clicked row
            
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

            let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

            if (activeModel == "superposition") {

                viewer.setStyle(
                    {
                        ...protAtoms, model: protAtomsModel, not: SuppClickedSiteResidues, // all protein residues except clicked site (we want to keep ligands),
                    },
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    SuppClickedSiteResidues,
                    {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: clickedSiteColor,}, }
                );
            }
            else {
                    viewer.setStyle(
                        {
                           ...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues}, // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: clickedSiteColor,}, }
                    );
                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    viewer.setStyle(
                        {
                            ...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues.concat(allBindingRess)} // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) { // colour again in case some bingind residues are part of another site and got colouterd
                        viewer.setStyle(
                            {model: activeModel, or: value[0]},  // value[0] are the ligand-binding residues selection
                            {
                                cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{hidden: false, color: value[2],} // value[2] is colour of the binding site
                            }
                        );
                    }
                }
            }
            if (surfaceVisible) { // if surface is visible (when hovering on a site on the chart and a row is clicked)
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == clickedPointLabel) { 
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked site visible at 90% opacity
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == clickedPointLabel) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked site visible at 90% opacity
                            }
                            else if (key == "lig_inters") {
                                if (contactsVisible) {
                                    // pass
                                }
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                            }
                        }
                    }
                }
            }
            resetChartStyles(myChart, clickedPointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site
        }
        else { // no row is clicked

            if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                viewer.setStyle(
                    {...protAtoms, model: activeModel, not:{or: allBindingRess}},
                    {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                );
                // also recolour the ligand-interacting residues as some might be in multiple sites
                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    viewer.setStyle(
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{hidden: false, color: value[2],} // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                viewer.setStyle( // this generic selection works are CONTACTS are OFF and no row is clicked
                    protAtoms,
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                ); // remove sidechains and colour white everything except ligands (all protein atoms)
            }

            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == 'non_binding') {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfLowOpacity});
                        }
                        else {
                            let siteColor = chartColors[Number(key.split("_").pop())];
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity});
                        }
                    }
                }
                else {
                    if (contactsVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel][lastHoveredPoint1])) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {opacity: surfHiddenOpacity});
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
        
        viewer.render();

        lastHoveredPoint1 = null;

        clearHighlightedRow();
    }
});

document.getElementById('chartCanvas').addEventListener('click', function(e) { // when the cursor moves over the chart canvas

    siteAssemblyPDBResNumsClicked = [];

    siteAssemblyPDBResNums = [];

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (chartElement.length > 0) { // cursor is hovering over a data point
        
        let firstPoint = chartElement[0];

        let index = firstPoint.index; // index of the clicked data point

        let pointLabel = chartData[chartLab][index]; // label of the clicked data point

        let pointColor = chartColors[index]; // color of the clicked data point

        let fullPointLabel = jobId + "_" + pointLabel;

        $.ajax({ // AJAX request to get the table data from the server
            type: 'POST', // POST request
            url: '/user-get-table', // URL to send the request to
            contentType: 'application/json;charset=UTF-8', // content type
            data: JSON.stringify({'label': fullPointLabel}), // data to send
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
                    newRow[0].style.setProperty('color', pointColor, "important");
                    newRow[0].style.setProperty('--bs-table-color', pointColor);
                    newRow[0].style.setProperty('--bs-table-hover-color', pointColor);
                    tableBody.append(newRow); // Append the new row to the table body
                }

                newChartData = response;
                newChart.data.datasets[0].data = newChartData[newChartY];  // New data
                newChart.data.datasets[0].backgroundColor = pointColor;
                newChart.data.datasets[0].pointHoverBackgroundColor = pointColor;
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

        // I want to replace the binding site of the clicked row when a data point on this chart is clicked on

        let clickedElements = document.getElementsByClassName("clicked-row");

        if (clickedElements.length > 0) { // a site is clicked

            let clickedElement = clickedElements[0]; // clicked site
                
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site point

            clearClickedRows(); // clear the already clicked table row

            resetChartStyles(myChart, clickedPointLabel, "black", 1, 12); // changes chart styles to default for the previously clicked site  

            if (labelsVisible) { // hide labels of the previously clicked site
                for (label of labelsHash[activeModel]["clickedSite"][clickedSite]) {
                    label.hide();
                }
            }

            // check is clicked row is the same as the newly clicked data point

            if (clickedPointLabel == pointLabel) { // same binding site is clicked

                if (surfaceVisible) { // here if surface is active: go back to show surfaces as by default
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
                    else{
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (contactsVisible) {
                                    if (key == "lig_inters") { // sho
                                        // pass
                                    }
                                    else { // hide other surfaces
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                    }
                                }
                                else {
                                    if (key == "lig_inters") {
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

                SuppClickedSiteResidues = null; // reset clicked site residues
                AssemblyClickedSiteResidues = [];  // reset clicked site residues

                clickedPointLabel = null; // reset clickedPointLabel
                clickedSite = null; // reset clickedSite
            }

            else {
                if (activeModel == "superposition") {
                    viewer.setStyle( // colour white previously clicked site residues
                            SuppClickedSiteResidues,
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                            }
                        );
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, or: AssemblyClickedSiteResidues},
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                        }
                    );
                }

                clickTableTowById(pointLabel) // click the table row of the newly clicked data point

                clickedSite = index; // set clicked site to the newly clicked data point

                resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

                SuppClickedSiteResidues = null; // reset clicked site residues
                AssemblyClickedSiteResidues = [];  // reset clicked site residues 

                if (activeModel == "superposition") {
                    siteSuppPDBResNums = seg_ress_dict[index]
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
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
                        },
                    );
                    viewer.zoomTo(SuppClickedSiteResidues);
                }
                else {

                    let siteAssemblyPDBResNum = seg_ress_dict[index]
                        .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                    AssemblyClickedSiteResidues = siteAssemblyPDBResNums;  

                    viewer.setStyle(
                        {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
                        },
                    );
                    viewer.zoomTo({model: activeModel, or: siteAssemblyPDBResNums});
                }
                if (labelsVisible) {
                    if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(index)) {
                        console.log(`Site ${index} already clicked and labels exist`);
                        for (const label of labelsHash[activeModel]["clickedSite"][index]) {
                            label.show();
                        }
                    }
                    else {
                        labelsHash[activeModel]["clickedSite"][index] = [];
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
                                        borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    false,
                                );
                                labelsHash[activeModel]["clickedSite"][index].push(label);
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
                                        borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
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
                if (surfaceVisible) { // hide other surfaces and show clicked one
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity: surfHighOpacity});
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                    else{
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "lig_inters") {
                                    // pass
                                }
                                else if (key == pointLabel) {
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
        }
        else { // no row is clicked (at this point the variables should always be null and [])

            clickTableTowById(pointLabel) // click the table row of the newly clicked data point
            clickedSite = index; // set clicked site to the newly clicked data point

            resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

            if (activeModel == "superposition") {
                siteSuppPDBResNums = seg_ress_dict[index]
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
                        cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: pointColor},
                    },
                );
                viewer.zoomTo(SuppClickedSiteResidues);
            }
    
            else {

                let siteAssemblyPDBResNum = seg_ress_dict[index]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
                siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                AssemblyClickedSiteResidues = siteAssemblyPDBResNums;

                viewer.setStyle(
                    {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                    {
                        cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: pointColor},
                    },
                );
                viewer.zoomTo({model: activeModel, or: siteAssemblyPDBResNums});
            }

            if (labelsVisible) {
                if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(index)) {
                    console.log(`Site ${index} already clicked and labels exist`);
                    for (const label of labelsHash[activeModel]["clickedSite"][index]) {
                        label.show();
                    }
                }
                else {
                    labelsHash[activeModel]["clickedSite"][index] = [];
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
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                false,
                            );
                            labelsHash[activeModel]["clickedSite"][index].push(label);
                        }
                    }
                    else {
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
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
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

            if (surfaceVisible) { // hide other surfaces and show clicked one
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == pointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity: surfHighOpacity});
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key == "lig_inters") {
                            // pass
                        }
                        else {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
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
        }
        viewer.render();
    }
});

document.getElementById('newChartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    var newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor

    let clickedElements = document.getElementsByClassName("clicked-row");

    AssemblyPDBResNums = [];
    
    if (newChartElement.length > 0) { // cursor is hovering over a data point

        let newFirstPoint = newChartElement[0];
        
        const pointColor = newChart.data.datasets[0].backgroundColor;

        if (newLastHoveredPoint !== newFirstPoint.index) { // Check if the hovered point has changed

            newLastHoveredPoint = newFirstPoint.index;

            let newPointLabel = newChartData[newChartLab][newFirstPoint.index];

            clearHighlightedRow();

            highlightTableRow(newPointLabel); 

            if (clickedElements.length == 0) { // no row is clicked

                if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
                    viewer.setStyle(
                        {...protAtoms, model: protAtomsModel},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    ); // this is done so only a single point is highlighted when hovered on (some are really close.)
                    SuppPDBResNum = Up2PdbDict[newPointLabel]; // this is now an array (anticipating multimeric structures)
                    let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                        return { chain: tuple[0], resi: tuple[1] };
                    });
                    
                    if (SuppPDBResNum != undefined) {
                        viewer.setStyle(
                            {model: protAtomsModel, or: SuppPDBResNumSel, not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: pointColor},
                            }
                        );
                    }
                    else {
                        console.log(`Residue ${newPointLabel} not found in the structure!`);
                    }
                }
                else {
                    if (contactsVisible) {
                        viewer.setStyle(
                            {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        );
                    }
                    else {
                        viewer.setStyle(
                            {...protAtoms, model: activeModel},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        );
                    }
                    let AssemblyPDBResNum = Up2PdbMapAssembly[newPointLabel]
                    if (AssemblyPDBResNum  != undefined) {
                        let AssemblyPDBResNumSel = AssemblyPDBResNum.map(tuple => {
                            return { chain: tuple[0], resi: tuple[1] };
                        });
                        //AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                        AssemblyPDBResNums = AssemblyPDBResNumSel;
                        viewer.setStyle(
                            {model: activeModel, or: AssemblyPDBResNumSel, not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: pointColor},
                            }
                        );
                    }
                }

                if (labelsVisible) {
                    for (label of labelsHash[activeModel]["hoveredRes"]) {
                        viewer.removeLabel(label);
                    }
                    labelsHash[activeModel]["hoveredRes"] = [];

                    if (activeModel == "superposition") {
                        if (SuppPDBResNum != undefined) { // this is now an array of (chain, resi) anticipating for multimeric structures
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
                                        borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    true,
                                );
                                labelsHash[activeModel]["hoveredRes"].push(label);
                                });
                        }
                        else {
                            console.log(`Residue ${newPointLabel} not found in the structure!`);
                        }
                    }
                    else{
                        AssemblyPDBResNums.forEach((residue) => {
                            let resChain = residue['chain'];
                            let resNum = residue['resi'];
                            let resSel = {model: activeModel, resi: resNum, chain: resChain}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                true,
                            );
                            labelsHash[activeModel]["hoveredRes"].push(label);
                        });
                    }
                }
                viewer.render();
            }
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)

        newLastHoveredPoint = null;

        clearHighlightedRow();

        if (clickedElements.length == 0) {

            if (activeModel == "superposition") {
                viewer.setStyle(
                    {...protAtoms, model: protAtomsModel},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
            }
            else {
                if (contactsVisible) {
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );

                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                        viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                            {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                            {
                                cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{hidden: false, color: value[2],} // value[2] is colour of the binding site
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

            if (labelsVisible) {
                for (label of labelsHash[activeModel]["hoveredRes"]) {
                    viewer.removeLabel(label);
                }
                labelsHash[activeModel]["hoveredRes"] = [];
            }

            viewer.render();
        }
    }
});
