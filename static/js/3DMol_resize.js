function resize3DMol() {
    var appletContainer = document.getElementById('3DMolAppletHolder');
    var appletDiv = document.getElementById('container-01');
    var newWidth = appletContainer.offsetWidth;

    appletDiv.style.height = `${newWidth}px`;
    appletDiv.style.width = `${newWidth}px`;
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