let bookshelf = require('mongoose');
let Schema = bookshelf.Schema;

let async = require("async");

let Reservation = require('./reservation');

let TableSchema = new Schema({
    position: {type: Number, min: 1, max: 30, required: true},
    count_peoples: {type: Number, min: 2, max: 10, required: true},
    id_waiter: {type: Schema.Types.ObjectId, ref:'Waiter', required: true},
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
        if (results.reservation.length  > 0)
            return results.reservation[results.reservation.length - 1];
        else
            return null;
    });
});

module.exports = bookshelf.model('Table', TableSchema)