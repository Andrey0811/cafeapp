let Waiter = require('../models/waiter');
let Table = require('../models/table');

let async = require('async');
const validator = require('express-validator');
const {body} = require("express-validator");

const notFoundMsg = 'Официант не найден'
const listWaiters = 'Список официантов'
const waiterMsg = 'Официант '
const createWaiterMsg = 'Добавить официанта'
const checkErrorMsg = 'Требуется имя официанта'
const deleteWaiterMsg = 'Удаление официанта'
const updateWaiterMsg = 'Изменить официанта'

const deleteForm = 'waiter_delete'
const listForm = 'waiter_list'
const detailForm = 'waiter_detail'
const createForm = 'waiter_form'

exports.waiter_list = function(req, res, next) {
    Waiter.find()
        .sort('name')
        .exec(function (err, list_waiters) {
            if (err) { return next(err); }
            res.render(listForm, { title: listWaiters, waiters_list: list_waiters });
        });
};

exports.waiter_detail = function(req, res, next) {
    async.parallel({
        waiter: function(callback) {
            Waiter.findById(req.params.id)
                .exec(callback);
        },
        tables: function(result, callback) {
            Table.find({ 'id_waiter': req.params.id })
                .sort('position')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.waiter == null) {
            catchError(notFoundMsg, next)
        }
        res.render(detailForm, {
            title: waiterMsg,
            waiter: results.waiter,
            tables: results.tables
        });
    });
};

exports.waiter_create_get = function(req, res, next) {
    res.render(createForm, { title: createWaiterMsg, isCreate: true });
};

exports.waiter_create_post = [
    validator.body('name', checkErrorMsg).trim().isLength({ min: 3 }),

    (req, res, next) => {
        const errors = validator.validationResult(req);
        let waiter = new Waiter({
            name: req.body.name,
            date_employment: req.date_employment
        });

        if (!errors.isEmpty()) {
            res.render(createForm, {
                title: createWaiterMsg,
                waiter: waiter,
                errors: errors.array(),
                isCreate: true
            });
            return;
        }
        else {
            async.parallel(
                {
                    waiter: function (callback) {
                        Waiter.findOne({
                            'name': req.body.name,
                            'date_employment': req.date_employment
                        })
                            .exec(callback);
                    }
                }, function (err, result) {
                    if (err) { return next(err); }

                    if (result.waiter) {
                        res.redirect(result.waiter.url);
                    } else {
                        result.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(result.waiter.url);
                        });
                    }
                })
        }
    }
];

exports.waiter_delete_get = function(req, res, next) {
    async.parallel({
        waiter: function(callback) {
            Waiter.findById(req.params.id)
                .exec(callback);
        },
        tables: function(result, callback) {
            Table.find({ 'id_waiter': req.params.id })
                .sort('position')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.waiter == null) {
            res.redirect('/catalog/waiters');
        }

        res.render(deleteForm, {
            title: deleteWaiterMsg,
            waiter: results.waiter,
            tables: results.tables
        });
    });
};

exports.waiter_delete_post = function(req, res, next) {
    async.parallel({
        waiter: function(callback) {
            Waiter.findById(req.params.id)
                .exec(callback);
        },
        tables: function(result, callback) {
            Table.find({ 'id_waiter': req.params.id })
                .sort('position')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.tables.length > 0) {
            //может сообщение вывести о том или овую страницу о том что попутно удаляятся еще и столики
            res.render(deleteForm, {
                title: deleteWaiterMsg,
                waiter: results.waiter,
                tables: results.tables
            });
            return;
        }
        else {
            Waiter.findByIdAndRemove(req.body.id, function deleteWaiter(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/waiters');
            });

        }
    });
};

exports.waiter_update_get = function(req, res, next) {
    Waiter.findById(req.params.id, function(err, waiter) {
        if (err) { return next(err); }
        if (waiter == null) {
            catchError(notFoundMsg, next)
        }
        res.render(createForm, {
            title: updateWaiterMsg,
            waiter: waiter,
            isCreate: false
        });
    });
};

exports.waiter_update_post = [

    body('name', checkErrorMsg).trim().isLength({ min: 3 }).escape(),

    (req, res, next) => {

        const errors = validator.validationResult(req);
        let waiter = new Waiter({
            _id: req.params.id,
            name: req.body.name,
            date_employment: req.date_employment
        });

        if (!errors.isEmpty()) {
            res.render(createForm, {
                title: updateWaiterMsg,
                waiter: waiter,
                errors: errors.array(),
                isCreate: true
            });
            return;
        }
        else {
            Waiter.findByIdAndUpdate(req.params.id, waiter, {},
                function (err,waiter) {
                    if (err) { return next(err); }
                    res.redirect(waiter.url);
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