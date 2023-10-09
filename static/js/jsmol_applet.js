// const proteinScript = '/static/scripts/' + segmentName + '_loader.txt'; // Change to the appropriate protein script
const appearanceScript = '/static/scripts/styles.txt';
const selectorScript = '/static/scripts/' + segmentName + '_selector.txt'; // Change to the appropriate protein script

const combinedScript = `
load /static/data/structures/${segmentReps[segmentId]["rep"]}_trans.pdb;
script ${appearanceScript};
script ${selectorScript};
`;

const Info = {
    color: "#FFFFFF",
    height: 700,
    width: 700,
    use: "HTML5",
    j2sPath: "/static/js/jmol/jsmol/j2s",
    script: combinedScript,
}; // information to initiate jmol applet

jmolInitialize("/static/js/jmol/jsmol"); // initialise Jmol applet

const applet = Jmol.getApplet("jmolApplet", Info); // "jmolApplet" is the string ID of this Jmol applet

var isAtomHovered = false; // boolean to check if a JSMOL atom is hovered
var isRowHovered = false; // boolean to check if a table row is hovered

Jmol.script(applet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered