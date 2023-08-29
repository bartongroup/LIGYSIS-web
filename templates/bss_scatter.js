
const colX = "an_shenk";
const colY = "MES";
const colLab = "lab";
const chartData = {{ data | tojson }};
const ctx = document.getElementById("chartCanvas").getContext("2d");

const config = {
    type: "scatter",
    data: {
        labels: chartData[colX],
        datasets: [
            {
                label: "Binding sites",
                radius: 12,
                data: chartData[colY],
                backgroundColor: {{ colors | safe }},
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

const chart = new Chart(ctx, config);

document.addEventListener("DOMContentLoaded", function () {
    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");
    let selectedXAxisTitle = xAxisTitleDropdown.value;
    let selectedYAxisTitle = yAxisTitleDropdown.value;

    xAxisTitleDropdown.addEventListener("change", function () {
        electedXAxisTitle = xAxisTitleDropdown.value
        chart.options.scales.x.title.text = selectedXAxisTitle
        chart.data.labels = chartData[selectedXAxisTitle]
        chart.update()
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        selectedYAxisTitle = yAxisTitleDropdown.value
        chart.data.datasets[0].data = chartData[selectedYAxisTitle]
        chart.options.scales.y.title.text = selectedYAxisTitle
        chart.update()
    });
});

