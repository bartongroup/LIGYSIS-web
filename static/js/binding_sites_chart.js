let myChart;
let newChart;

const chartCtx = document.getElementById("chartCanvas").getContext("2d");
const newChartCtx = document.getElementById('newChartCanvas').getContext('2d');

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

                        // Get your table and tbody element
                        let tableBody = $('#bs_ress_table tbody'); 
    
                        // Empty the current tbody
                        tableBody.empty();
    
                        // Iterate over the new data and fill the tbody
                        for (var i = 0; i < response[keyOrder[0]].length; i++) {
                            let newRow = $('<tr class="table__row">');

                            // Assign ID dynamically
                            newRow.attr('id', response["UniProt_ResNum"][i]);
            
                            // Second loop to iterate through keys (columns)
                            $.each(keyOrder, function(j, key) {
                                newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                            });

                            // Set the background color of the new row
                            newRow.css('color', pointColor);
            
                            tableBody.append(newRow);
                        }

                        $('table#bs_ress_table tbody').on('mouseover', 'tr', function () {
                            let pointLabel = this.id;
                    
                            // Find the corresponding index in the data
                            let index = newChartData[newChartLab].indexOf(pointLabel);
                    
                            if (index !== -1) {
                                // Programmatically trigger hover state on the chart point
                                newChart.getDatasetMeta(0).data[index].draw('hover');
                            }
                        });
                    
                        $('table#bs_ress_table tbody').on('mouseout', 'tr', function () {
                            // Clear hover states on all points
                            newChart.update();
                        });

                        // Data for the new chart
                        let newChartData = response;
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
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            align: "center",
                                            text: newChartY,
                                        },
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
                            newChart.options.scales.x.title.text = selectedXAxisTitle;
                            newChart.data.labels = newChartData[selectedXAxisTitle];
                            newChart.update();
                        });
                    
                        yAxisTitleDropdown.addEventListener("change", function () {
                            selectedYAxisTitle = yAxisTitleDropdown.value;
                            newChart.data.datasets[0].data = newChartData[selectedYAxisTitle];
                            newChart.options.scales.y.title.text = selectedYAxisTitle;
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
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: chartY,
                },
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
    
    let index = chartData['lab'].indexOf(rowId);

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
        myChart.options.scales.x.title.text = selectedXAxisTitle;
        myChart.data.labels = chartData[selectedXAxisTitle];
        myChart.update();
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        selectedYAxisTitle = yAxisTitleDropdown.value;
        myChart.data.datasets[0].data = chartData[selectedYAxisTitle];
        myChart.options.scales.y.title.text = selectedYAxisTitle;
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


