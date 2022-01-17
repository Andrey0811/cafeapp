let Reservation = require('../models/reservation');
let Table = require('../models/table');
let Visitor = require('../models/visitor');
let Waiter = require('../models/waiter');

let async = require('async');
let {body, validationResult} = require("express-validator");
let nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_FOR_MAIL,
        pass: process.env.PASSWORD_GMAIL_FOR_MAIL
    },
})

let createOrUpdate = function (email, obj, isUpdate) {
    if (email)
        transporter.sendMail({
            from: '"Кофейня" <cafeapp606@gmail.com>',
            to: email,
            subject: 'Бронь на ваше имя в кофейне' + (isUpdate ? ' [Изменения]' : ''),
            text: 'Это сообщение сформировано автоматически, просьба не отвечать на него.',
            html:
                '<h1>Бронь</h1> ' +
                '   <h4>Забронировано с ' + obj.date + ' на ' + obj.hours + ' часа ' + obj.minutes + ' минут для ' + obj.count_peoples + '</h4>' +
                '   <h4>Стол № + ' + obj.table + '</h4>' +
                '<h4>Посетитель: ' + obj.name + '</h4>',
        })
}

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

exports.index = function (req, res) {

    async.parallel({
        reservation_count: function (callback) {
            Reservation.countDocuments({}, callback);
        },
        waiter_count: function (callback) {
            Waiter.countDocuments({}, callback);
        },
        table_count: function (callback) {
            Table.countDocuments({}, callback);
        },
        visitor_count: function (callback) {
            Visitor.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {
            title: 'Главная',
            error: err,
            data: results
        });
    });
};

exports.reservation_list = function (req, res, next) {
    Reservation.find()
        .sort('start_time')
        .exec(function (err, list_reservations) {
            if (err) {
                return next(err);
            }
            res.render(listForm, {
                title: listReservations,
                reservation_list: list_reservations
            });
        });
};

