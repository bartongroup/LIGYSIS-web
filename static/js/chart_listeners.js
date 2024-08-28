var lastHoveredPoint1 = null;
var newLastHoveredPoint = null;

let siteAssemblyPDBResNumsClicked;

let siteSuppPDBResNumsClicked;

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    siteAssemblyPDBResNums = [];
    siteSuppPDBResNums = [];

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor

    let clickedElements = document.getElementsByClassName("clicked-row"); // get all clicked rows (there should only be one)
    
    if (chartElement.length > 0) { // cursor is hovering over a data point

        let firstPoint = chartElement[0];

        if (lastHoveredPoint1 !== firstPoint.index) { // Check if the hovered point has changed

            clearHighlightedRow();

            lastHoveredPoint1 = firstPoint.index;

            let pointLabel = chartData[chartLab][firstPoint.index];

            let siteColor = chartColors[Number(pointLabel)];

            resetChartStyles(myChart, firstPoint.index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site

            if (clickedElements.length > 0) { // a row is clicked
                
                let clickedElement = clickedElements[0]; // clicked row

                siteSuppPDBResNumsClicked = [];
                siteAssemblyPDBResNumsClicked = [];
                
                clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

                let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

                if (activeModel == "superposition") { // this is to remove any other residues that are not part of the clicked site
                    siteSuppPDBResNumsClicked = seg_ress_dict[clickedPointLabel]
                        .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el))
                        .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                    
                    // viewer.setStyle(
                    //     {
                    //         and:[{model: suppModels, resi: siteSuppPDBResNumsClicked, chain: repPdbChainId, invert: true}, {hetflag: false}] // all protein residues except clicked site (we want to keep ligands)
                    //         // resi: clickedPDBResNums, invert: true, hetflag: false
                    //     },
                    //     {
                    //         cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, 
                    //     }
                    // ); // remove sidechains and colour white everything but clicked site
                }
                else {
                    // pass
                    // proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    //     siteAssemblyPDBResNumClicked = seg_ress_dict[clickedPointLabel]
                    //         .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                    //         .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                    //         siteAssemblyPDBResNumsClicked.push([element, siteAssemblyPDBResNumClicked]);

                        
                    
                    //     viewer.setStyle(
                    //         {
                    //             and:[{model: activeModel, resi: siteAssemblyPDBResNumClicked, chain: element, invert: true}, {hetflag: false}] // all protein residues except clicked site (we want to keep ligands)
                    //             // resi: clickedPDBResNums, invert: true, hetflag: false
                    //         },
                    //         {
                    //             cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, 
                    //         }
                    //     );
                    // });
                }
                
                if (surfaceVisible) {
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.8}); // show surface of hovered site visible at 80% opacity
                            }
                            else if (key == clickedPointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked table row site visible at 90% opacity
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity: surfaceHiddenOpacity}); // hide all other surfaces
                            }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.8}); // show surface of hovered site visible at 80% opacity
                                }
                                else if (key == clickedPointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked table row site visible at 90% opacity
                                }
                                else if (key == "lig_inters") {
                                    if (contactsVisible) {
                                        // pass
                                    }
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity: surfaceHiddenOpacity}); // hide all other surfaces
                                }
                            }
                        }
                    }
                }
            }

            else { // no row is clicked

                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    // pass
                    let allBindingRess = Object.values(ligandSitesHash[activeModel]).flat();
                    viewer.setStyle(
                        {model: activeModel, hetflag: false, not:{or:allBindingRess}},
                        {cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                    );   
                }
                else {
                    viewer.setStyle(
                        {
                            hetflag: false, // don't want to remove ligands
                        },
                        {
                            cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        }
                    );
                }

                if (surfaceVisible) { // if surface is visible
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: 0.9}); // change the surface color of the hovered binding site row
                            }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.9}); // change the surface color of the hovered binding site row
                                }
                            }
                        }
                    }
                }
            }

            highlightTableRow(pointLabel);

            if (activeModel == "superposition") {
                siteSuppPDBResNums = seg_ress_dict[pointLabel]
                    .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                    .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);

                viewer.setStyle(
                    {model: suppModels, resi: siteSuppPDBResNums, chain: repPdbChainId, hetflag: false},
                    {cartoon:{style:'oval', color: siteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: siteColor,}, }
                );
            }
            else {
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    siteAssemblyPDBResNum = seg_ress_dict[pointLabel]
                        .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
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
            // if (surfaceVisible) { // if surface is visible
            //     if (activeModel == "superposition") {
            //         for (const [key, value] of Object.entries(surfsDict["superposition"])) {
            //             if (key == pointLabel) {
            //                 viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9}); // change the surface color of the hovered binding site row
            //             }
            //         }
            //     }
            //     else {
            //         for (const [key, value] of Object.entries(surfsDict[activeModel])) {
            //             for (const [key2, value2] of Object.entries(value)) {
            //                 if (key == pointLabel) {
            //                     viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity:0.9}); // change the surface color of the hovered binding site row
            //                 }
            //             }
            //         }
            //     }
            // }

            viewer.render();
            
        }

    } else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        lastHoveredPoint1 = null;

        clearHighlightedRow();

        if (clickedElements.length > 0) { // a row is clicked

            let clickedElement = clickedElements[0]; // clicked row
            
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

            let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

            if (activeModel == "superposition") {
                let siteSuppPDBResNumsClicked = seg_ress_dict[clickedPointLabel]
                    .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el))
                    .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);

                viewer.setStyle(
                    {
                        and:[{model: suppModels, resi: siteSuppPDBResNumsClicked, invert: true}, {hetflag: false}] // all protein residues except clicked site (we want to keep ligands)
                    },
                    {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );
                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    {model: suppModels, resi: siteSuppPDBResNumsClicked, chain: repPdbChainId, hetflag: false},
                    {cartoon:{style:'oval', color: clickedSiteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: clickedSiteColor,}, }
                );
            }
            else {
                let siteAssemblyRessClicked = [];
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let siteAssemblyPDBResNumClicked = seg_ress_dict[clickedPointLabel]
                        .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                        .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                    siteAssemblyPDBResNumsClicked.push([element, siteAssemblyPDBResNumClicked]);
                    // if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    //     viewer.setStyle(
                    //         {
                    //             model: activeModel, hetflag: false, not:{or: allBindingRess} // all protein residues except clicked site (we want to keep ligands)
                    //         },
                    //         {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    //     );
                    //     viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    //         {model: activeModel, resi: siteAssemblyPDBResNumClicked, chain: element, hetflag: false},
                    //         {cartoon:{style:'oval', color: clickedSiteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    //         stick:{color: clickedSiteColor,}, }
                    //     );

                    // }
                    // else {
                    viewer.setStyle(
                        {
                            and:[{model: activeModel, resi: siteAssemblyPDBResNumClicked, chain: element, invert: true}, {hetflag: false}] // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                    let sel = {model: activeModel, resi: siteAssemblyPDBResNumClicked, chain: element, hetflag: false};
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        sel,
                        {cartoon:{style:'oval', color: clickedSiteColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: clickedSiteColor,}, }
                    );
                    siteAssemblyRessClicked.push(sel);
                    // }
                });
                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    viewer.setStyle(
                        {
                            model: activeModel, hetflag: false, not: {or: allBindingRess}, not: {or: siteAssemblyRessClicked} // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) { // colour again in case some bingind residues are part of another site and got colouterd
                        let ligColor = chartColors[strucProtData[key][1]];
                        viewer.setStyle(
                            {model: activeModel, hetflag: false, or: value},
                            {cartoon:{style:'oval', color: ligColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{hidden: false, color: ligColor,}}
                        );
                    }
                }
            }

            if (surfaceVisible) { // if surface is visible (when hovering on a site on the chart and a row is clicked)
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == clickedPointLabel) { 
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked site visible at 90% opacity
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: 'white', opacity: surfaceHiddenOpacity}); // hide all other surfaces
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == clickedPointLabel) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked site visible at 90% opacity
                            }
                            else if (key == "lig_inters") {
                                if (contactsVisible) {
                                    // pass
                                }
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity: surfaceHiddenOpacity}); // hide all other surfaces
                            }
                        }
                    }
                }
            }

            resetChartStyles(myChart, clickedPointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

        }
        else { // no row is clicked

            if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                // pass
                //let allBindingRess = Object.values(ligandSitesHash[activeModel]).flat();
                viewer.setStyle(
                    {model: activeModel, hetflag: false, not:{or:allBindingRess}},
                    {cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                );
                // also recolour the ligand-interacting residues as some might be in multiple sites
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
                    {hetflag: false,}, // don't want to remove ligands
                    {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                ); // remove sidechains and colour white everything except ligands (all protein atoms)
            }

            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == 'non_binding') {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.7});
                        }
                        else {
                            let siteColor = chartColors[Number(key.split("_").pop())];
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.8});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == "lig_inters") {
                                // pass
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfaceHiddenOpacity});
                            }
                        }
                    }
                }
            }

            // viewer.setStyle(
            //     {hetflag: false,}, // don't want to remove ligands
            //     {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}
            // ); // remove sidechains and colour white everything except ligands (all protein atoms)
        }
        
        viewer.render({});
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

        let fullPointLabel = segmentName + "_" + pointLabel;

        if (activeModel == "superposition") {
            siteSuppPDBResNums = seg_ress_dict[index]
                .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
        }

        else {
            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                let siteAssemblyPDBResNum = seg_ress_dict[index]
                    .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                    .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
            });
        }

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

        // I want to replace the binding site of the clicked row when a data point on this chart is clicked on

        let clickedElements = document.getElementsByClassName("clicked-row");

        if (clickedElements.length > 0) { // a row is clicked

            let clickedElement = clickedElements[0]; // clicked row
                
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

            clearClickedRows(); // clear the already clicked table row

            resetChartStyles(myChart, clickedPointLabel, "black", 1, 12); // changes chart styles to default for the previously clicked site  
            
            var clickedElementId = clickedElement.id;

            if (activeModel == "superposition") {
                let siteSuppPDBResNumsClicked = seg_ress_dict[clickedElementId]
                    .filter(el => Up2PdbDict[repPdbId][repPdbChainId].hasOwnProperty(el))
                    .map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
                viewer.setStyle({model: suppModels, resi: siteSuppPDBResNumsClicked, chain: repPdbChainId, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
            }
            else {
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let siteAssemblyPDBResNumClicked = seg_ress_dict[clickedElementId]
                    .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el)) // filters out site residues not present in this assembly. otherwise mapping is undefined and causes problems later...
                    .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
        
                    //let AssemblyPDBResNum = Up2PdbMapAssembly[chainsMapAssembly[element]][newPointLabel]
                    siteAssemblyPDBResNumsClicked.push([element, siteAssemblyPDBResNumClicked]);
                    viewer.setStyle(
                        {model: activeModel, resi: siteAssemblyPDBResNumClicked, chain: element, hetflag: false},
                        {
                            cartoon:{style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            //stick:{color: siteColor},
                        }
                    );
                }); 
            }

            if (labelsVisible) {
                viewer.removeAllLabels();
            }

            // check is clicked row is the same as the newly clicked data point

            if (clickedPointLabel == pointLabel) { // same binding site is clicked

                clickedPointLabel = null; // reset clickedPointLabel

                // here if surface is active: go back to show surfaces as by default
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
                    else{
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (contactsVisible) {
                                    if (key == "lig_inters") { // sho
                                        // pass
                                    }
                                    else { // hide other surfaces
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity: surfaceHiddenOpacity});
                                    }
                                }
                                else {
                                    if (key == "lig_inters") {
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

                clickTableTowById(pointLabel) // click the table row of the newly clicked data point

                resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

                if (labelsVisible) {
                    if (activeModel == "superposition") {
                        for (siteSuppPDBResNum of siteSuppPDBResNums) {
                            let resSel = {model: suppModels, resi: siteSuppPDBResNum, chain: repPdbChainId, hetflag: false};
                            let resName = viewer.selectedAtoms(resSel)[0].resn;
                            viewer.addLabel(
                                resName + String(Pdb2UpDict[repPdbId][repPdbChainId][siteSuppPDBResNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
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
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    resSel,
                                    false,
                                );
                            }
                        }
                    }
                }

                // hide other surfaces and show clicked one
                if (surfaceVisible) {
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity:0.9});
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity: surfaceHiddenOpacity});
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
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity:0.9});
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
        else { // no row is clicked

            clickTableTowById(pointLabel) // click the table row of the newly clicked data point

            resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

            if (labelsVisible) {
                viewer.removeAllLabels(); // clearing labels from previous clicked site
                if (activeModel == "superposition") {
                    for (siteSuppPDBResNum of siteSuppPDBResNums) {
                        let resSel = {model: suppModels, resi: siteSuppPDBResNum}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        // console.log(resSel, resName);
                        viewer.addLabel(
                            resName + String(Pdb2UpDict[repPdbId][repPdbChainId][siteSuppPDBResNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
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
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                false,
                            );
                        }
                    }
                }
            }
            // hide other surfaces and show clicked one
            if (surfaceVisible) {
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == pointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity:0.9});
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity: surfaceHiddenOpacity});
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
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity:0.9});
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: 'white', opacity: surfaceHiddenOpacity});
                                }
                                //viewer.render();
                            }
                        }
                        
                    }
                }
            }
            

        }

        // style here.

        if (activeModel == "superposition") {
            viewer.setStyle(
                {model: suppModels, resi: siteSuppPDBResNums, chain: repPdbChainId, hetflag: false},
                {cartoon: {style:'oval', color: pointColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{color: pointColor},},
            );
        }
        else {
            for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                viewer.setStyle(
                    {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, hetflag: false},
                    {cartoon: {style:'oval', color: pointColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{color: pointColor},},
                );
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
                    viewer.setStyle({hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}}); // this is done so only a single point is highlighted when hovered on (some are really close.)
                    SuppPDBResNum = Up2PdbDict[repPdbId][repPdbChainId][newPointLabel];
                    viewer.setStyle({model: suppModels, chain: repPdbChainId, resi: SuppPDBResNum, hetflag: false}, {cartoon:{style:'oval', color: pointColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}, stick:{color: pointColor}, });
                }
                else {
                    if (contactsVisible) {
                        viewer.setStyle({model: activeModel, hetflag: false, not: {or: allBindingRess}}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
                    }
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let AssemblyPDBResNum = Up2PdbMapAssembly[chainsMapAssembly[element]][newPointLabel]
                        AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                        viewer.setStyle(
                            {model: activeModel, resi: AssemblyPDBResNum, chain: element, hetflag: false},
                            {
                                cartoon:{style:'oval', color: pointColor, arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: pointColor},
                            }
                        );
                    });
                }

                if (labelsVisible) {
                    viewer.removeAllLabels(); // clearing labels from previous hovered residue (residues might be almost superposed in plot. Hiding it so only one is visible)
                    if (activeModel == "superposition") {
                        
                        let resSel = {model: suppModels, resi: SuppPDBResNum, chain: repPdbChainId, hetflag: false};
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        viewer.addLabel(
                            resName + String(Pdb2UpDict[repPdbId][repPdbChainId][SuppPDBResNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            true,
                        );
                    }
                    else{
                        AssemblyPDBResNums.forEach(([chain, resNum]) => {
                            let resSel = {model: activeModel, resi: resNum, chain: chain, hetflag: false}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[chain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: 'black', borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                true,
                            );
                        });

                    }
                }

                viewer.render({});
            }
            
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)

        newLastHoveredPoint = null;

        clearHighlightedRow();

        if (clickedElements.length == 0) {

            if (activeModel == "superposition") {
                viewer.setStyle({model: suppModels, hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
            }
            else {
                if (contactsVisible) {
                    viewer.setStyle({model: activeModel, hetflag: false, not: {or: allBindingRess}}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});
                }
            }

            // viewer.setStyle({hetflag: false}, {cartoon: {style:'oval', color: 'white', arrows: true, opacity: cartoonOpacity, thickness: cartoonThickness,}});

            if (labelsVisible) {
                viewer.removeAllLabels(); // clearing labels from previously hovered on residue
            }

            viewer.render();
        }
    }
});
