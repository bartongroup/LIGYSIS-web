jmolInitialize("/static/js/jmol/jsmol");

var Info = {
    color: "#FFFFFF",
    height: 350,
    width: 350,
    use: "HTML5",
    j2sPath: "/static/js/jmol/jsmol/j2s",
    script: "script /static/scripts/load.txt",
}; // information to initiate jmol applet

const applet = Jmol.getApplet("jmolApplet", Info); // jmolApplet is the string ID of this Jmol applet

function jmolScriptCallback() {

    let x = Jmol.evaluateVar(applet, "_atomHovered");

    console.log(x);

    var atom = Jmol.getPropertyAsArray(applet, "atomInfo", `{${x}}`);

    var resNum = atom[0].resno;

    console.log(resNum);

    var b = 0;
    for (const [k, v] of Object.entries(bs_ress_dict)) {
        if (v.includes(resNum)) {
            console.log(k);
            highlightTableRow("P78540_1_1");
            b = 1;
            break;
        }
    }
    if (b == 0) {
        clearHighlightedRow();
    }


    
}

Jmol.script(applet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered
clearHighlightedRow();

function highlightTableRow(pointLabel) {
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("highlighted-row");
    }
}

function clearHighlightedRow() {
    var highlightedRow = document.querySelector(".highlighted-row");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
    }
}