import {DataCollection} from "./chart";
import {updateSelectors} from "./updateSelectors";

export function updateChart (chartObject) {

    updateSelectors();

    let dateField = Session.get('xAxis');
    let valueField = Session.get('yAxis');


    let data= DataCollection.find({},{sort: {date: -1}}).fetch();

    console.log(document.getElementById('yAxis').value);

    // Now, we need to calculate a mean and graph this as a straight line down the middle:
    // to do this, we can chart the value on both the max and min date
    let sortUp = {};
    sortUp[dateField] = -1;
    let dateSortUp = {sort: sortUp};

    let sortDown = {};
    sortDown[dateField] = 1;
    let dateSortDown = {sort: sortDown};

    let maxDate = DataCollection.findOne({},dateSortUp)[dateField];
    //  console.log("max: "+maxDate);
    let minDate = DataCollection.findOne({},dateSortDown)[dateField];
    // console.log("Min: "+minDate);
    // use math and a for loop to figure out the mean

    //console.log(minDate+" - "+maxDate);

    // add all up, then divide by total
    let add = 0;
    for (let x in data) {
        add += data[x][valueField]
    }
    // console.log(add);
    // total is just the size of the array
    let dataMean = add/(DataCollection.find().count());
    // this ends up with a long decimal place
    // let's get it to two
    dataMean = Math.round(dataMean * 100)/100;

    //   console.log("mean: "+dataMean);

    let meanDataObject = {
        label: "mean "+valueField,
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
        diffSum += (dataMean - data[x][valueField])*(dataMean -data[x][valueField])  // adding the squared differences
    }


    //     4. average the squared differences
    let diffAverage = diffSum/DataCollection.find().count();
    //     5. get the square root of the average squared difference
    let dataStDev = Math.sqrt(diffAverage);
    //dataStDev = Math.round(dataStDev * 100)/100;

    let dataUCL = Math.round((dataMean + (3 * dataStDev))*100)/100;
    let dataLCL = Math.round((dataMean - (3 * dataStDev))*100)/100;
    // console.log(Math.round(dataMean)+ " " + dataUCL)
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


    let chartData = [];
    let pointColors = [];

    for (let x in data) {
        // insert chart data
        chartData.push({
            t: data[x][dateField],
            y: data[x][valueField]
        });

        // set colors based on whatever logic
        let color = 'black'; // default color

        if (data[x][valueField] > dataUCL ) {
            color = 'red'
        }

        if (data[x][valueField] < dataLCL) {
            color = 'blue';
        }
        pointColors.push(color)

    }


    let variableData = {
        label: valueField,
        backgroundColor: 'transparent',
        borderColor: 'blue',
        borderWidth: 1,
        pointStyle: 'sphere',
        pointRadius: 4,
        pointBorderColor: 'transparent',
        // pointBackgroundColor: 'black',
        cubicInterpolationMode: 'monotone',
        data: chartData, // from above
        pointBackgroundColor: pointColors
    };


    // Almost there- we need to insert this object into our datasets array.
    // first, remove old datasets
    chartObject.config.data.datasets = [];


    chartObject.config.data.datasets.push(variableData);
    chartObject.config.data.datasets.push(meanDataObject);
    chartObject.config.data.datasets.push(UpperLimitDataObject);
    chartObject.config.data.datasets.push(LowerLimitDataObject);
    // console.log(MyChart);
    // update the scale label
    chartObject.options.scales.yAxes[0].scaleLabel.labelString = valueField;

    chartObject.update();
}