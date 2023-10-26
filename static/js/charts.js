const chartX = "DS";
const chartY = "MES";
const chartLab = "ID";
const newChartX = "abs_norm_shenkin";
const newChartY = "oddsratio";
const newChartLab = "UniProt_ResNum";

let myChart;
let newChart;

const chartCtx = document.getElementById("chartCanvas").getContext("2d"); 
const newChartCtx = document.getElementById("newChartCanvas").getContext("2d");

let clickedPoints = []; // array to store the clicked points

const myChartLims = { 
    DS: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    MES: {sugMin: 0, sugMax: 2, min: 0, max: 5},
    RSA: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    Size: {sugMin: 1, sugMax: 25, min: 1, max: 70}
};

const newChartLims = {
    abs_norm_shenkin: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    oddsratio: {sugMin: 0, sugMax: 2, min: 0, max: 5},
    RSA: {sugMin: 0, sugMax: 75, min: 0, max: 100},
    pvalue: {sugMin: 0.1, sugMax: 0.75, min: 0, max: 1}
};

const clickedPointStyler = {
    id: 'clickedPointStyler',
    beforeEvent: function(chart, event, options) {
        if (event.type !== 'mousemove') return; // only care about mousemove events

        const activeElements = chart.getElementsAtEventForMode(event.native, 'nearest', {intersect: true}, true);

        // Check if we are not hovering over any data point now
        if (activeElements.length === 0 && chart.lastActive && chart.lastActive.length > 0) {
            // Apply the clicked styling
            if (options.clickedPoints && options.clickedColor) {
                const dataset = chart.data.datasets[0];

                if (!Array.isArray(dataset.borderColor)) {
                    dataset.borderColor = [];
                }

                options.clickedPoints.forEach(idx => {
                    dataset.borderColor[idx] = options.clickedColor;
                });

                chart.update();
            }
        }

        // Store the current active elements
        chart.lastActive = activeElements;
    }
};



const chartAreaBorder = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
        const {ctx, chartArea: {left, top, width, height}} = chart;
        ctx.save();
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.setLineDash(options.borderDash || []);
        ctx.lineDashOffset = options.borderDashOffset;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
    }
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
                hoverBorderColor: "#ffff99",
                pointHoverBorderColor: "#ffff99",
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
                    font: {
                        size: 16,
                        // weight: 'bold',
                        // family: 'Arial'
                    },
                    color: 'black',
                },
                suggestedMin: myChartLims[chartX]["sugMin"],
                suggestedMax: myChartLims[chartX]["sugMax"],
                grid: {
                    display: true,
                    drawOnChartArea: false,
                    color: 'black',
                    tickLength: 6,
                    tickWidth: 1,
                },
                ticks: {
                    color: 'black', // Color of the tick labels
                    // font: {
                    //     size: 28  // Font size of the tick labels
                    // },
                    //padding: 10
                },
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: chartY,
                    font: {
                        size: 16,
                        // weight: 'bold',
                        // family: 'Arial'
                    },
                    color: 'black',
                },
                suggestedMin: myChartLims[chartY]["sugMin"],
                suggestedMax: myChartLims[chartY]["sugMax"],
                grid: {
                    display: true,
                    drawOnChartArea: false,
                    color: 'black',
                    tickLength: 6,
                    tickWidth: 1,
                },
                ticks: {
                    color: 'black', // Color of the tick labels
                    // font: {
                    //     size: 28  // Font size of the tick labels
                    // },
                    //padding: 10
                },
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
            },
            chartAreaBorder: {
                borderColor: 'black',
                borderWidth: 1,
                borderDash: [0, 0],
                borderDashOffset: 5,
            },
            clickedPointStyler: {
                clickedPoints: clickedPoints,
                clickedColor: "#50C878",
            },
        },
    },
    plugins: [chartAreaBorder, clickedPointStyler],
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
                hoverBorderColor: "#ffff99",
                pointHoverBorderColor: "#ffff99",
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
                    font: {
                        size: 16,
                        // weight: 'bold',
                        // family: 'Arial'
                    },
                    color: 'black',
                },
                suggestedMin: newChartLims[newChartX]["sugMin"],
                suggestedMax: newChartLims[newChartX]["sugMax"],
                grid: {
                    display: true,
                    drawOnChartArea: false,
                    color: 'black',
                    tickLength: 6,
                    tickWidth: 1,
                },
                ticks: {
                    color: 'black', // Color of the tick labels
                    // font: {
                    //     size: 28  // Font size of the tick labels
                    // },
                    //padding: 10
                },
            },
            y: {
                title: {
                    display: true,
                    align: "center",
                    text: newChartY,
                    font: {
                        size: 16,
                        // weight: 'bold',
                        // family: 'Arial'
                    },
                    color: 'black',
                },
                suggestedMin: newChartLims[newChartY]["sugMin"],
                suggestedMax: newChartLims[newChartY]["sugMax"],
                grid: {
                    display: true,
                    drawOnChartArea: false,
                    color: 'black',
                    tickLength: 6,
                    tickWidth: 1,
                },
                ticks: {
                    color: 'black', // Color of the tick labels
                    // font: {
                    //     size: 28  // Font size of the tick labels
                    // },
                    //padding: 10
                },
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
            },
            chartAreaBorder: {
                borderColor: 'black',
                borderWidth: 1,
                borderDash: [0, 0],
                borderDashOffset: 5,
            },
        }
    },
    plugins: [chartAreaBorder],
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
