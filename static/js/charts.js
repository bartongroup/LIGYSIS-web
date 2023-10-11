const chartX = "an_shenk";
const chartY = "MES";
const chartLab = "lab";
const newChartX = "abs_norm_shenkin";
const newChartY = "oddsratio";
const newChartLab = "UniProt_ResNum";

let myChart;
let newChart;
// let newChartData;

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

const chartConfig = {
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
        // onClick: function(event, array) { // event listener for click on chart points
        //     if (array.length > 0) {

        //         let index = array[0].index; // index of the clicked data point
        //         let pointLabel = chartData[chartLab][index]; // label of the clicked data point
        //         let pointColor = chartColors[index]; // color of the clicked data point

        //         //$('#bs_ress_table').show(); // show the table
    
        //         $.ajax({ // AJAX request to get the table data from the server
        //             type: 'POST', // POST request
        //             url: '/get_table', // URL to send the request to
        //             contentType: 'application/json;charset=UTF-8', // content type
        //             data: JSON.stringify({'label': pointLabel}), // data to send
        //             success: function(response) { // function to execute when the request is successful
        //                 const keyOrder = cc; // order of the keys in the response object
        //                 let tableBody = $('#bs_ress_table tbody'); // tbody of the table
        //                 tableBody.empty(); // empty the tbody
        //                 for (var i = 0; i < response[keyOrder[0]].length; i++) { // First loop to iterate through rows
        //                     let newRow = $('<tr class="table__row">'); // Create a new row
        //                     newRow.attr('id', response[newChartLab][i]); // Assign ID dynamically to each row
        //                     $.each(keyOrder, function(j, key) { // Second loop to iterate through keys (columns)
        //                         newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
        //                     });
        //                     newRow[0].style.setProperty('--bs-table-color', pointColor);
        //                     newRow[0].style.setProperty('--bs-table-hover-color', pointColor);
        //                     // newRow.css('color', pointColor); // Set the font color of the new row
        //                     tableBody.append(newRow); // Append the new row to the table body
        //                 }

        //                 // Data for the new chart
        //                 newChartData = response; // data for the new chart
        //                 // let newChartConfig = { // configuration for the new chart
        //                 //     type: "scatter",
        //                 //     data: {
        //                 //         labels: newChartData[newChartX],
        //                 //         datasets: [
        //                 //             {
        //                 //                 label: "Binding residues",
        //                 //                 radius: 8,
        //                 //                 data: newChartData[newChartY],
        //                 //                 backgroundColor: pointColor,
        //                 //                 pointHoverBackgroundColor: pointColor,
        //                 //                 borderColor: "black",
        //                 //                 borderWidth: 2,
        //                 //                 hoverRadius: 16,
        //                 //                 hoverBorderWidth: 10,
        //                 //                 hoverBorderColor: "gold",
        //                 //                 pointHoverBorderColor: "gold",
        //                 //             }
        //                 //         ]
        //                 //     },
        //                 //     options: {
        //                 //         responsive: true,
        //                 //         scales: {
        //                 //             x: {
        //                 //                 title: {
        //                 //                     display: true,
        //                 //                     align: "center",
        //                 //                     text: newChartX,
        //                 //                 },
        //                 //                 suggestedMin: newChartLims[newChartX]["sugMin"],
        //                 //                 suggestedMax: newChartLims[newChartX]["sugMax"],
        //                 //             },
        //                 //             y: {
        //                 //                 title: {
        //                 //                     display: true,
        //                 //                     align: "center",
        //                 //                     text: newChartY,
        //                 //                 },
        //                 //                 suggestedMin: newChartLims[newChartY]["sugMin"],
        //                 //                 suggestedMax: newChartLims[newChartY]["sugMax"],
        //                 //             }
        //                 //         },
        //                 //         plugins: {
        //                 //             legend: {
        //                 //                 display: false,
        //                 //             },
        //                 //             tooltip: {
        //                 //                 callbacks: {
        //                 //                     title: function(context) {
        //                 //                         let dataIndex = context[0].dataIndex; // Assuming you are only hovering over a single point
        //                 //                         return newChartData[newChartLab][dataIndex]; // Use the 'UniProt_ResNum' property from your data
        //                 //                     },
        //                 //                 }
        //                 //             }
        //                 //         }
        //                 //     },
        //                 // };
                        
        //                 // if (newChart) {
        //                 //     newChart.destroy();
        //                 // }

        //                 // newChart = new Chart(newChartCtx, newChartConfig); // create the new chart

        //                 // const xAxisTitleDropdown = document.getElementById("xAxisTitle2");
        //                 // const yAxisTitleDropdown = document.getElementById("yAxisTitle2");
                    
        //                 // xAxisTitleDropdown.value = newChart.options.scales.x.title.text;
        //                 // yAxisTitleDropdown.value = newChart.options.scales.y.title.text;

        //                 // xAxisTitleDropdown.addEventListener("change", function () {
        //                 //     updateChart("x", xAxisTitleDropdown, newChart, newChartData, newChartLims); // event listener for change in x axis title
        //                 // });
                    
        //                 // yAxisTitleDropdown.addEventListener("change", function () {
        //                 //     updateChart("y", yAxisTitleDropdown, newChart, newChartData, newChartLims); // event listener for change in y axis title
        //                 // });
        //             }
        //         });
        //     } // else {
        //         // $('#bs_ress_table').hide(); // hide the table
        //     //}
        // },
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

            Jmol.script(jmolApplet, `select ${pointLabel} and not backbone; wireframe 0.2; color halos [255, 255, 153]; halos 25%;`);
            highlightTableRow(pointLabel); 
            isRowHovered = true;
        }
    } else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        lastHoveredPoint1 = null;

        clearHighlightedRow();
        isRowHovered = false;
        Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;');
    }
});

