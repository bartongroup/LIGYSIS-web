var lastHoveredPoint1 = null;
var newLastHoveredPoint = null;

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

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
                
                let clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row
                
                let clickedPDBResNums = seg_ress_dict[clickedPointLabel].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]); // PDB residue numbers of the clicked binding site
                
                let clickedSiteColor = chartColors[Number(clickedPointLabel)];
                
                viewer.setStyle({resi: clickedPDBResNums, invert: true, hetflag: false}, {cartoon:{style:'oval', color: 'white', arrows: true},  }); // remove sidechains and colour white everything but clicked site
                
                if (surfaceVisible) {

                    for (const [key, value] of Object.entries(surfsDict)) {
                        if (key == pointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9}); // show surface of hovered site visible at 90% opacity
                        }
                        else if (key == clickedPointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked table row site visible at 90% opacity
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0}); // hide all other surfaces
                        }
                    }
                }
            }

            else { // no row is clicked

                viewer.setStyle({}, {cartoon:{style:'oval', color: 'white', arrows: true},  });

                if (surfaceVisible) {
                    for (const [key, value] of Object.entries(surfsDict)) {
                        if (key == pointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9});
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0});
                        }
                    }
                }
            }

            highlightTableRow(pointLabel); 

            let PDBResNums = seg_ress_dict[pointLabel].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
            viewer.setStyle({resi: PDBResNums}, {cartoon:{style:'oval', color: siteColor, arrows: true}, stick:{color: siteColor}, });
            viewer.render({});
            
        }
    } else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        lastHoveredPoint1 = null;

        clearHighlightedRow();

        if (clickedElements.length > 0) { // a row is clicked

            let clickedElement = clickedElements[0]; // clicked row
            
            let clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row
            
            let clickedPDBResNums = seg_ress_dict[clickedPointLabel].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]); // PDB residue numbers of the clicked binding site
            
            let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

            viewer.setStyle({resi: clickedPDBResNums, invert: true, hetflag: false}, {cartoon:{style:'oval', color: 'white', arrows: true},  }); // remove sidechains and colour white everything but clicked site

            if (surfaceVisible) { // if surface is visible
                for (const [key, value] of Object.entries(surfsDict)) {
                    if (key == clickedPointLabel) { 
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: clickedSiteColor, opacity:0.9}); // keep surface of clicked site visible at 90% opacity
                    }
                    else {
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.0}); // hide all other surfaces
                    }
                }
            }
        }
        else { // no row is clicked

            viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}}); // remove sidechains and colour white everything

            if (surfaceVisible) {
                for (const [key, value] of Object.entries(surfsDict)) {
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.7}); // keep non-binding surface visible at 70% opacity
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.8}); // keep binding surfaces visible at 80% opacity
                    }
                }
            }
        }
        
        viewer.render({});
    }
});

document.getElementById('chartCanvas').addEventListener('click', function(e) { // when the cursor moves over the chart canvas

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (chartElement.length > 0) { // cursor is hovering over a data point
        
        let firstPoint = chartElement[0];
        let index = firstPoint.index; // index of the clicked data point
        let pointLabel = chartData[chartLab][index]; // label of the clicked data point
        let pointColor = chartColors[index]; // color of the clicked data point

        let fullPointLabel = segmentName + "_" + pointLabel;

        $.ajax({ // AJAX request to get the table data from the server
            type: 'POST', // POST request
            url: '/get_table', // URL to send the request to
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
                    newRow[0].style.setProperty('--bs-table-color', pointColor);
                    newRow[0].style.setProperty('--bs-table-hover-color', pointColor);
                    // newRow.css('color', pointColor); // Set the font color of the new row
                    tableBody.append(newRow); // Append the new row to the table body
                }

                newChartData = response;
                newChart.data.datasets[0].data = newChartData[newChartY];  // New data
                newChart.data.datasets[0].backgroundColor = pointColor;
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
    }
});

document.getElementById('newChartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    var newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (newChartElement.length > 0) { // cursor is hovering over a data point

        let newFirstPoint = newChartElement[0];
        
        const pointColor = newChart.data.datasets[0].backgroundColor;

        if (newLastHoveredPoint !== newFirstPoint.index) { // Check if the hovered point has changed

            newLastHoveredPoint = newFirstPoint.index;

            let newPointLabel = newChartData[newChartLab][newFirstPoint.index];

            viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}}); // this is done so only a single point is highlighted when hovered on (some are really close.)
            
            clearHighlightedRow();

            let PDBResNum = Up2PdbDict[repPdbId][repPdbChainId][newPointLabel];

            viewer.setStyle({resi: PDBResNum}, {cartoon:{style:'oval', color: pointColor, arrows: true}, stick:{color: pointColor}, });
            
            viewer.render({});

            highlightTableRow(newPointLabel); 
            
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)

        newLastHoveredPoint = null;

        clearHighlightedRow();

        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});

        viewer.render({});
    }
});
