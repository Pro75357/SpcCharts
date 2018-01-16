import Chart from "chart.js";
import { Mongo } from 'meteor/mongo';
// we're going to do a lot with this data so let's put it in a miniMongo variable for easy fetching
export const DataCollection = new Mongo.Collection(null);

Template.Chart.onRendered( function(){


    // Just build a simple chart on rendering for display, also builds our chart object
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
   'change #file': function(event){
       event.preventDefault();
        import { MyChart } from './chart.js'
       DataCollection.remove({})
       Papa.parse(event.target.files[0], {
           dynamicTyping: true,
           header: true,
           complete(results) {

               // update chart with new data
               //console.log(results);
               let chartData = [] ;
               for (let x in results.data){
                   if (results.data[x].values) {
                       let value = {
                           t: results.data[x].date,
                           y: results.data[x].values
                       };
                       // we will both store results in our initial chartData
                       chartData.push(value);
                       // as well as our Mongo collection
                       DataCollection.insert(value)

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
               // to do this, we can chart the value on both the max and min date
               let maxDate = DataCollection.findOne({},{sort: {t: -1}}).t;
               console.log("max: "+maxDate);
               let minDate = DataCollection.findOne({},{sort: {t: 1}}).t;
               console.log("Min: "+minDate);
               // use math and a for loop to figure out the mean

               let data =DataCollection.find().fetch();
               // add all up, then divide by total
               let add = 0;
               for (let x in data) {
                   add += data[x].y
               }
               // total is just the size of the array
               let dataMean = add/(DataCollection.find().count());
               console.log("mean: "+dataMean);

               let meanDataObject = {
                   label: "median",
                   backgroundColor: 'transparent',
                   borderColor: 'grey',
                   borderWidth: 2,
                   // pointBackgroundColor: 'black',
                   pointStyle: 'line',
                   data: [{
                       t: minDate,
                       y: dataMean
                   }, {
                       t: maxDate,
                       y: dataMean
                   }]
               };

                // Todo: calculate UCL and LCL, and chart those too!

               // UCL is mean + 3* stDev. We already have the mean. Let's calculate stDev!
               /*
                Steps:
                    1. get the average value of the data set
                        = dataMean from above
                    2. calculate the difference between each value in the set and the average
                    3. then square the result of each difference
                           ...again we can do this in a for loop:       */
                    let diffSum = 0;
                   for (let x in data){
                        diffSum += (dataMean - data[x].y)*(dataMean -data[x].y)  // adding the squared differences
                   }


               //     4. average the squared differences
                    let diffAverage = diffSum/DataCollection.find().count();
               //     5. get the square root of the average squared difference
                    let dataStDev = Math.sqrt(diffAverage);

                    let dataUCL = dataMean + (3 * dataStDev);
                    let dataLCL = dataMean - (3 * dataStDev);

                    // now let's build the UCL and LCL data points:


               let LowerLimitDataObject = {
                   label: "LCL",
                   backgroundColor: 'transparent',
                   borderColor: 'red',
                   borderWidth: 2,
                   // pointBackgroundColor: 'black',
                   pointStyle: 'line',
                   data: [{
                       t: minDate,
                       y: dataLCL
                   }, {
                       t: maxDate,
                       y: dataLCL
                   }] // from above
           };

               let UpperLimitDataObject = {
                   label: "UCL",
                   backgroundColor: 'transparent',
                   borderColor: 'red',
                   borderWidth: 2,
                   // pointBackgroundColor: 'black',
                   pointStyle: 'line',
                   data: [{
                       t: minDate,
                       y: dataUCL
                   }, {
                       t: maxDate,
                       y: dataUCL
                   }] // from above
               };

               // Almost there- we need to insert this object into our datasets array.
                // first, remove old datasets
                MyChart.config.data.datasets = [];

               MyChart.config.data.datasets.push(variableData);
               MyChart.config.data.datasets.push(meanDataObject);
               MyChart.config.data.datasets.push(UpperLimitDataObject);
               MyChart.config.data.datasets.push(LowerLimitDataObject);
               console.log(MyChart);
               MyChart.update();
           }
       });


   }
});

Template.Chart.helpers({
    chartData(){
        return JSON.stringify(DataCollection.find().fetch(), null, 2);
    }
})