document.getElementById('chartCanvas').addEventListener('mouseout', function(e) { // when the cursor mopves out of the chart canvas
    if (lastHoveredPoint1 !== null) {
        lastHoveredPoint1 = null;

        clearHighlightedRow();
        isRowHovered = false;
        Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;');
    }
});


var newLastHoveredPoint = null;

document.getElementById('newChartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas
    var newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (newChartElement.length > 0) { // cursor is hovering over a data point
        let newFirstPoint = newChartElement[0];
        

        if (newLastHoveredPoint !== newFirstPoint.index) { // Check if the hovered point has changed
            newLastHoveredPoint = newFirstPoint.index;

            let newPointLabel = newChartData[newChartLab][newFirstPoint.index];

            Jmol.script(jmolApplet, `select ${newPointLabel} and not backbone; wireframe 0.2; color halos [255, 255, 153]; halos 25%;`);
            highlightTableRow(newPointLabel); 
            isRowHovered = true;
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        newLastHoveredPoint = null;

        clearHighlightedRow();
        isRowHovered = false;
        Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;');
    }
});

document.getElementById('newChartCanvas').addEventListener('mouseout', function(e) { // when the cursor mopves out of the chart canvas
    if (newLastHoveredPoint !== null) {
        newLastHoveredPoint = null;

        clearHighlightedRow();
        isRowHovered = false;
        Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;');
    }
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    console.log(rowId);
    console.log(index);
    if (index !== -1) {
        resetChartStyles(newChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site
        // implement halos on JSMOL //
        Jmol.script(jmolApplet, `select ${rowId} and not backbone; wireframe 0.2; color halos [255, 255, 153]; halos 25%;`);
        // implement halos on JSMOL //

    }
}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows
    newChart.data.datasets[0].data.forEach(function(point, i) {
        resetChartStyles(newChart, i, "black", 2, 8); // resets chart styles to default
        Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;'); // removes halos from JSMOL
    });
});

// document.querySelector('table#bs_ress_table tbody').addEventListener('mouseover', function (event) { 
//     let element = event.target;
//     while (element && element.tagName.toLowerCase() !== 'tr') {
//         element = element.parentNode;
//     }
//     if (element && element.tagName.toLowerCase() === 'tr') {
//         let rowId = Number(element.id); // gets the row id of the table row that is hovered over
//         let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
        
//         if (index !== -1) {
//             resetChartStyles(newChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site
//             // implement halos on JSMOL //
//             Jmol.script(jmolApplet, `select ${rowId} and not backbone; wireframe 0.2; color halos [255, 255, 153]; halos 25%;`);
//             // implement halos on JSMOL //
//         }
//     }
// });

// document.querySelector('table#bs_ress_table tbody').addEventListener('mouseout', function (event) { 
//     let element = event.target;
//     while (element && element.tagName.toLowerCase() !== 'tr') {
//         element = element.parentNode;
//     }
//     if (element && element.tagName.toLowerCase() === 'tr') {
//         newChart.data.datasets[0].data.forEach(function(point, i) {
//             resetChartStyles(newChart, i, "black", 2, 8); // resets chart styles to default
//             Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;'); // removes halos from JSMOL
//         });
//     }
// });
