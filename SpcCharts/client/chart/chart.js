import Chart from "chart.js";
import { Mongo } from 'meteor/mongo';
import {updateChart} from './updateChart';
import {initChart} from './initChart';
import {generateRandomData} from './generateRandomData'
import {updateSelectors} from "./updateSelectors";
import {Session} from 'meteor/session'
// we're going to do a lot with this data so let's put it in a miniMongo variable for easy fetching
export const DataCollection = new Mongo.Collection(null);

Template.Chart.onRendered( function(){
    // Just build a simple chart on rendering for display, also builds our chart object
    let canvas = document.getElementById('chartCanvas').getContext("2d");
    MyChart = new Chart(canvas,initChart());
    Session.setDefault("Fields", ["date","values"]);
    Session.setDefault("xAxis","date");
    Session.setDefault("yAxis","values");
    updateSelectors();

});

Template.Chart.events({
    'click #generateButton': function(ev){
        DataCollection.remove({});
        generateRandomData();
    },

   'change #file': function(event){
       DataCollection.remove({});
       parseFile(event.target.files[0]);
   },

    'change #yAxis': function(event){
        Session.set('yAxis', event.target.value);
        updateChart(MyChart)
    },
    'change #xAxis': function(event){
        Session.set('xAxis', event.target.value);
        updateChart(MyChart)
    }
});

Template.Chart.helpers({
    chartData(){
        return JSON.stringify(DataCollection.find({}).fetch(), null, 2);
    },
    dateExample(){
        return moment().format('YYYY-MM-DD HH:MM')
    },
    resultCount(){
        if (DataCollection.find().count() > 0){
            return DataCollection.find().count()
        }
    },
    columns(){
        return Session.get("Fields")
    }
});

// page-wide functions go here (lots of things!)

function parseFile(file){
    // parses the passed file and inserts data into local mongo collection
    Papa.parse(file, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
        complete(results) {
            for (let x in results.data) {
                DataCollection.insert(results.data[x])

                /*
                if (results.data[x].values) {
                    let value = {
                        date: results.data[x].date,
                        values: parseFloat(results.data[x].values)
                    };
                    // store this in our Mongo collection
                   // console.log(value)
                    DataCollection.insert(value)
                }
                */
            }
            Session.set("Fields",results.meta.fields);

            // just try the 1st and 2nd columns at first

            Session.set('xAxis',results.meta.fields[0]);
            Session.set('yAxis',results.meta.fields[1]);

            // when this is done, go ahead and update the chart
            updateChart(MyChart);
        }
    })
}


