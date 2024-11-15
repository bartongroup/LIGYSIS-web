let isInitialRender2 = true;
let isInitialRender3 = true;

let chartX = "DS";
let chartY = "MES";

const chartLab = "ID";

let newChartX = "DS";
let newChartY = "MES";

if (chartData[chartY].includes("NaN")) {
    chartY = "RSA";
}

if (newChartData[newChartY].includes("NaN")) {
    newChartY = "RSA";
}

const newChartLab = "UPResNum";

let myChart;
let newChart;

const chartCtx = document.getElementById("chartCanvas").getContext("2d"); 
const newChartCtx = document.getElementById("newChartCanvas").getContext("2d");

const myChartLims = { 
    RSA: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    DS: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    MES: {sugMin: 0.05, sugMax: 2, min: 0, max: 5},
    Size: {sugMin: 1, sugMax: 25, min: 1, max: 70},
    Cluster: {sugMin: 0, sugMax: 5, min: 0, max: 5},
    FS: {sugMin: 0, sugMax: 0.6, min: 0, max: 0.6},
};

const newChartLims = {
    DS: {sugMin: 0, sugMax: 50, min: 0, max: 100},
    MES: {sugMin: 0.05, sugMax: 2, min: 0, max: 5},
    RSA: {sugMin: 0, sugMax: 75, min: 0, max: 100},
    p: {sugMin: 0.1, sugMax: 0.75, min: 0, max: 1}
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
                radius: function(context) { // radius will depend on whether the point is clicked or not
                    if (context.dataIndex === clickedPointLabel) {
                        return 16; // Custom radius for clicked point
                    }
                    return 12; // Default
                },
                // radius: 12,
                hoverRadius: 16,
                data: chartData[chartY],
                backgroundColor: chartColors,
                pointHoverBackgroundColor: chartColors,
                // borderColor: "black",
                borderColor: function(context) { // border color will depend on whether the point is clicked or not
                    if (context.dataIndex === clickedPointLabel) {
                        return "#bfd4cb"; // border color for clicked point
                    }
                    return "black"; // Default 
                },
                // borderWidth: 2,
                borderWidth: function(context) {
                    // console.log(context.dataIndex, clickedPointLabel);
                    if (context.dataIndex === clickedPointLabel) {
                        return 10; // border width for clicked point
                    }
                    return 1; // Default
                },
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
                type: 'logarithmic',
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
                    autoSkip: true,
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
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 1,
                        yMax: 1,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderDash: [10, 5],
                        display: true,
                    }
                }
            },
            chartAreaBorder: {
                borderColor: 'black',
                borderWidth: 1,
                borderDash: [0, 0],
                borderDashOffset: 5,
            },
            // clickedPointStyler: {
            //     clickedPoints: clickedPoints,
            //     clickedColor: "#50C878",
            // },
        },
    },
    plugins: [chartAreaBorder, {
        id: 'afterRenderPlugin',
        afterRender: function(chart, args, options) {
            // Call toggleSpinner2 only on the initial render
            if (isInitialRender2) {
                toggleSpinner2();
                isInitialRender2 = false; // Set flag to false after first render
            }
        }
    }],
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
                type: 'logarithmic',
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
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 1,
                        yMax: 1,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderDash: [10, 5],
                        display: true,
                    }
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
    plugins: [chartAreaBorder, {
        id: 'afterRenderPlugin',
        afterRender: function(chart, args, options) {
            // Call toggleSpinner2 only on the initial render
            if (isInitialRender3) {
                toggleSpinner3();
                isInitialRender3 = false; // Set flag to false after first render
            }
        }
    }],
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

// toggleSpinner2(); // hide the spinner