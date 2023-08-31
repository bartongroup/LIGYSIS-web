document.addEventListener("DOMContentLoaded", function () {
    // Add a hover event listener to the chart
    chart.canvas.addEventListener("mousemove", function (event) {
        var activePoints = chart.getElementsAtEvent(event);
        if (activePoints.length > 0) {
            var tooltipTitle = chart.options.plugins.tooltips.callbacks.title(activePoints, chart.tooltip);
            highlightTableRow(tooltipTitle);
        } else {
            clearHighlightedRow();
        }
    });
});

function highlightTableRow(tooltipTitle) {
    var rowId = tooltipTitle; // Assuming row ID matches the tooltip title
    var row = document.getElementById(rowId);
    if (row) {
        row.classList.add("highlighted-row");
    }
}

function clearHighlightedRow() {
    var highlightedRow = document.querySelector(".table__header");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
    }
}
