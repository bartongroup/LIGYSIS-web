var isAtomHovered = false; // boolean to check if an atom is hovered
var isRowHovered = false; // 

Jmol.script(applet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered

function jmolScriptCallback() { // this function is called when an atom is hovered

    var atom = Jmol.evaluateVar(applet, "_atomHovered"); // gets the atom hovered

    if (atom != -1) { // if an atom is hovered set isAtomHovered to true
        isAtomHovered = true;
    }

    var atomInfo = Jmol.getPropertyAsArray(applet, "atomInfo", `{${atom}}`); // gets the atom info of the hovered atom

    var resNum = atomInfo[0].resno; // gets the residue number of the hovered atom

    var b = 0; // boolean to check if the residue number is in any binding site

    whenNotHovering(); // clears highlighted table row before highlighting another one (2 rows will never be highlighted)

    for (const [k, v] of Object.entries(bs_ress_dict)) { // iterates through dictionary of residue numbers and their corresponding binding sites
        if (v.includes(resNum)) {
            highlightTableRow(k); // highlights the table row of the binding site
            b = 1;

            // add chart js code here
            var index = chartData[chartLab].indexOf(k);

            if (index !== -1) {

                resetChartStyles(myChart, index, "gold", 10, 16); //changes chart styles to highlight the binding site

            }

            break;
        }
    }
    if (b == 0) { // clears highlight row if the residue number is not in any binding site
        clearHighlightedRow();

        myChart.data.datasets[0].data.forEach(function(point, i) {
            resetChartStyles(myChart, i, "black", 1, 12); //changes chart styles back to default
        });

    }
}

function highlightTableRow(pointLabel) { // highlights the table row of the binding site
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("highlighted-row");
        //isRowHovered = true;
    }
}

function clearHighlightedRow() {   // clears the highlighted table row
    var highlightedRow = document.querySelector(".highlighted-row");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
        isRowHovered = false;
    }
}

function whenNotHovering() {    // clears highlighted table row when not hovering over an atom

    clearHighlightedRow();

    myChart.data.datasets[0].data.forEach(function(point, i) {
        resetChartStyles(myChart, i, "black", 1, 12);
    });
}

setInterval(function() {   // checks if an atom is hovered every 100ms
    if (!isAtomHovered && !isRowHovered) {
        whenNotHovering(); // execute your code when not hovering over an atom
    }
    else {
        console.log("This is being met")
    }
    isAtomHovered = false; // reset the flag
}, 100); // this interval has to be longer than hoverDelay in Jmol


function resetChartStyles(myChart, index, borderColor, borderWidth, radius) {
    myChart.getDatasetMeta(0).data[index].options.borderColor = borderColor; // reset to original color
    myChart.getDatasetMeta(0).data[index].options.borderWidth = borderWidth; // reset to original size or other default values
    myChart.getDatasetMeta(0).data[index].options.radius = radius; // reset to original size or other default values
    myChart.render();
}

var rows = document.querySelectorAll('#bss_table tr');

rows.forEach(row => {
    row.addEventListener('mouseover', function() {
        isRowHovered = true; // 
    });

    row.addEventListener('mouseout', function() {
        isRowHovered = false;
    });
}); 