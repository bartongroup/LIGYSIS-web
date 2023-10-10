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
        animation: {
            duration: 1000, // duration of the hover animation
            // additional animation configurations...
        },
        onClick: function(event, array) { // event listener for click on chart points
            if (array.length > 0) {

                let index = array[0].index; // index of the clicked data point
                let pointLabel = chartData[chartLab][index]; // label of the clicked data point
                let pointColor = chartColors[index]; // color of the clicked data point

                $('#bs_ress_table').show(); // show the table
    
                $.ajax({ // AJAX request to get the table data from the server
                    type: 'POST', // POST request
                    url: '/get_table', // URL to send the request to
                    contentType: 'application/json;charset=UTF-8', // content type
                    data: JSON.stringify({'label': pointLabel}), // data to send
                    success: function(response) { // function to execute when the request is successful
                        const keyOrder = cc; // order of the keys in the response object
                        let tableBody = $('#bs_ress_table tbody'); // tbody of the table
                        tableBody.empty(); // empty the tbody
                        for (var i = 0; i < response[keyOrder[0]].length; i++) { // First loop to iterate through rows
                            let newRow = $('<tr class="table__row">'); // Create a new row
                            newRow.attr('id', response[newChartLab][i]); // Assign ID dynamically to each row
                            $.each(keyOrder, function(j, key) { // Second loop to iterate through keys (columns)
                                newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                            });
                            newRow[0].style.setProperty('--bs-table-color', pointColor);
                            newRow[0].style.setProperty('--bs-table-hover-color', pointColor);
                            // newRow.css('color', pointColor); // Set the font color of the new row
                            tableBody.append(newRow); // Append the new row to the table body
                        }

                        $('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
                            let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
                            let index = response[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
                            if (index !== -1) {
                                resetChartStyles(newChart, index, "gold", 10, 16); // changes chart styles to highlight the binding site
                            }
                        }).on('mouseout', 'tr', function () { // event listener for mouseout on table rows
                            newChart.data.datasets[0].data.forEach(function(point, i) {
                                resetChartStyles(newChart, i, "black", 1, 8); // resets chart styles to default
                            });
                        });

                        // Data for the new chart
                        var newChartData = response; // data for the new chart
                        let newChartConfig = { // configuration for the new chart
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
                                onHover: function(event, chartElement) { // event listener for hover on chart points
                                    if (chartElement.length > 0) {
                                        let firstPoint = chartElement[0];
                                        let pointLabel = newChartData[newChartLab][firstPoint.index];
                                        highlightTableRow(pointLabel); // highlights the table row corresponding to the hovered chart point
                                    } else {
                                        clearHighlightedRow(); // clears the highlighted table row
                                    }
                                },
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
                        
                        if (newChart) {
                            newChart.destroy();
                        }

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
                    }
                });
            } else {
                $('#bs_ress_table').hide(); // hide the table
            }
        },
        onHover: function(event, chartElement) { // event listener for hover on chart points
            if (chartElement.length > 0) {
                console.log("hoverBorderColor:", chartConfig.data.datasets[0].hoverBorderColor);
                let firstPoint = chartElement[0];
                let pointLabel = chartData[chartLab][firstPoint.index];
                // implement halos on JSMOL //
                Jmol.script(jmolApplet, `select ${pointLabel} and not backbone; wireframe 0.2; color halos [255, 255, 153]; halos 25%;`);
                 // implement halos on JSMOL //

                highlightTableRow(pointLabel); // highlights the table row corresponding to the hovered chart point
                isRowHovered = true; // set isRowHovered to true when a table row is hovered
            }
            else {
                clearHighlightedRow();
                isRowHovered = false;
                Jmol.script(jmolApplet, 'halos OFF; wireframe OFF;'); // removes halos from JSMOL
            }
        },
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

myChart = new Chart(chartCtx, chartConfig);