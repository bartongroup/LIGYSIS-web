function resizeJSmol() {
    var appletContainer = document.getElementById('jmolAppletDiv');
    var newWidth = appletContainer.offsetWidth;
    
    // Optionally set a new height, if you want a different aspect ratio.
    // var newHeight = appletContainer.offsetHeight;

    // Update JSmol size dynamically.
    Jmol.resizeApplet(jmolApplet, {width: newWidth, height: newWidth});
}

// Listen for window resize events and adjust JSmol accordingly.
window.addEventListener('resize', resizeJSmol);

// Initialize JSmol size on page load.
document.addEventListener('DOMContentLoaded', (event) => {
    resizeJSmol();
}); 