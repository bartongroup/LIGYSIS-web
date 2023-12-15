// This is a library of functions that are used to integrate the JSMOL applet with the binding site table and chart.

function updateChart(axes, dropdownElem, myChart, chartData, myChartLims) { // updates the axes of the binding site chart according to the dropdowns

    const selectedTitle = dropdownElem.value;

    if (axes === "x") {
        myChart.data.labels = chartData[selectedTitle];
    } else if (axes === "y") {
        myChart.data.datasets[0].data = chartData[selectedTitle];
    }

    if (selectedTitle === "MES") {
        myChart.options.scales[axes].type = "logarithmic";
        myChart.options.scales[axes].ticks.autoSkip = false;
        myChart.options.plugins.annotation.annotations.line1.display = true;
    } else {
        myChart.options.scales[axes].type = "linear";
        myChart.options.scales[axes].ticks.autoSkip = true;
        myChart.options.plugins.annotation.annotations.line1.display = false;
    }

    myChart.options.scales[axes].title.text = selectedTitle;
    myChart.options.scales[axes].suggestedMin = myChartLims[selectedTitle]["sugMin"];
    myChart.options.scales[axes].suggestedMax = myChartLims[selectedTitle]["sugMax"];
    
    myChart.update();
}

function resetChartStyles(myChart, index, borderColor, borderWidth, radius) { // resets the chart styles
    myChart.getDatasetMeta(0).data[index].options.borderColor = borderColor; // reset border colour
    myChart.getDatasetMeta(0).data[index].options.borderWidth = borderWidth; // reset border width
    myChart.getDatasetMeta(0).data[index].options.radius = radius; // reset radius
    myChart.render();
}

function clearHighlightedRow() {   // clears the highlighted table row
    var highlightedRow = document.querySelector(".highlighted-row");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
    }
}

function whenNotHovering() {    // clears highlighted table row when not hovering over an atom

    clearHighlightedRow(); // clears highlighted table row

    myChart.data.datasets[0].data.forEach(function(point, i) { // clears highlighted chart point
        resetChartStyles(myChart, i, "black", 1, 12);
    });
}

function highlightTableRow(pointLabel) { // highlights the table row of the binding site
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("highlighted-row");
    }
}

function clickTableRow(row) { // highlights the table row of the binding site
    row.classList.add("clicked-row"); 
}

function clickTableTowById(pointLabel) { // highlights the table row of the binding site
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("clicked-row"); 
    }
}

function clearClickedRows() {   // clears the highlighted table row
    var clickedRow = document.querySelector(".clicked-row");
    if (clickedRow) {
        clickedRow.classList.remove("clicked-row");
    }
}

function saveImage(canvasId, filename) {
    var canvas = document.getElementById(canvasId);
    var link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1);
    link.download = `${filename}.png`;
    link.click();
}

function downloadFile(filename) {
    // Specify the path to the file

    // Create an anchor element and trigger download
    var link = document.createElement('a');
    link.href = filename;
    link.download = filename.split('/').pop();  // This will suggest the filename to save as
    // document.body.appendChild(link);  // Append to body
    link.click();  // Simulate click
    // document.body.removeChild(link);  // Remove the link from DOM
}


$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});