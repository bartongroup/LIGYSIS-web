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


