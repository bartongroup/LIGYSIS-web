// This is a library of functions that are used to integrate the JSMOL applet with the binding site table and chart.

function updateChart(axes, dropdownElem, myChart, chartData, myChartLims) { // updates the axes of the binding site chart according to the dropdowns

    const selectedTitle = dropdownElem.value;

    if (axes === "x") {
        myChart.data.labels = chartData[selectedTitle];
        chartX = selectedTitle;
    } else if (axes === "y") {
        myChart.data.datasets[0].data = chartData[selectedTitle];
        chartY = selectedTitle; 
    }

    if (selectedTitle === "MES") {
        myChart.options.scales[axes].type = "logarithmic";
        myChart.options.scales[axes].ticks.autoSkip = true;
        myChart.options.scales[axes].ticks.callback = Chart.Ticks.formatters.logarithmic;
        if (axes === "y") {
            myChart.options.plugins.annotation.annotations.line1.display = true;
        }
        else if (axes === "x") {
            myChart.options.plugins.annotation.annotations.line2.display = true;
        }
    } else {
        myChart.options.scales[axes].type = "linear";
        myChart.options.scales[axes].ticks.autoSkip = false;
        myChart.options.scales[axes].ticks.callback = Chart.Ticks.formatters.numeric;
        if (axes === "y") {
            myChart.options.plugins.annotation.annotations.line1.display = false;
        }
        else if (axes === "x") {
            myChart.options.plugins.annotation.annotations.line2.display = false;
        }
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

function downloadFile(filename) { // downloads the file
    var link = document.createElement('a');
    link.href = filename;
    link.download = filename.split('/').pop();  // This will suggest the filename to save as
    link.click();  // Simulate click
}

$(document).ready(function(){ // enables tooltips
    $('[data-toggle="tooltip"]').tooltip();   
});

function downloadCSV(filepath) { // downloads the file in CSV format by redirecting to the download-csv route
    window.location.href = '/download-csv?filepath=' + filepath;
}

function showMenu(functionName) { // Show the ChimeraX/PyMol menu when a button is clicked
    if (menuRow.style.display === 'block' && currentFunction === functionName) {
        menuRow.style.display = 'none';  // Hide menu if the same button is clicked again
    }
    else {
        currentFunction = functionName;
        const menuRow = document.getElementById('menuRow');
        menuRow.style.display = 'block';  // Show menu (you can customize positioning)
    }
}

function executeFunction() { // Execute the download function based on the selected option
    const selectedTool = document.getElementById('toolSelect').value;
    const functionName = currentFunction + selectedTool;  // Concatenate function name and tool
    if (typeof window[functionName] === 'function') {
        window[functionName]();  // Call the respective function
    } else {
        alert('Function not available: ' + functionName);
    }
    document.getElementById('menuRow').style.display = 'none';  // Hide menu after selection
}

const pdbeChemUrlRoot = "https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/";
// Function to update the slab clipping planes

function updateSlab() {
    // Ensure nearPlane is less than farPlane
    // if (nearPlane >= farPlane) {
    //     // Optionally handle invalid input
    //     nearValueDisplay.style.color = 'red';
    //     farValueDisplay.style.color = 'red';
    //     return;
    // } else {
    //     nearValueDisplay.style.color = '';
    //     farValueDisplay.style.color = '';
    // }

    viewer.setSlab(nearPlane, farPlane);
    viewer.render();
}

function spinViewer() {
    console.log(spinning);
    console.log(spinning === false);
    if (spinning === false) {
        console.log("Spinning");
        viewer.spin("y", 1);
        spinning = true;
    } else {
        console.log("Not spinning");
        viewer.spin(false);
        spinning = false;
    }
}

function toggleSpinner1() {
    spinner1.style.display = spinner1.style.display === 'none' ? 'flex' : 'none';
    spinnerImage1.style.display = spinnerImage1.style.display === 'none' ? 'flex' : 'none';
}

function toggleSpinner2() {
    spinner2.style.display = spinner2.style.display === 'none' ? 'flex' : 'none';
    spinnerImage2.style.display = spinnerImage2.style.display === 'none' ? 'flex' : 'none';
    overlay2.style.display = overlay2.style.display === 'none' ? 'flex' : 'none';    
}

function toggleSpinner3() {
    spinner3.style.display = spinner3.style.display === 'none' ? 'flex' : 'none';
    spinnerImage3.style.display = spinnerImage3.style.display === 'none' ? 'flex' : 'none';
    overlay3.style.display = overlay3.style.display === 'none' ? 'flex' : 'none';    
}