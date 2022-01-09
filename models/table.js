let bookshelf = require('mongoose');
let async = require("async");

const Waiter = require("./waiter");
let Reservation = require('./reservation');

let Schema = bookshelf.Schema;

let TableSchema = new Schema({
    position: {type: Number, min: 1, max: 30, required: true},
    count_peoples: {type: Number, min: 2, max: 6, required: true},
    id_waiter: {type: Schema.Types.ObjectId, ref:'Waiter'},
    status: {type: String, required: true, enum:['Available', 'Maintenance', 'Reserved'], default:'Available'}
});

TableSchema.virtual('url').get( function () {
    return '/catalog/table/' + this._id;
});

TableSchema.virtual('end_time_reserv').get( function () {
    let id = '' + this._id;
    async.parallel({
        reservation: function(callback) {
            Reservation.find({ 'id_table': id })
                .sort('end_time')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        if (results.reservation.length  > 0)
            return results.reservation[results.reservation.length - 1];
        else return;
    });
});

module.exports = bookshelf.model('Table', TableSchema)