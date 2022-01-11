let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let WaiterSchema = new Schema({
    name: {type: String, required: true},
    date_employment: {type: Date, default: Date.now()}
});

WaiterSchema.virtual('url').get(function () {
    return '/catalog/waiter/' + this._id;
});

WaiterSchema.virtual('employment').get(function () {
    let diff = monthDiff(new Date(Date.now()), this.date_employment)
    let year = div(diff, 12)
    let month = diff - year * 12
    let lastN = div(year, 10)
    return month + ' месяцев ' + year + (lastN === 1 || lastN === 2 || lastN === 3 ? ' года' : ' лет');
});

module.exports = mongoose.model('Waiter', WaiterSchema)

function div(val, by){
    return (val - val % by) / by;
}

function monthDiff(d1, d2) {
    let months;
    months = Math.abs(d2.getUTCFullYear() - d1.getUTCFullYear()) * 12;
    months -= d1.getUTCMonth();
    months += d2.getUTCMonth();
    return months <= 0 ? 0 : months;
}