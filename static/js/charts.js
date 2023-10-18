const chartX = "an_shenk";
const chartY = "MES";
const chartLab = "lab";
const newChartX = "abs_norm_shenkin";
const newChartY = "oddsratio";
const newChartLab = "UniProt_ResNum";

let myChart;
let newChart;

const chartCtx = document.getElementById("chartCanvas").getContext("2d"); 
const newChartCtx = document.getElementById("newChartCanvas").getContext("2d");

const myChartLims = { 
    an_shenk: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    MES: {sugMin: 0, sugMax: 2, min: 0, max: 5},
    RSA: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    n_ress: {sugMin: 1, sugMax: 25, min: 1, max: 70}
};
const newChartLims = {
    abs_norm_shenkin: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    oddsratio: {sugMin: 0, sugMax: 2, min: 0, max: 5},
    RSA: {sugMin: 0, sugMax: 75, min: 0, max: 100},
    pvalue: {sugMin: 0.1, sugMax: 0.75, min: 0, max: 1}
};

let chartConfig = {
    type: "scatter",
    data: {
        labels: chartData[chartX],
        datasets: [
            {
                label: "Binding sites",
                radius: 12,
                hoverRadius: 16,
                data: chartData[chartY],
                backgroundColor: chartColors,
                pointHoverBackgroundColor: chartColors,
                borderColor: "black",
                borderWidth: 2,
                hoverBorderWidth: 10,
                hoverBorderColor: "gold",
                pointHoverBorderColor: "gold",
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    align: "center",
                    text: chartX,
                },
                suggestedMin: myChartLims[chartX]["sugMin"],
                suggestedMax: myChartLims[chartX]["sugMax"],
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: chartY,
                },
                suggestedMin: myChartLims[chartY]["sugMin"],
                suggestedMax: myChartLims[chartY]["sugMax"],
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        let dataIndex = context[0].dataIndex; // Assuming you are only hovering over a single point
                        return chartData[chartLab][dataIndex]; // Use the 'lab' property from your data
                    },
                }
            }
        },
    }
};

let newChartConfig = { // configuration for the new chart
    type: "scatter",
    data: {
        labels: newChartData[newChartX],
        datasets: [
            {
                label: "Binding residues",
                radius: 8,
                data: newChartData[newChartY],
                backgroundColor: chartColors[0],
                pointHoverBackgroundColor: chartColors[0],
                borderColor: "black",
                borderWidth: 2,
                hoverRadius: 16,
                hoverBorderWidth: 10,
                hoverBorderColor: "gold",
                pointHoverBorderColor: "gold",
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    align: "center",
                    text: newChartX,
                },
                suggestedMin: newChartLims[newChartX]["sugMin"],
                suggestedMax: newChartLims[newChartX]["sugMax"],
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: newChartY,
                },
                suggestedMin: newChartLims[newChartY]["sugMin"],
                suggestedMax: newChartLims[newChartY]["sugMax"],
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        let dataIndex = context[0].dataIndex; // Assuming you are only hovering over a single point
                        return newChartData[newChartLab][dataIndex]; // Use the 'UniProt_ResNum' property from your data
                    },
                }
            }
        }
    },
};

myChart = new Chart(chartCtx, chartConfig);

newChart = new Chart(newChartCtx, newChartConfig); // create the new chart

const xAxisTitleDropdown = document.getElementById("xAxisTitle2");
const yAxisTitleDropdown = document.getElementById("yAxisTitle2");

xAxisTitleDropdown.value = newChart.options.scales.x.title.text;
yAxisTitleDropdown.value = newChart.options.scales.y.title.text;

xAxisTitleDropdown.addEventListener("change", function () {
    updateChart("x", xAxisTitleDropdown, newChart, newChartData, newChartLims); // event listener for change in x axis title
});

yAxisTitleDropdown.addEventListener("change", function () {
    updateChart("y", yAxisTitleDropdown, newChart, newChartData, newChartLims); // event listener for change in y axis title
});


var lastHoveredPoint1 = null;

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas
    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (chartElement.length > 0) { // cursor is hovering over a data point
        let firstPoint = chartElement[0];

        if (lastHoveredPoint1 !== firstPoint.index) { // Check if the hovered point has changed
            lastHoveredPoint1 = firstPoint.index;

            let pointLabel = chartData[chartLab][firstPoint.index];
            let siteColor = chartColors[Number(pointLabel.split("_").pop())];

            if (surfaceVisible) {
                for (const [key, value] of Object.entries(surfsDict)) {
                    if (key == pointLabel) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity:0.9});
                    }
                    else {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: 'white', opacity:0.0});
                    }
                }
            }
            viewer.setStyle({resi: seg_ress_dict[pointLabel]}, {cartoon:{style:'oval', color: siteColor, arrows: true}, stick:{color: siteColor}, });
            viewer.render({});
            highlightTableRow(pointLabel); 
            isRowHovered = true;
        }
    } else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        lastHoveredPoint1 = null;

        clearHighlightedRow();
        isRowHovered = false;
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
        if (surfaceVisible) {
            console.log("Mouseout from point!")
            if (surfaceVisible) {
                for (const [key, value] of Object.entries(surfsDict)) {
                    if (key == "non_binding") {
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.7});
                    }
                    else {
                        let siteColor = chartColors[Number(key.split("_").pop())];
                        viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.8});
                    }
                }
            }
        }
        viewer.render({});
    }
});

