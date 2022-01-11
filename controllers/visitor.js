let Visitor = require('../models/visitor');
let Reservation = require("../models/reservation");

let async = require('async');
const validator = require('express-validator');

const notFoundMsg = 'Посетитель не найден'
const listVisitors = 'Список посетителей'
const visitorMsg = 'Посетитель '
const createVisitorMsg = 'Добавить посетителя'
const checkErrorNameMsg = 'Требуется имя посетителя'
const checkErrorEmailMsg = 'Требуется почта посетителя'
const deleteVisitorMsg = 'Удаление посетителя'
const updateVisitorMsg = 'Изменить посетителя'

const deleteForm = 'visitor_delete'
const listForm = 'visitor_list'
const detailForm = 'visitor_detail'
const createForm = 'visitor_form'

exports.visitor_list = function(req, res, next) {
    Visitor.find()
        .sort('name')
        .exec(function (err, list_visitors) {
            if (err) { return next(err); }
            res.render(listForm, {
                title: listVisitors,
                visitors_list: list_visitors
            });
        });
};

exports.visitor_detail = function(req, res, next) {
    async.parallel({
        visitor: function(callback) {
            Visitor.findById(req.params.id)
                .exec(callback);
        },
        reservations: function(callback) {
            Reservation.find({ 'id_visitor': req.params.id })
                .sort('start_time')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.visitor == null) {
            catchError(notFoundMsg, next)
        }
        res.render(detailForm, {
            title: visitorMsg,
            visitor: results.visitor,
            reservations: results.reservations
        });
    });
};

exports.visitor_create_get = function(req, res, next) {
    res.render(createForm, { title: createVisitorMsg});
};

exports.visitor_create_post = [
    validator.body('name', checkErrorNameMsg).trim().isLength({ min: 3 }),
    // validator.body('email', checkErrorEmailMsg).trim().contains('@'),

    (req, res, next) => {
        const errors = validator.validationResult(req);
        let visitor = new Visitor({
            name: req.body.name,
            email: req.body.email
        });

        if (!errors.isEmpty()) {
            res.render(createForm, {
                title: createVisitorMsg,
                visitor: visitor,
                errors: errors.array()
            });
            return;
        }
        else {
            async.parallel(
                {
                    visitor: function (callback) {
                        Visitor.findOne({
                            'name': req.body.name,
                            'email': req.body.email
                        }).exec(callback);
                    }
                }, function (err, result) {
                    if (err) { return next(err); }

                    if (result.visitor) {
                        res.redirect(result.visitor.url);
                    } else {
                        visitor.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(visitor.url);
                        });
                    }
                })
        }
    }
];

exports.visitor_delete_get = function(req, res, next) {
    async.auto({
        visitor: function(callback) {
            Visitor.findById(req.params.id)
                .exec(callback);
        },
        reservations: ['visitor', function(result, callback) {
            Reservation.find({ 'id_visitor': req.params.id })
                .sort('start_time')
                .exec(callback);
        }],
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.visitor == null) {
            res.redirect('/catalog/visitors');
        }

        res.render(deleteForm, {
            title: deleteVisitorMsg,
            visitor: results.visitor,
            reservations: results.reservations
        });
    });
};

exports.visitor_delete_post = function(req, res, next) {
    async.auto({
        visitor: function(callback) {
            Visitor.findById(req.params.id)
                .exec(callback);
        },
        reservations: ['visitor', function(result, callback) {
            Reservation.find({ 'id_visitor': req.params.id })
                .sort('start_time')
                .exec(callback);
        }],
    }, function(err, results) {
        if (err) { return next(err); }
        async.parallel({
            reservation: function(callback) {
                Reservation.findOneAndRemove({ 'id_visitor': req.body.id })
                    .exec(callback);
                },
            visitor: function(callback) {
                Visitor.findByIdAndRemove(req.body.id).exec(callback);
            },
            }, function (callback, result) {
            if (err) { return next(err); }
            res.redirect('/catalog/visitors');
    })

    });
};

exports.visitor_update_get = function(req, res, next) {
    Visitor.findById(req.params.id, function(err, visitor) {
        if (err) { return next(err); }
        if (visitor == null) {
            catchError(notFoundMsg, next)
        }
        res.render(createForm, {
            title: updateVisitorMsg,
            visitor: visitor
        });
    });
};

exports.visitor_update_post = [
    validator.body('name', checkErrorNameMsg).trim().isLength({ min: 3 }),
    // validator.body('email', checkErrorEmailMsg).trim().contains('@'),

    (req, res, next) => {

        const errors = validator.validationResult(req);
        let visitor = new Visitor({
            _id: req.params.id,
            name: req.body.name,
            email: req.email
        });

        if (!errors.isEmpty()) {
            res.render(createForm, {
                title: updateVisitorMsg,
                visitor: visitor,
                errors: errors.array()
            });
            return;
        }
        else {
            Visitor.findByIdAndUpdate(req.params.id, visitor, {},
                function (err, visitor) {
                    if (err) { return next(err); }
                    res.redirect(visitor.url);
                }
            );
        }
    }
];

function catchError(msg, next) {
    let err = new Error(msg);
    err.status = 404;
    return next(err);
}
