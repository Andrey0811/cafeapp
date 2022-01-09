let Reservation = require('../models/reservation');
let Table = require('../models/table');
let Visitor = require('../models/visitor');
let Waiter = require('../models/waiter');

let async = require('async');

exports.index = function(req, res) {

    async.parallel({
        reservation_count: function(callback) {
            Reservation.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
// countDocuments не работает, работает только просто count
        },
        waiter_count: function(callback) {
            Waiter.countDocuments({}, callback);
        },
        table_available_count: function(callback) {
            Table.countDocuments({status:'Available'}, callback);
        },
        table_count: function(callback) {
            Table.countDocuments({}, callback);
        },
        visitor_count: function(callback) {
            Visitor.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Cafe Reservation Home', error: err, data: results });
    });
};

// Display list of all Reservation.
exports.reservation_list = function(req, res) {
    Reservation.find()
        .sort('start_time')
        .populate('id_table')
        .exec(function (err, list_reservations) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('reservation_list', { title: 'Список Броней', reservation_list: list_reservations });
        });
};

// Display detail page for a specific Reservation.
exports.reservation_detail = function(req, res) {
    async.waterfall({
        reservation: function(callback) {
            Reservation.findById(req.params.id)
                .populate('id_table')
                .populate('id_visitor')
                .exec(callback);
        },

        reservation_table: function(callback) {
            Table.findById(this.reservation.id_table)
                .populate('id_waiter')
                .exec(callback);
        },

        reservation_visitor: function(callback) {
            Visitor.findById(this.reservation.id_visitor)
                .exec(callback);
        },

        table_waiter: function(callback) {
            Waiter.findById(this.reservation_table.id_waiter)
                .exec(callback);
        },

    }, function(err, results) {
        // if (err) {
        //     return next(err);
        // }
        // if (results.reservation == null) {
        //     let err = new Error('Reservation not found');
        //     err.status = 404;
        //     return next(err);
        // }

        res.render('reservation_detail', { title: 'Бронь', reservation: results.reservation,
            reservation_table: results.reservation_table,
            reservation_visitor: results.reservation_visitor,
            table_waiter: results.table_waiter
        } );
    });
};

// Display Reservation create form on GET.
exports.reservation_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation create GET');
};

// Handle Reservation create on POST.
exports.reservation_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation create POST');
};

// Display Reservation delete form on GET.
exports.reservation_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation delete GET');
};

// Handle Reservation delete on POST.
exports.reservation_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation delete POST');
};

// Display Reservation update form on GET.
exports.reservation_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation update GET');
};

// Handle Reservation update on POST.
exports.reservation_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation update POST');
};
