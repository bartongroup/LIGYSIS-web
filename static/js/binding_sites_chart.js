let myChart;
let newChart;

const chartCtx = document.getElementById("chartCanvas").getContext("2d");
const newChartCtx = document.getElementById('newChartCanvas').getContext('2d');

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
                data: chartData[chartY],
                backgroundColor: chartColors,
                borderColor: "black",
                borderWidth: 2,
                lineTension: 0.1
            }
        ]
    },
    options: {
        onClick: function(event, array) {
            if (array.length > 0) {

                // Get the index of the clicked data point
                let index = array[0].index;
                let pointLabel = chartData[chartLab][index];
                let pointColor = chartColors[index];

                $('#bs_ress_table').show();
    
                // Use AJAX to get the new table data from the server
                $.ajax({
                    type: 'POST',
                    url: '/get_table',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({'label': pointLabel}),
                    success: function(response) {
                        const keyOrder = cc;

                        // let newChartData = response;

                        // Get your table and tbody element
                        let tableBody = $('#bs_ress_table tbody'); 
    
                        // Empty the current tbody
                        tableBody.empty();
    
                        // Iterate over the new data and fill the tbody
                        for (var i = 0; i < response[keyOrder[0]].length; i++) {
                            let newRow = $('<tr class="table__row">');

                            // Assign ID dynamically
                            newRow.attr('id', response[newChartLab][i]);
            
                            // Second loop to iterate through keys (columns)
                            $.each(keyOrder, function(j, key) {
                                newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                            });

                            // Set the background color of the new row
                            newRow.css('color', pointColor);
            
                            tableBody.append(newRow);
                        }

                        $('table#bs_ress_table tbody').on('mouseover', 'tr', function () {

                            let rowId = Number(this.id);  // Assuming the row's ID attribute contains the corresponding data point ID
                            // Find index of the data point in your chart data
                        
                            let index = response[newChartLab].indexOf(rowId);
                        
                            if (index !== -1) {
                                newChart.getDatasetMeta(0).data[index].options.borderColor = "gold"; // change other styles if you wish
                                newChart.getDatasetMeta(0).data[index].options.radius = 16;
                                newChart.getDatasetMeta(0).data[index].options.borderWidth = 10; // change other styles if you wish
                                newChart.render();
                            }
                        }).on('mouseout', 'tr', function () {
                            // Reset the style changes to clear all hover effects
                            newChart.data.datasets[0].data.forEach(function(point, i) {
                                newChart.getDatasetMeta(0).data[i].options.borderColor = "black"; // reset to original size or other default values
                                newChart.getDatasetMeta(0).data[i].options.borderWidth = 1;
                                newChart.getDatasetMeta(0).data[i].options.radius = 8;
                            });
                            newChart.render();
                        });

                        // Data for the new chart
                        var newChartData = response;
                        let newChartConfig = {
                            type: "scatter",
                            data: {
                                labels: newChartData[newChartX],
                                datasets: [
                                    {
                                        label: "Binding residues",
                                        radius: 8,
                                        data: newChartData[newChartY],
                                        backgroundColor: pointColor,
                                        borderColor: "black",
                                        borderWidth: 2,
                                        lineTension: 0.1
                                    }
                                ]
                            },
                            options: {
                                onHover: function(event, chartElement) {
                                    if (chartElement.length > 0) {
                                        let firstPoint = chartElement[0];
                                        let pointLabel = newChartData[newChartLab][firstPoint.index];
                                        highlightTableRow(pointLabel);
                                    } else {
                                        clearHighlightedRow();
                                    }
                                },
                                responsive: false,
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
                        
                        if (newChart) {
                            newChart.destroy();
                        }

                        newChart = new Chart(newChartCtx, newChartConfig);

                        const xAxisTitleDropdown = document.getElementById("xAxisTitle2");
                        const yAxisTitleDropdown = document.getElementById("yAxisTitle2");
                    
                        xAxisTitleDropdown.value = newChart.options.scales.x.title.text;
                        yAxisTitleDropdown.value = newChart.options.scales.y.title.text;
                    
                        let selectedXAxisTitle = xAxisTitleDropdown.value;
                        let selectedYAxisTitle = yAxisTitleDropdown.value;
                    
                        xAxisTitleDropdown.addEventListener("change", function () {
                            selectedXAxisTitle = xAxisTitleDropdown.value;
                            newChart.data.labels = newChartData[selectedXAxisTitle];
                            newChart.options.scales.x.title.text = selectedXAxisTitle;
                            newChart.options.scales.x.suggestedMin = newChartLims[selectedXAxisTitle]["sugMin"];
                            newChart.options.scales.x.suggestedMax = newChartLims[selectedXAxisTitle]["sugMax"];
                            newChart.update();
                        });
                    
                        yAxisTitleDropdown.addEventListener("change", function () {
                            selectedYAxisTitle = yAxisTitleDropdown.value;
                            newChart.data.datasets[0].data = newChartData[selectedYAxisTitle];
                            newChart.options.scales.y.title.text = selectedYAxisTitle;
                            newChart.options.scales.y.suggestedMin = newChartLims[selectedYAxisTitle]["sugMin"];
                            newChart.options.scales.y.suggestedMax = newChartLims[selectedYAxisTitle]["sugMax"]; 
                            newChart.update();
                        });


                    }
                });
            } else {
                // Hide the table if no data point is clicked
                $('#bs_ress_table').hide(); // or use .css("display", "none") to hide it
            }
        },
        onHover: function(event, chartElement) {
            if (chartElement.length > 0) {
                let firstPoint = chartElement[0];
                let pointLabel = chartData[chartLab][firstPoint.index];
                highlightTableRow(pointLabel);
            } else {
                clearHighlightedRow();
            }
        },
        responsive: false,
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
            tooltip: {
                callbacks: {
                    title: function(context) {
                        let dataIndex = context[0].dataIndex; // Assuming you are only hovering over a single point
                        return chartData[chartLab][dataIndex]; // Use the 'lab' property from your data
                    },
                }
            }
        }
    }
};

