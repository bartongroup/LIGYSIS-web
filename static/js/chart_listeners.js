var lastHoveredPoint1 = null;
var newLastHoveredPoint = null;

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas
    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (chartElement.length > 0) { // cursor is hovering over a data point
        let firstPoint = chartElement[0];

        if (lastHoveredPoint1 !== firstPoint.index) { // Check if the hovered point has changed
            viewer.setStyle({}, {cartoon:{style:'oval', color: 'white', arrows: true},  });
            clearHighlightedRow();
            lastHoveredPoint1 = firstPoint.index;

            let pointLabel = chartData[chartLab][firstPoint.index];
            let siteColor = chartColors[Number(pointLabel.split("_").pop())];

            resetChartStyles(myChart, firstPoint.index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site

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
            //viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
            viewer.setStyle({resi: seg_ress_dict[pointLabel]}, {cartoon:{style:'oval', color: siteColor, arrows: true}, stick:{color: siteColor}, });
            viewer.render({});
            highlightTableRow(pointLabel); 
            //isRowHovered = true;
        }
    } else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        lastHoveredPoint1 = null;

        clearHighlightedRow();
        //isRowHovered = false;
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
        if (surfaceVisible) {
            console.log("Mouseout from point!")
            if (surfaceVisible) {
                for (const [key, value] of Object.entries(surfsDict)) {
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.7});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.8});
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

        // siteIsClicked = true;
        // Add the clicked point to the list
        // clickedPoints.push(index);

        // resetChartStyles(myChart, index, "#50C878", 10, 16); // changes chart styles to highlight the binding site

        $.ajax({ // AJAX request to get the table data from the server
            type: 'POST', // POST request
            url: '/get_table', // URL to send the request to
            contentType: 'application/json;charset=UTF-8', // content type
            data: JSON.stringify({'label': pointLabel}), // data to send
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
    // else {

    // }
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
            
            // isRowHovered = false;

            // if (surfaceVisible) {
            //     viewer.removeAllSurfaces();
            //     viewer.addSurface( // adds coloured surface to binding site
            //         $3Dmol.SurfaceType.ISO,
            //         {opacity: 0.9, color: pointColor},
            //         {resi: newPointLabel, hetflag: false},
            //         {resi: newPointLabel, hetflag: false}
            //         );
            //     viewer.addSurface( // adds white surface to rest of protein
            //         $3Dmol.SurfaceType.ISO,
            //         {opacity: 0.7, color: 'white'},
            //         {resi: newPointLabel, invert: true, hetflag: false},
            //         {hetflag: false},
            //     );
            // }
            viewer.setStyle({resi: newPointLabel}, {cartoon:{style:'oval', color: pointColor, arrows: true}, stick:{color: pointColor}, });
            
            viewer.render({});

            highlightTableRow(newPointLabel); 
            // isRowHovered = true;
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        newLastHoveredPoint = null;

        clearHighlightedRow();

        // isRowHovered = false;

        // if (surfaceVisible) {
        //     viewer.removeAllSurfaces();
        //     viewer.addSurface(
        //         $3Dmol.SurfaceType.ISO,
        //         {opacity: 0.7, color: 'white'},
        //         {hetflag: false},
        //         {hetflag: false}
        //     );
        // }
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});

        viewer.render({});
    }
});

// document.getElementById('newChartCanvas').addEventListener('mouseout', function(e) { // when the cursor mopves out of the chart canvas
//     if (newLastHoveredPoint !== null) {
//         newLastHoveredPoint = null;

//         clearHighlightedRow();

//         // isRowHovered = false;
        
//     }
// });
