// This script is used to highlight/clear a binding site chart point when the corresponding table row is hovered over/mouseout.
// It also updates the boolean iSRowHovered to true/false when a table row is hovered over/mouseout. 

$('table#bss_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    isRowHovered = true; // set isRowHovered to true when a table row is hovered
    let rowId = this.id;  // gets the row id of the table row that is hovered over
    let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data

    if (index !== -1) {
        resetChartStyles(myChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site
    }
    
}).on('mouseout', 'tr', function () {
    isRowHovered = false; // set isRowHovered to false when a table row is not hovered
    myChart.data.datasets[0].data.forEach(function(point, i) {
        resetChartStyles(myChart, i, "black", 1, 12); // resets chart styles to default
    });
});

// THIS IS THE EVENT LISTENER THAT CHANGES THE AXES OF THE BINDING SITES PLOTS ACCORDING TO DROPDOWNS

document.addEventListener("DOMContentLoaded", function () {

    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");

    xAxisTitleDropdown.value = myChart.options.scales.x.title.text;
    yAxisTitleDropdown.value = myChart.options.scales.y.title.text;

    xAxisTitleDropdown.addEventListener("change", function () {
        updateChart("x", xAxisTitleDropdown, myChart, chartData, myChartLims);
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        updateChart("y", yAxisTitleDropdown, myChart, chartData, myChartLims);
    });

});
