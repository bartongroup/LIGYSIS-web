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

