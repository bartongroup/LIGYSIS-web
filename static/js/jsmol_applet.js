// const proteinScript = '/static/scripts/' + segmentName + '_loader.txt'; // Change to the appropriate protein script
const appearanceScript = '/static/scripts/styles.txt';
const selectorScript = '/static/scripts/' + segmentName + '_selector.txt'; // Change to the appropriate protein script

const combinedScript = `
load /static/data/structures/${segmentReps[segmentId]["rep"]}_trans.pdb;
script ${appearanceScript};
script ${selectorScript};
`;

var Info = {
    color: "#FFFFFF",
    height: 700,
    width: 700,
    use: "HTML5",
    j2sPath: "/static/js/jmol/jsmol/j2s",
    script: combinedScript,
    readyFunction: jmolIsReady,
}; // information to initiate jmol applet

jmolInitialize("/static/js/jmol/jsmol"); // initialise Jmol applet

Jmol.getApplet("jmolApplet", Info); // "jmolApplet" is the string ID of this Jmol applet

function jmolIsReady(jmolApplet) {
    // console.log("JSmol is ready!"); // Debug line to indicate the applet is ready
    Jmol.script(jmolApplet, "set HoverCallback 'jmolScriptCallback'"); // Set the hover callback now that the applet is ready
}

var isAtomHovered = false; // boolean to check if a JSMOL atom is hovered
var isRowHovered = false; // boolean to check if a table row is hovered

// Jmol.script(jmolApplet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered