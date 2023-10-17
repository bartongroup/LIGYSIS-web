// This is a library of functions that are used to integrate the JSMOL applet with the binding site table and chart.

function updateChart(axes, dropdownElem, myChart, chartData, myChartLims) { // updates the axes of the binding site chart according to the dropdowns

    const selectedTitle = dropdownElem.value;

    if (axes === "x") {
        myChart.data.labels = chartData[selectedTitle];
    } else if (axes === "y") {
        myChart.data.datasets[0].data = chartData[selectedTitle];
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

// function jmolScriptCallback() { // this function is called when an atom is hovered

//     var atom = Jmol.evaluateVar(jmolApplet, "_atomHovered"); // gets the atom hovered

//     if (atom != -1) { // if an atom is hovered set isAtomHovered to true
//         isAtomHovered = true;
//     }

//     var atomInfo = Jmol.getPropertyAsArray(jmolApplet, "atomInfo", `{${atom}}`); // gets the atom info of the hovered atom

//     var resNum = atomInfo[0].resno; // gets the residue number of the hovered atom

//     var b = 0; // boolean to check if the residue number is in any binding site

//     whenNotHovering(); // clears highlighted table row before highlighting another one (2 rows will never be highlighted)

//     for (const [k, v] of Object.entries(bs_ress_dict)) { // iterates through dictionary of residue numbers and their corresponding binding sites
//         if (v.includes(resNum)) {
//             highlightTableRow(k); // highlights the table row of the binding site
//             b = 1;
//             var index = chartData[chartLab].indexOf(k);
//             if (index !== -1) {
//                 resetChartStyles(myChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site
//             }
//             break;
//         }
//     }
//     if (b == 0) { // clears highlight row if the residue number is not in any binding site
//         whenNotHovering(); // clears highlighted table row and chart point before highlighting another one (2 rows/points will never be highlighted)
//     }
// }

// setInterval(function() {   // checks if an atom is hovered every 100ms
//     if (!isAtomHovered && !isRowHovered) {
//         whenNotHovering(); // execute your code when not hovering over an atom and a row is not hovered
//     }
//     isAtomHovered = false; // reset the flag
// }, 100); // this interval has to be longer than hoverDelay in Jmol

// END