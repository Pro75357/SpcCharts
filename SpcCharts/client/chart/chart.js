import Chart from "chart.js";
import { ReactiveVar } from 'meteor/reactive-var';


Template.Chart.onRendered( function(){
    let canvas = document.getElementById('chartCanvas').getContext("2d");

    let datasets = [];
    let chartData = [] ;

    let values = [12,2,4,3,5];
    for (let x in values){
        let value = {
            t: moment(new Date()).subtract(values[x],'day')._d,
            y: values[x]
        };

        chartData.push(value);
        // console.log(value)
    }

    let datasetObject = {
        // label: 'Weights',
        backgroundColor: 'transparent',
        borderColor: 'blue',
        borderWidth: 1,
        // pointBackgroundColor: 'black',
        pointStyle: 'cross',
        data: chartData // from above
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

    export const MyChart = new Chart(canvas, config);

});

Template.Chart.events({
   'submit #dataForm': function(event){
       event.preventDefault();
        import { MyChart } from './chart.js'

       Papa.parse(event.target.file.files[0], {
           dynamicTyping: true,
           header: true,
           complete(results, file) {

               // update chart with new data
               //console.log(results);
               let chartData = [] ;
               for (let x in results.data){
                   if (results.data[x].values) {
                       let value = {
                           t: results.data[x].date,
                           y: results.data[x].values
                       };
                       chartData.push(value);
                   }
               }

               let variableData = {
                    label: 'data',
                   backgroundColor: 'transparent',
                   borderColor: 'blue',
                   borderWidth: 1,
                   // pointBackgroundColor: 'black',
                   pointStyle: 'cross',
                   data: chartData // from above
               };

               // Now, we need to calculate a mean and graph this as a straight line down the middle:
               let meanData = {
                   label: "median",
                   backgroundColor: 'transparent',
                   borderColor: 'grey',
                   borderWidth: 2,
                   // pointBackgroundColor: 'black',
                   pointStyle: 'line',
                   data: chartData // from above
               };


               // Almost there- we need to insert this object into our datasets array.
                // first, remove old datasets
                MyChart.config.data.datasets = [];

               MyChart.config.data.datasets.push(variableData);
               MyChart.config.data.datasets.push(meanData);
               console.log(MyChart);
               MyChart.update();
           }
       });


   }
});
