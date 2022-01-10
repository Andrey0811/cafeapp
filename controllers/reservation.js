let Reservation = require('../models/reservation');
let Table = require('../models/table');
let Visitor = require('../models/visitor');
let Waiter = require('../models/waiter');

let async = require('async');
const {body, validationResult} = require("express-validator");

const notFoundMsg = 'Бронь не найдены'
const listReservations = 'Список броней'
const reservationMsg = 'Бронь '
const createReservationMsg = 'Добавить бронь'
const deleteReservationMsg = 'Удаление брони'
const updateReservationMsg = 'Изменить бронь'
const visitorNotEmptyMsg = 'Посетитель не должен быть пустым'
const tableNotEmptyMsg = 'Должен быть закреплен столик за этой бронью'

const deleteForm = 'reservation_delete'
const listForm = 'reservation_list'
const detailForm = 'reservation_detail'
const createForm = 'reservation_form'

exports.index = function(req, res, next) {

    async.parallel({
        reservation_count: function(callback) {
            Reservation.countDocuments({}, callback);
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
        res.render('index', {
            title: 'Главная',
            error: err,
            data: results
        });
    });
};

exports.reservation_list = function(req, res, next) {
    Reservation.find()
        .sort('start_time')
        .exec(function (err, list_reservations) {
            if (err) { return next(err); }
            res.render(listForm, {
                title: listReservations,
                reservation_list: list_reservations
            });
        });
};

exports.reservation_detail = function(req, res, next) {
    async.auto({
        reservation: function(callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },

        reservation_table: ['reservation', function(results, callback) {
            if (results.reservation !== null)
                Table.findById(results.reservation.id_table)
                    .exec(callback);
            else
                return callback
        }],

        reservation_visitor: ['reservation', 'reservation_table',
            function(results, callback) {
                if (results.reservation !== null)
                    Visitor.findById(results.reservation.id_visitor)
                        .exec(callback);
                else
                    return callback
        }],

        table_waiter: ['reservation', 'reservation_table', 'reservation_visitor',
            function(results, callback) {
                if (results.reservation_table !== null)
                    Waiter.findById(results.reservation_table.id_waiter)
                        .exec(callback, results);
                else
                    return callback
        }],

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation == null) {
            return catchError(notFoundMsg, next)
        }
        res.render(detailForm, {
            title: reservationMsg,
            reservation: results.reservation,
            reservation_table: results.reservation_table,
            reservation_visitor: results.reservation_visitor,
            table_waiter: results.table_waiter
        });
    });
};

exports.reservation_create_get = function(req, res, next) {
    async.parallel({
        visitor: function(callback) {
            Visitor.find(callback);
        },
        table: function(callback) {
            Table.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render(createForm, {
            title: createReservationMsg,
            visitor: results.visitor,
            table: results.table
        });
    });
};

exports.reservation_create_post = [
    body('id_visitor', visitorNotEmptyMsg).trim().isLength({ min: 1 }).escape(),
    body('id_table', tableNotEmptyMsg).trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let reservation = new Reservation({
            id_visitor: req.body.id_visitor,
            id_table: req.body.id_table,
            count_peoples: req.body.count_peoples,
            start_time: req.body.start_time,
            end_time: req.body.end_time
        });

        if (!errors.isEmpty()) {
            async.parallel({
                visitor: function(callback) {
                    Visitor.find(callback);
                },
                table: function(callback) {
                    Table.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render(createForm, {
                    title: createReservationMsg,
                    visitor: results.visitor,
                    reservation: reservation,
                    table: results.table,
                    errors: errors.array()
                });
            });
            return;
        }
        else {
            reservation.save(function (err) {
                if (err) { return next(err); }
                let table = new Table({
                    _id: req.body.id_table._id,
                    position: req.body.id_table.position,
                    id_waiter: req.body.id_table.id_waiter,
                    count_peoples: req.body.id_table.count_peoples,
                    status: 'Reserved'
                });
                Table.findByIdAndUpdate(req.body.id_table._id, table, {},
                    function (err,table) {
                        if (err) { return next(err); }
                    });
                res.redirect(reservation.url);
            });
        }
    }
];

exports.reservation_delete_get = function(req, res, next) {
    async.parallel({
        reservation: function(callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation == null) {
            res.redirect('/catalog/reservations');
        }
        res.render(deleteForm, {
            title: deleteReservationMsg,
            reservation: results.reservation
        });
    });
};

exports.reservation_delete_post = function(req, res, next) {
    async.parallel({
        reservation: function(callback) {
            Reservation.findById(req.body.id)
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        Reservation.findByIdAndRemove(req.body.id, function deleteReservation(err) {
            if (err) { return next(err); }
            res.redirect('/catalog/reservations');
        });
    });
};

exports.reservation_update_get = function(req, res, next) {
    async.parallel({
        reservation: function(callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },
        visitor: function(callback) {
            Visitor.find(callback);
        },
        table: function(callback) {
            Table.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation == null) {
            return catchError(notFoundMsg, next)
        }
        res.render(createForm, {
            title: updateReservationMsg,
            visitor: results.visitor,
            reservation: results.reservation,
            table: results.table
        });
    });
};

exports.reservation_update_post = [
    body('id_visitor', visitorNotEmptyMsg).trim().isLength({ min: 1 }).escape(),
    body('id_table', tableNotEmptyMsg).trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let reservation = new Reservation({
            _id: req.params.id,
            id_visitor: req.body.id_visitor,
            id_table: req.body.id_table,
            count_peoples: req.body.count_peoples,
            start_time: req.body.start_time,
            end_time: req.body.end_time
        });

        if (!errors.isEmpty()) {
            async.parallel({
                table: function(callback) {
                    Table.find(callback);
                },
                visitor: function(callback) {
                    Visitor.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render(createForm, {
                    title: updateReservationMsg,
                    visitor: results.visitor,
                    reservation: reservation,
                    table: results.table,
                    errors: errors.array()
                });
            });
            return;
        }
        else {
            Reservation.findByIdAndUpdate(req.params.id, reservation, {},
                function (err,reservation) {
                    if (err) { return next(err); }

                    async.auto({
                        reservationOld: function(callback) {
                            Reservation.findById(req.params.id)
                                .exec(callback);
                        },
                        tableOld: ['reservationOld', function(results, callback) {
                            Table.findById(results.reservationOld.id_table)
                                .exec(callback)
                        }],
                        }, function(err, results) {
                        if (err) { return next(err); }
                            let tableOld = new Table({
                                _id: results.tableOld._id,
                                position: results.tableOld.position,
                                id_waiter: results.tableOld.id_waiter,
                                count_peoples: results.tableOld.count_peoples,
                                status: 'Available'
                            });
                            Table.findByIdAndUpdate(results.tableOld._id, tableOld, {},
                                function (err, table) {
                                    if (err) { return next(err); }
                                });
                    });

                    let tableNew = new Table({
                        _id: req.body.id_table._id,
                        position: req.body.id_table.position,
                        id_waiter: req.body.id_table.id_waiter,
                        count_peoples: req.body.id_table.count_peoples,
                        status: 'Reserved'
                    });
                    Table.findByIdAndUpdate(req.body.id_table._id, tableNew, {},
                        function (err,table) {
                            if (err) { return next(err); }
                        });

                    res.redirect(reservation.url);
                });
        }
    }
];

function catchError(msg, next) {
    let err = new Error(msg);
    err.status = 404;
    return next(err);
}