// document.getElementById('chartCanvas').addEventListener('mouseout', function(e) { // when the cursor mopves out of the chart canvas
//     if (lastHoveredPoint1 !== null) {
//         lastHoveredPoint1 = null;

//         clearHighlightedRow();
//         isRowHovered = false;
//         if (surfaceVisible) {
//             console.log("Mouseout from canvas!")
//             if (surfaceVisible) {
//                 for (const [key, value] of Object.entries(surfsDict)) {
//                     if (key == "non_binding") {
//                         viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: 'white', opacity:0.7});
//                     }
//                     else {
//                         let siteColor = chartColors[Number(key.split("_").pop())];
//                         viewer.setSurfaceMaterialStyle(surfsDict[key].surfid, {color: siteColor, opacity:0.8});
//                     }
//                 }
//             }
//         }
//         viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
//         viewer.render({});
//     }
// });


var newLastHoveredPoint = null;

document.getElementById('newChartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas
    var newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (newChartElement.length > 0) { // cursor is hovering over a data point
        let newFirstPoint = newChartElement[0];
        
        const pointColor = newChart.data.datasets[0].backgroundColor;

        if (newLastHoveredPoint !== newFirstPoint.index) { // Check if the hovered point has changed
            newLastHoveredPoint = newFirstPoint.index;

            let newPointLabel = newChartData[newChartLab][newFirstPoint.index];

            if (surfaceVisible) {
                viewer.removeAllSurfaces();
                viewer.addSurface( // adds coloured surface to binding site
                    $3Dmol.SurfaceType.ISO,
                    {opacity: 0.9, color: pointColor},
                    {resi: newPointLabel, hetflag: false},
                    {resi: newPointLabel, hetflag: false}
                    );
                viewer.addSurface( // adds white surface to rest of protein
                    $3Dmol.SurfaceType.ISO,
                    {opacity: 0.7, color: 'white'},
                    {resi: newPointLabel, invert: true, hetflag: false},
                    {hetflag: false},
                    );
            }
            viewer.setStyle({resi: newPointLabel}, {cartoon:{style:'oval', color: pointColor, arrows: true}, stick:{color: pointColor}, });
            viewer.render({});

            highlightTableRow(newPointLabel); 
            isRowHovered = true;
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        newLastHoveredPoint = null;

        clearHighlightedRow();
        isRowHovered = false;
        if (surfaceVisible) {
            viewer.removeAllSurfaces();
            viewer.addSurface(
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.7, color: 'white'},
                {hetflag: false},
                {hetflag: false}
            );
        }
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
        viewer.render({});
    }
});

document.getElementById('newChartCanvas').addEventListener('mouseout', function(e) { // when the cursor mopves out of the chart canvas
    if (newLastHoveredPoint !== null) {
        newLastHoveredPoint = null;

        clearHighlightedRow();
        isRowHovered = false;
        
    }
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data

    console.log(this);

    if (index !== -1) {
        
        resetChartStyles(newChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site

        if (surfaceVisible) {
            viewer.removeAllSurfaces();
            viewer.addSurface( // adds coloured surface to binding site
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.9, color: "red"},
                {resi: rowId, hetflag: false},
                {resi: rowId, hetflag: false}
                );
            viewer.addSurface( // adds white surface to rest of protein
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.7, color: 'white'},
                {resi: rowId, invert: true, hetflag: false},
                {hetflag: false},
                );
        }
        viewer.setStyle({resi: rowId}, {cartoon:{style:'oval', color: "red", arrows: true}, stick:{color: "red"}, });
        viewer.render({});
    }
}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows
    newChart.data.datasets[0].data.forEach(function(point, i) {
        resetChartStyles(newChart, i, "black", 2, 8); // resets chart styles to default

        if (surfaceVisible) {
            viewer.removeAllSurfaces();
            viewer.addSurface(
                $3Dmol.SurfaceType.ISO,
                {opacity: 0.7, color: 'white'},
                {hetflag: false},
                {hetflag: false}
            );
        }
        viewer.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});
        viewer.render({});
    });
});