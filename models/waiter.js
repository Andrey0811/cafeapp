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
    return moment(Date.now() - this.date_employment).format('DD.MM.YYYY');
});

module.exports = mongoose.model('Waiter', WaiterSchema)