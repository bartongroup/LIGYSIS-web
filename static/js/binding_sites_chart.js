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
                var index = array[0].index;

                $('#bs_ress_table').show();
    
                // Use AJAX to get the new table data from the server
                $.ajax({
                    type: 'POST',
                    url: '/get_table',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({'index': index}),
                    success: function(response) {
                        var keyOrder = cc;

                        console.log("Server response: ", response);  // Debug line
                        // Get your table and tbody element
                        var tableBody = $('#bs_ress_table tbody');
    
                        // Empty the current tbody
                        tableBody.empty();
    
                        // Iterate over the new data and fill the tbody
                        for (var i = 0; i < response[keyOrder[0]].length; i++) {
                            var newRow = $('<tr class="table__row">');
            
                            // Second loop to iterate through keys (columns)
                            $.each(keyOrder, function(j, key) {
                                newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                            });
            
                            tableBody.append(newRow);
                        }
                    }
                });
            } else {
                // Hide the table if no data point is clicked
                $('#bs_ress_table').hide(); // or use .css("display", "none") to hide it
            }
        },
        responsive: false,
        scales: {
            x: {
                title: {
                    display: true,
                    align: "center",
                    text: "Nshenkin",
                },
                <!-- suggestedMin: 0, -->
                <!-- suggestedMax: 100, -->
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: "MES",
                },
                <!-- type:"logarithmic", -->
                <!-- suggestedMin: 0.2, -->
                <!-- suggestedMax: 5, -->
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function(context) {
                        const dataIndex = context[0].dataIndex; // Assuming you are only hovering over a single point
                        return chartData.lab[dataIndex]; // Use the 'lab' property from your data
                    },
                }
            }
        }
    }
};

const myChart = new Chart(chartCtx, chartConfig);

document.addEventListener("DOMContentLoaded", function () {
    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");
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

myChart.canvas.addEventListener("mousemove", function (event) {
    var activePoints = myChart.getElementsAtEventForMode(event, 'point', myChart.options);
    if (activePoints.length > 0) {
        var firstPoint = activePoints[0];
        var label = chartData.lab[firstPoint.index];
        var tooltipTitle = label
        highlightTableRow(tooltipTitle);
    } else {
        clearHighlightedRow();
    }
});

function highlightTableRow(tooltipTitle) {
    var rowId = tooltipTitle; // Assuming row ID matches the tooltip title
    var row = document.getElementById(rowId);
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

