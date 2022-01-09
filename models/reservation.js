let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let ReservationSchema = new Schema({
    id_visitor: {type: Schema.Types.ObjectId, ref: 'Visitor', required: true},
    id_table:{type: Schema.Types.ObjectId, ref: 'Table', required: true},
    count_peoples: {type: Number, min: 0, max: 120, default: 2},
    start_time: {type: Date, default: Date.now(), required: true},
    end_time: {type: Date, default: new Date(Date.now() + 2 * 60 * 60 * 1000)}
});

ReservationSchema.virtual('url').get( function () {
    return '/catalog/reservation/' + this._id;
});

ReservationSchema.virtual('start_time_formatted').get( function () {
    return moment(this.start_time).format('hh:mm DD.MM.YY');
});

ReservationSchema.virtual('end_time_formatted').get( function () {
    return moment(this.end_time).format('hh:mm DD.MM.YY');
});

module.exports = mongoose.model('Reservation', ReservationSchema)