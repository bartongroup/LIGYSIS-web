// This script is used to highlight/clear a binding site chart point when the corresponding table row is hovered over/mouseout.
// It also updates the boolean iSRowHovered to true/false when a table row is hovered over/mouseout. 

$('table#bss_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows

    let rowId = this.id;  // gets the row id of the table row that is hovered over

    if (!this.classList.contains('clicked-row')) { // row is not clicked

        highlightTableRow(rowId); // highlights the table row of the binding site

        let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }
    }

    // isRowHovered = true; // set isRowHovered to true when a table row is hovered
    
    let siteColor = chartColors[Number(rowId.split("_").pop())]; // gets the binding site color of the table row that is hovered over

    // implement halos on 3Dmol.js //
    
    if (surfaceVisible) {
        for (const [key, value] of Object.entries(surfsDict)) {
            if (key == rowId) {
                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9});
            }
            else {
                viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0});
            }
        }
    }
    viewer.setStyle({resi: seg_ress_dict[rowId]}, {cartoon:{style:'oval', color: siteColor, arrows: true}, stick:{color: siteColor}, });
    
    viewer.render({});
    
}).on('mouseout', 'tr', function () {
     // isRowHovered = false; // set isRowHovered to false when a table row is not hovered

    let rowId = this.id;  // gets the row id of the table row that is hovered over

    let classList = this.classList;

    let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data
    
    if (!classList.contains('clicked-row')) { // row is not clicked

        if (classList.contains('highlighted-row')) {
            clearHighlightedRow(); // clears highlighted table row
    
            resetChartStyles(myChart, index, "black", 1, 12); // resets chart styles to default
        }

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

        viewer.setStyle({resi: seg_ress_dict[rowId]}, {cartoon: {style:'oval', color: 'white', arrows: true}});

        viewer.render({});
    }
    
}).on('click', 'tr', function () {
    
    let rowId = this.id;  // gets the row id of the table row that is clicked
    let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data
    var classList = this.classList;
    var clickedElements = document.getElementsByClassName("clicked-row");
    let siteColor = chartColors[Number(rowId.split("_").pop())]; // gets the binding site color of the table row that is hovered over
    
    if (classList.contains('highlighted-row')) {
        clearHighlightedRow(); // clears highlighting from table row, before applying clicked styles
    }

    if (classList.contains('clicked-row')) { // row is already clicked
        clearClickedRows();
        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }
        highlightTableRow(rowId); // highlights the table row of the binding site
    }

    else {
        if (clickedElements) { // any OTHER row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                viewer.setStyle({resi: seg_ress_dict[clickedElementId]}, {cartoon: {style:'oval', color: 'white', arrows: true}});
                viewer.render({});
            }
            clearClickedRows();
            myChart.data.datasets[0].data.forEach(function(point, i) {
                resetChartStyles(myChart, i, "black", 1, 12); // resets chart styles to default
            });
        }

        if (index !== -1) {
            resetChartStyles(myChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the binding site
        }

        clickTableRow(this);

    }

    if (surfaceVisible) {
        for (const [key, value] of Object.entries(surfsDict)) {
            if (key == rowId) {
                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9});
            }
            else {
                viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0});
            }
        }
    }
    viewer.setStyle({resi: seg_ress_dict[rowId]}, {cartoon:{style:'oval', color: siteColor, arrows: true}, stick:{color: siteColor}, });
    
    viewer.render({});
    
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data

    // console.log(this);

    if (index !== -1) {
        
        resetChartStyles(newChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site

        if (surfaceVisible) {
            viewer.removeAllSurfaces();
            viewer.addSurface( // adds coloured surface to binding site
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.9, color: "red"},
                {resi: rowId, hetflag: false},
                {resi: rowId, hetflag: false}
                );
            viewer.addSurface( // adds white surface to rest of protein
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.7, color: 'white'},
                {resi: rowId, invert: true, hetflag: false},
                {hetflag: false},
                );
        }
        viewer.setStyle({resi: rowId}, {cartoon:{style:'oval', color: "red", arrows: true}, stick:{color: "red"}, });
        viewer.render({});
    }
}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows
    newChart.data.datasets[0].data.forEach(function(point, i) {
        resetChartStyles(newChart, i, "black", 2, 8); // resets chart styles to default

        if (surfaceVisible) {
            viewer.removeAllSurfaces();
            viewer.addSurface(
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.7, color: 'white'},
                {hetflag: false},
                {hetflag: false}
            );
        }
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
        viewer.render({});
    });
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
