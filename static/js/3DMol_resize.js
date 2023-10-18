function resize3DMol() {
    var appletContainer = document.getElementById('3DMolAppletHolder');
    var appletDiv = document.getElementById('container-01');
    

    // padding of appletDiv
    var appletPadding = parseInt(window.getComputedStyle(appletContainer).paddingLeft, 10);

    var newWidth = appletContainer.offsetWidth;

    var correctedWidth = newWidth - (appletPadding * 2);

    console.log(newWidth, appletPadding);

    appletDiv.style.height = `${correctedWidth}px`;
    appletDiv.style.width = `${correctedWidth}px`;
    // var newHeight = appletContainer.offsetHeight;

    // Update 3DMol.js size dynamically.
    viewer.setHeight(newWidth);
    viewer.setWidth(newWidth);
    viewer.resize();
    //Jmol.resizeApplet(jmolApplet, {width: newWidth, height: newWidth});
}

// Listen for window resize events and adjust JSmol accordingly.
window.addEventListener('resize', resize3DMol);

// Initialize JSmol size on page load.
document.addEventListener('DOMContentLoaded', (event) => {
    resize3DMol();
}); 