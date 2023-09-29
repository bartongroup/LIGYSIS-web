const Info = {
    color: "#FFFFFF",
    height: 500,
    width: 500,
    use: "HTML5",
    j2sPath: "/static/js/jmol/jsmol/j2s",
    script: "script /static/scripts/load.txt",
}; // information to initiate jmol applet

jmolInitialize("/static/js/jmol/jsmol"); // initialise Jmol applet

const applet = Jmol.getApplet("jmolApplet", Info); // "jmolApplet" is the string ID of this Jmol applet

var isAtomHovered = false; // boolean to check if a JSMOL atom is hovered
var isRowHovered = false; // boolean to check if a table row is hovered

Jmol.script(applet, "set HoverCallback 'jmolScriptCallback'"); // calls jmolScriptCallback when an atom is hovered