myChart = new Chart(chartCtx, chartConfig);


$('table#bss_table tbody').on('mouseover', 'tr', function () {

    let rowId = this.id;  // Assuming the row's ID attribute contains the corresponding data point ID
    // Find index of the data point in your chart data

    let index = chartData[chartLab].indexOf(rowId);

    if (index !== -1) {
        myChart.getDatasetMeta(0).data[index].options.borderColor = "gold"; // change other styles if you wish
        myChart.getDatasetMeta(0).data[index].options.radius = 16;
        myChart.getDatasetMeta(0).data[index].options.borderWidth = 10; // change other styles if you wish
        myChart.render();
    }
}).on('mouseout', 'tr', function () {
    // Reset the style changes to clear all hover effects
    myChart.data.datasets[0].data.forEach(function(point, i) {
        myChart.getDatasetMeta(0).data[i].options.borderColor = "black"; // reset to original size or other default values
        myChart.getDatasetMeta(0).data[i].options.borderWidth = 1;
        myChart.getDatasetMeta(0).data[i].options.radius = 12;
    });
    myChart.render();
});






// THIS IS THE EVENT LISTENER THAT CHANGES THE AXES OF THE BINDING SITES PLOTS ACCORDING TO DROPDOWNS

document.addEventListener("DOMContentLoaded", function () {
    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");

    xAxisTitleDropdown.value = myChart.options.scales.x.title.text;
    yAxisTitleDropdown.value = myChart.options.scales.y.title.text;

    let selectedXAxisTitle = xAxisTitleDropdown.value;
    let selectedYAxisTitle = yAxisTitleDropdown.value;

    xAxisTitleDropdown.addEventListener("change", function () {
        selectedXAxisTitle = xAxisTitleDropdown.value;
        myChart.data.labels = chartData[selectedXAxisTitle];
        myChart.options.scales.x.title.text = selectedXAxisTitle;
        myChart.options.scales.x.suggestedMin = myChartLims[selectedXAxisTitle]["sugMin"];
        myChart.options.scales.x.suggestedMax = myChartLims[selectedXAxisTitle]["sugMax"]; 
        myChart.update();
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        selectedYAxisTitle = yAxisTitleDropdown.value;
        myChart.data.datasets[0].data = chartData[selectedYAxisTitle];
        myChart.options.scales.y.title.text = selectedYAxisTitle;
        myChart.options.scales.y.suggestedMin = myChartLims[selectedYAxisTitle]["sugMin"];
        myChart.options.scales.y.suggestedMax = myChartLims[selectedYAxisTitle]["sugMax"];
        myChart.update();
    });
    
});

function highlightTableRow(pointLabel) {
    var row = document.getElementById(pointLabel);
    if (row) {
        row.classList.add("highlighted-row");
    }
}

function clearHighlightedRow() {
    var highlightedRow = document.querySelector(".highlighted-row");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlighted-row");
    }
}


