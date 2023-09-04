const Info = {
    color: "#FFFFFF",
    height: 500,
    width: 600,
    use: "HTML5",
    j2sPath: "/static/js/jmol/jsmol/j2s",
    script: "script /static/scripts/load.txt",
}; // information to initiate jmol applet

jmolInitialize("/static/js/jmol/jsmol"); // initialise Jmol applet

const applet = Jmol.getApplet("jmolApplet", Info); // "jmolApplet" is the string ID of this Jmol applet

var isHovered = false; // boolean to check if an atom is hovered

Jmol.script(applet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered

function jmolScriptCallback() { // this function is called when an atom is hovered

    var atom = Jmol.evaluateVar(applet, "_atomHovered"); // gets the atom hovered

    if (atom != -1) { // if an atom is hovered set isHovered to true
        isHovered = true;
    }

    var atomInfo = Jmol.getPropertyAsArray(applet, "atomInfo", `{${atom}}`); // gets the atom info of the hovered atom

    var resNum = atomInfo[0].resno; // gets the residue number of the hovered atom

    var b = 0; // boolean to check if the residue number is in any binding site

    clearHighlightedRow(); // clears highlighted table row before highlighting another one (2 rows will never be highlighted)

    for (const [k, v] of Object.entries(bs_ress_dict)) { // iterates through dictionary of residue numbers and their corresponding binding sites
        if (v.includes(resNum)) {
            highlightTableRow(k); // highlights the table row of the binding site
            b = 1;
            break;
        }
    }
    if (b == 0) { // clears highlight row if the residue number is not in any binding site
        clearHighlightedRow();
    }
}

function highlightTableRow(pointLabel) { // highlights the table row of the binding site
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("highlighted-row");
    }
}

function clearHighlightedRow() {   // clears the highlighted table row
    var highlightedRow = document.querySelector(".highlighted-row");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
    }
}

function whenNotHovering() {    // clears highlighted table row when not hovering over an atom
    clearHighlightedRow();
}

setInterval(function() {   // checks if an atom is hovered every 100ms
    if (!isHovered) {
        whenNotHovering(); // execute your code when not hovering over an atom
    }
    isHovered = false; // reset the flag
}, 100); // this interval has to be longer than hoverDelay in Jmol