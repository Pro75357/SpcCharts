
export function initChart(){

    let datasets = [];
    let chartData = [] ;
    let pointColors = [];

    let i=1;
    let values = [];
    for (i; i<20; i++){
        values.push(Math.sin(i))
    }

    // paint the data points per some math
    let dateAdd=1;
    for (let x in values){
        let value = {
            t: moment(new Date()).subtract(dateAdd,'day')._d,
            y: values[x],
        };
        dateAdd+=1;

        chartData.push(value);

        //Set default chart color:
        let color = 'blue';

        // pick color based on value
        if (value.y > 0) {
            color = 'red';
        }

        // put into dataset
        pointColors.push(color)

        //chartData.push({backgroundColor: 'yellow'})
        // console.log(value)
    }

    let datasetObject = {
        // label: 'Weights',
        backgroundColor: 'transparent',
        borderColor: 'black',
        borderWidth: 1,
        pointBorderColor: 'transparent',
        pointStyle: 'sphere',
        pointRadius: 5,
        data: chartData, // from above
        pointBackgroundColor: pointColors
    };

    // Almost there- we need to insert this object into our datasets array.
    datasets.push(datasetObject);

    // Now that we have labels, and datasets we can build the top-level data object
    let data = {
        // labels,
        datasets
    };

    // set this X-axis scale to be based on time
    let options = {
        responsive: false,
        legend: {
            display: false // takes up too much space, and there is plenty of context to understand the chart
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: { // these formats are just like moment.js
                        // I don't try to specify the date range- chart.js just gets that from the data.
                        // it then intelligently scopes the axis to fit
                        'quarter': 'MMM YY', // this is what is displayed if the chart is scoped into quarters
                        'year': "'YY", // and if the chart is scoped into years
                    },
                    tooltipFormat: 'M-DD-YY' // format of the tooltip
                },
                scaleLabel: {
                    display: false // again takes too much space
                }

            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'unit'
                    // options.scales.yAxes[0].scaleLabel.labelString
                },
            }]
        },
        tooltips: { // some special code for the tooltips to be a little more concise
            enabled: true,
            displayColors: false, // big colored box- useful if you have multiple datasets, but not here.
            mode: 'single',
            //       callbacks: { // this is a special function that lets us define exactly what the label says. Had to do this to add the unit!
            //            label: function(tooltipItems, data){
            //                return tooltipItems.yLabel+' '+myUnit
        }
    };

    // finally, we build the top-level config object, which is where we actually specify the chart type
    let config = {
        type: 'line',
        data: data,
        options: options
    };

    // and now we can actually build the chart!

    return config
}