exports.reservation_detail = function (req, res, next) {
    async.auto({
        reservation: function (callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },

        reservation_table: ['reservation', function (results, callback) {
            if (results.reservation !== null)
                Table.findById(results.reservation.id_table)
                    .exec(callback);
            else
                return callback
        }],

        reservation_visitor: ['reservation', 'reservation_table',
            function (results, callback) {
                if (results.reservation !== null)
                    Visitor.findById(results.reservation.id_visitor)
                        .exec(callback);
                else
                    return callback
            }],

        table_waiter: ['reservation', 'reservation_table', 'reservation_visitor',
            function (results, callback) {
                if (results.reservation_table !== null)
                    Waiter.findById(results.reservation_table.id_waiter)
                        .exec(callback, results);
                else
                    return callback
            }],

    }, function (err, results) {
        if (err) {
            return next(err);
        }
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

exports.reservation_create_get = function (req, res, next) {
    async.parallel({
        visitor: function (callback) {
            Visitor.find(callback);
        },
        table: function (callback) {
            Table.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        res.render(createForm, {
            title: createReservationMsg,
            visitor: results.visitor,
            table: results.table
        });
    });
};

exports.reservation_create_post = [
    body('id_visitor', visitorNotEmptyMsg).trim().isLength({min: 1}).escape(),
    body('id_table', tableNotEmptyMsg).trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let reservation = new Reservation({
            id_visitor: req.body.id_visitor,
            id_table: req.body.id_table,
            count_peoples: req.body.count_peoples,
            start_time: getDateFromPartial(req.body.start_date, req.body.start_time.split(':')),
            end_time: getTimeNumberFromString(req.body.end_time)
        });

        async.parallel({
            visitor: function (callback) {
                Visitor.find(callback);
            },
            table: function (callback) {
                Table.find(callback);
            },
            reservation: function (callback) {
                Reservation.find({'id_table': req.body.id_table})
                    .exec(callback)
            },
        }, function (err, results) {
            let myErrors = errors.array()
            if (err) {
                return next(err);
            }
            while (results.reservation.length > 0) {
                let reserv = results.reservation.pop()
                if ((reservation.start_time < new Date(Number(reserv.start_time) + reserv.end_time)
                        && reservation.start_time >= reserv.start_time)
                    || (new Date(Number(reservation.start_time) + reservation.end_time) <= new Date(Number(reserv.start_time) + reserv.end_time)
                        && new Date(Number(reservation.start_time) + reservation.end_time) > reserv.start_time)) {
                    myErrors.push({msg: 'Это время уже занято', nestedErrors: []})
                    break
                }
            }
            if (reservation.start_time < Date.now()) {
                myErrors.push({msg: 'Это время уже прошло', nestedErrors: []})
            }
            if (myErrors.length > 0) {
                res.render(createForm, {
                    title: createReservationMsg,
                    visitor: results.visitor,
                    reservation: reservation,
                    table: results.table,
                    errors: myErrors
                });
                return;
            }

            let visitorTot;
            while (results.visitor.length > 0) {
                let temp = results.visitor.pop()
                if (temp._id.toString() === reservation.id_visitor.toString()) {
                    visitorTot = temp
                    break
                }
            }

            createOrUpdate(visitorTot.email, {
                date: reservation.start_time, hours: div(reservation.end_time, 1000 * 60 * 60),
                minutes: div(reservation.end_time, 1000 * 60) - div(reservation.end_time, 1000 * 60 * 60) * 60,
                count_peoples: reservation.count_peoples,
                table: results.table.position, name: visitorTot.name
            }, false)

            reservation.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(reservation.url);
            });
        });
    }
];

exports.reservation_delete_get = function (req, res, next) {
    async.parallel({
        reservation: function (callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.reservation == null) {
            res.redirect('/catalog/reservations');
        }
        res.render(deleteForm, {
            title: deleteReservationMsg,
            reservation: results.reservation
        });
    });
};

exports.reservation_delete_post = function (req, res, next) {
    async.parallel({
        reservation: function (callback) {
            Reservation.findById(req.body.id)
                .exec(callback);
        },
    }, function (err) {
        if (err) {
            return next(err);
        }
        Reservation.findByIdAndRemove(req.body.id, function deleteReservation(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/catalog/reservations');
        });
    });
};

exports.reservation_update_get = function (req, res, next) {
    async.parallel({
        reservation: function (callback) {
            Reservation.findById(req.params.id)
                .exec(callback);
        },
        visitor: function (callback) {
            Visitor.find(callback);
        },
        table: function (callback) {
            Table.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
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
    body('id_visitor', visitorNotEmptyMsg).trim().isLength({min: 1}).escape(),
    body('id_table', tableNotEmptyMsg).trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let reservation = new Reservation({
            _id: req.params.id,
            id_visitor: req.body.id_visitor,
            id_table: req.body.id_table,
            count_peoples: req.body.count_peoples,
            start_time: getDateFromPartial(req.body.start_date, req.body.start_time.split(':')),
            end_time: getTimeNumberFromString(req.body.end_time)
        });

        async.parallel({
            visitor: function (callback) {
                Visitor.find(callback);
            },
            table: function (callback) {
                Table.find(callback);
            },
            reservation: function (callback) {
                Reservation.find({'id_table': req.body.id_table})
                    .exec(callback)
            },
        }, function (err, results) {
            let myErrors = errors.array()
            if (err) {
                return next(err);
            }
            while (results.reservation.length > 0) {
                let reserv = results.reservation.pop()
                if ((reservation.start_time < new Date(Number(reserv.start_time) + reserv.end_time)
                        && reservation.start_time >= reserv.start_time)
                    || (new Date(Number(reservation.start_time) + reservation.end_time) <= new Date(Number(reserv.start_time) + reserv.end_time)
                        && new Date(Number(reservation.start_time) + reservation.end_time) > reserv.start_time)) {
                    myErrors.push({msg: 'Это время уже занято', nestedErrors: []})
                    break
                }
            }
            if (reservation.start_time < Date.now()) {
                myErrors.push({msg: 'Это время уже прошло', nestedErrors: []})
            }
            if (myErrors.length > 0) {
                haveErrors = true
                res.render(createForm, {
                    title: createReservationMsg,
                    visitor: results.visitor,
                    reservation: reservation,
                    table: results.table,
                    errors: myErrors
                });
                return;
            }

            let visitorTot;
            while (results.visitor.length > 0) {
                let temp = results.visitor.pop()
                if (temp._id.toString() === reservation.id_visitor.toString()) {
                    visitorTot = temp
                    break
                }
            }

            createOrUpdate(visitorTot.email, {
                date: reservation.start_time, hours: div(reservation.end_time, 1000 * 60 * 60),
                minutes: div(reservation.end_time, 1000 * 60) - div(reservation.end_time, 1000 * 60 * 60) * 60,
                count_peoples: reservation.count_peoples,
                table: results.table.position, name: visitorTot.name
            }, true)

            Reservation.findByIdAndUpdate(req.params.id, reservation, {},
                function (err, reservation) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(reservation.url);
                });
        });
    }
];

function catchError(msg, next) {
    let err = new Error(msg);
    err.status = 404;
    return next(err);
}

function getDateFromPartial(date, time) {
    let dateTemp = new Date(date)
    dateTemp.setHours(parseInt(time[0]));
    dateTemp.setMinutes(parseInt(time[1]));
    return dateTemp;
}

function getTimeNumberFromString(str) {
    let arr = str.split(':')
    return (60 * parseInt(arr[0]) + parseInt(arr[1])) * 60 * 1000
}

function div(val, by) {
    return (val - val % by) / by;
}