import {DataCollection} from "./chart";
import {updateChart} from "./updateChart";
import {Session} from "meteor/session";

export function generateRandomData () {
    // generates somewhat random data for pretty chart display
    Session.set("Fields", ["date","values"]);
    Session.set('xAxis',"date");
    Session.set('yAxis','values');


    let total = 60;
    //  let number = total * Math.random()*50;
    for (total; total > 0; total--) {
        // generate a gaussian data distribution
        let x1, x2, rad;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        } while(rad >= 1 || rad === 0);
        let c = Math.sqrt(-2 * Math.log(rad) / rad);
        let gRand = x1 * c;

        let normalizer = 50 + Math.random() * 25;
        let value = {
            date: moment().subtract(total,'week')._d,
            values: Math.round((gRand * normalizer) + normalizer)
        };
        // we will both store results in our initial chartData
        // as well as our Mongo collection
        DataCollection.insert(value)
    }

    updateChart(MyChart)
}