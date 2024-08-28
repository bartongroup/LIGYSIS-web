// This script is used to highlight/clear a binding site chart point when the corresponding table row is hovered over/mouseout.

$('table#bss_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows

    siteAssemblyPDBResNums = [];

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
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9}); // change the surface color of the hovered binding site row
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.9}); // change the surface color of the hovered binding site row
                        }
                    }
                }
            }
        }
    }

    if (activeModel == "superposition") {
        siteSuppPDBResNums = seg_ress_dict[rowId]
            .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
            .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
        viewer.setStyle({model: suppModels, resi: siteSuppPDBResNums, chain: repPdbChainId, hetflag: false}, {cartoon:{style:'oval', color: siteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{color: siteColor}, });
    }
    else {
        proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
            let siteAssemblyPDBResNum = seg_ress_dict[rowId]
                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el)) // filters out site residues not present in this assembly. otherwise mapping is undefined and causes problems later...
                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);

            siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
            viewer.setStyle(
                {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, hetflag: false},
                {
                    cartoon:{style:'oval', color: siteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: siteColor},
                }
            );
        });

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
            viewer.setStyle({model: suppModels, resi: siteSuppPDBResNums, chain: repPdbChainId, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
        }
        else{
            siteAssemblyPDBResNums.forEach(([element, siteAssemblyPDBResNum]) => { // in case of multiple copies of protein of interest
                if (contactsVisible) {
                    viewer.setStyle(
                        {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, hetflag: false, not:{or: allBindingRess}},
                        {
                            cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        }
                    );
                    // colour ligand-binding residues again
                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                        let ligColor = chartColors[strucProtData[key][1]];
                        viewer.setStyle(
                            {model: activeModel, hetflag: false, or: value},
                            {cartoon:{style:'oval', color: ligColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{hidden: false, color: ligColor,}}
                        );
                    }
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, hetflag: false},
                        {
                            cartoon:{style:'oval', color:  'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        }
                    );
                }
            });

        }

        if (clickedElements.length == 0) {
            viewer.removeAllLabels(); // clearing labels from previous clicked site, unless still clicked

            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == "non_binding") {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.7});
                        }
                        else {
                            let siteColor = chartColors[Number(key.split("_").pop())];
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.8});
                        }
                    }
                }
                else {
                    if (contactsVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel][rowId])) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "lig_inters") { // do nothing for these surfaces
                                    // pass
                                }
                                else if (key == "non_binding") {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity:0.7});
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.8});
                                }
                            }
                        }
                    }
                }
            }
        }
        else {

            if (surfaceVisible) {
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
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


    if (activeModel == "superposition") {
        let siteSuppPDBResNums = seg_ress_dict[rowId]
            .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
            .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
    }
    else {
        proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
            let siteAssemblyPDBResNum = seg_ress_dict[rowId]
                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);

            siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
        });
    }
    

    if (classList.contains('clicked-row')) { // row is already clicked
        
        clearClickedRows();

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        highlightTableRow(rowId); // highlights the table row of the binding site

        viewer.removeAllLabels(); // clearing labels from previous clicked site, unless still clicked
        // }
        if (surfaceVisible) {
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
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (contactsVisible) {
                            if (key == "lig_inters") { // do nothing for these surfaces
                                // pass
                            }
                            else if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfaceHiddenOpacity});
                            }

                        }
                        else {
                            if (key == "lig_inters") { // do nothing for these surfaces
                                // pass
                            }
                            else if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity:0.7});
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.8});
                            }
                    }
                    }
                }
            }
        }
    }

    else {
        let fullPointLabel = segmentName + "_" + rowId;
        $.ajax({ // AJAX request to get the table data from the server
            type: 'POST', // POST request
            url: '/get-table', // URL to send the request to
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

                // Update the chart
                newChart.update();


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Request failed:');
                console.error('Status:', textStatus);
                console.error('Error:', errorThrown);
                console.error('Response:', jqXHR.responseText);
            },
        });
        clearHighlightedRow(); // clears highlighting from table row, before applying clicked styles
        if (clickedElements) { // any OTHER row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                if (activeModel == "superposition") {
                    let suppPDBResNumsClicked = seg_ress_dict[clickedElementId]
                        .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el))
                        .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                    viewer.setStyle({model: suppModels, resi: suppPDBResNumsClicked, chain: repPdbChainId, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
                }
                else {
                    let AssemblyPDBResNumsClicked = [];
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let AssemblyPDBResNum = seg_ress_dict[clickedElementId]
                            .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                            .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                        AssemblyPDBResNumsClicked.push([element, AssemblyPDBResNum]);
                        viewer.setStyle(
                            {model: activeModel, resi: AssemblyPDBResNum, chain: element, hetflag: false},
                            {
                                cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            }
                        );
                    });
                    
                }
                viewer.render();
            }
            clearClickedRows();

            myChart.data.datasets[0].data.forEach(function(point, i) {
                resetChartStyles(myChart, i, "black", 1, 12); // resets chart styles to default
            });
        }

        if (index !== -1) {
            resetChartStyles(myChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the clicked binding site
        }

        clickTableRow(this);

        if (labelsVisible) {
            viewer.removeAllLabels(); // clearing labels from previous clicked site
            if (activeModel == "superposition") {
                for (siteSuppPDBResNum of siteSuppPDBResNums) {
                    let resSel = {model: suppModels, resi: siteSuppPDBResNum, chain: repPdbChainId, hetflag: false}
                    let resName = viewer.selectedAtoms(resSel)[0].resn
                    // console.log(resSel, resName);
                    viewer.addLabel(
                        resName + String(Pdb2UpDict[repPdbId][repPdbChainId][siteSuppPDBResNum]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        resSel,
                        false,
                    );
                }
            }
            else {
                for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                    for (siteAssemblyPDBResNumber of siteAssemblyPDBResNum) { // variable name not ideal as siteAssemblyPDBResNum is an array
                        let resSel = {model: activeModel, resi: siteAssemblyPDBResNumber, chain: element, hetflag: false}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        viewer.addLabel(
                            resName + String(Pdb2UpMapAssembly[element][siteAssemblyPDBResNumber]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            false,
                        );
                    }
                }
            }
        }

        if (surfaceVisible) {
            if (activeModel == "superposition") {
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9});
                    }
                    else {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0});
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
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.9});
                            }

                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity: surfaceHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }

    }

    viewer.render({});
    
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row ID of the table row that is hovered over (this corresponds to the UniProt residue number of this row)
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let rowColor = window.getComputedStyle(this).getPropertyValue('color');
    let rowColorHex = rgbToHex(rowColor);

    AssemblyPDBResNums = [];

    
    if (index !== -1) { // will always be true if we hover over a row
        
        resetChartStyles(newChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site

        if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
            SuppPDBResNum = Up2PdbDict[repPdbId][repPdbChainId][rowId];
            if (SuppPDBResNum !== undefined) {
                viewer.setStyle({resi: SuppPDBResNum, hetflag: false}, {cartoon:{style:'oval', color: rowColorHex, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{color: rowColorHex}, });
            }
            else {
                console.log("Residue not found in structure!");
            }
        }
        else {
            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                let AssemblyPDBResNum = Up2PdbMapAssembly[chainsMapAssembly[element]][rowId]
                AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                if (AssemblyPDBResNum !== undefined) {
                    viewer.setStyle(
                        {model: activeModel, resi: AssemblyPDBResNum, chain: element, hetflag: false},
                        {
                            cartoon:{style:'oval', color: rowColorHex, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: rowColorHex},
                        }
                    );
                }
                else {
                    console.log("Residue not found in assembly!");
                }
            });
        }

        if (labelsVisible) {
            if (activeModel == "superposition") {
                if (SuppPDBResNum !== undefined) {
                    let resSel = {model: suppModels, resi: SuppPDBResNum, chain: repPdbChainId, hetflag: false}
                    let resName = viewer.selectedAtoms(resSel)[0].resn
                    viewer.addLabel(
                        resName + String(Pdb2UpDict[repPdbId][repPdbChainId][SuppPDBResNum]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        resSel,
                        true,
                    );
                }
            }
            else {
                AssemblyPDBResNums.forEach(([chain, resNum]) => {
                    if (resNum !== undefined) {
                        let resSel = {model: activeModel, resi: resNum, chain: chain, hetflag: false}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        viewer.addLabel(
                            resName + String(Pdb2UpMapAssembly[chain][resNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            true,
                        );
                    }
                });
            }
        }

        viewer.render({});
    }

}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows

    // AssemblyPDBResNums = [];

    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over

    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data

    resetChartStyles(newChart, index, "black", 2, 8); // resets chart styles to default

    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedElements.length == 0) {

        let PDBResNum = Up2PdbDict[repPdbId][repPdbChainId][rowId];

        if (activeModel == "superposition") {
            viewer.setStyle({model: suppModels, resi: SuppPDBResNum, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
            if (labelsVisible) {
                viewer.removeAllLabels(); // clearing labels from previous clicked site, unless still clicked
            }
        }
        else {
            AssemblyPDBResNums.forEach(([chain, resNum]) => {
                viewer.setStyle({model: activeModel, resi: resNum, chain: chain, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
            });
            if (labelsVisible) {
                viewer.removeAllLabels(); // clearing labels from previous clicked site, unless still clicked
            }
        }
        viewer.render({});
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
