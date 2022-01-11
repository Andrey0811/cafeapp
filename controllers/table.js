let Table = require('../models/table');
let Reservation = require('../models/reservation');
let Waiter = require('../models/waiter');

let async = require('async');
const {body, validationResult} = require("express-validator");

const notFoundMsg = 'Столик не найден'
const listTables = 'Список столиков'
const tableMsg = 'Столик '
const createTableMsg = 'Добавить столик'
const deleteTableMsg = 'Удаление столика'
const updateTableMsg = 'Изменить столик'
const positionNotEmptyMsg = 'Номер столика не должен быть пустым'
const countNotEmptyMsg = 'Кол-во человек не олжно быть пустым'
const waiterNotEmptyMsg = 'Обслуживающий официант должен быть азначен'
const statusNotEmptyMsg = 'Статус столика не должен быть пустым'

const deleteForm = 'table_delete'
const listForm = 'table_list'
const detailForm = 'table_detail'
const createForm = 'table_form'

const statusTable = ['Available', 'Maintenance', 'Reserved']

exports.table_list = function(req, res, next) {
    Table.find()
        .sort('position')
        .exec(function (err, list_tables) {
            if (err) { return next(err); }
            res.render(listForm, { title: listTables,
                tables_list: list_tables
            });
        });
};

exports.table_detail = function(req, res, next) {
    async.auto({
        table: function(callback) {
            Table.findById(req.params.id)
                .exec(callback);
        },
        reservations: ['table', function(results, callback) {
            Reservation.find({ 'id_table': req.params.id })
                .exec(callback);
        }],

        waiter: ['table', 'reservations', function(results, callback) {
            Waiter.findById(results.table.id_waiter)
                .exec(callback);
        }],
    }, function(err, results) {
        if (results.table == null) {
            return catchError(notFoundMsg, next)
        }
        res.render(detailForm, {
            title: tableMsg,
            table: results.table,
            reservations: results.reservations,
            waiter: results.waiter
        });
    });
};

exports.table_create_get = function(req, res, next) {
    async.parallel({
        waiter: function(callback) {
            Waiter.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render(createForm, {
            title: createTableMsg,
            waiter: results.waiter,
            isCreate: true
        });
    });
};

exports.table_create_post = [
    body('position', positionNotEmptyMsg).trim().isLength({ min: 1 }).escape(),
    body('id_waiter', waiterNotEmptyMsg).trim().isLength({ min: 1 }).escape(),
    body('count_peoples', countNotEmptyMsg).trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let table = new Table({
            position: req.body.position,
            id_waiter: req.body.id_waiter,
            count_peoples: req.body.count_peoples
        });

        if (!errors.isEmpty()) {
            async.parallel({
                waiter: function(callback) {
                    Waiter.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render(createForm, {
                    title: createTableMsg,
                    waiter: results.waiter,
                    table: table,
                    errors: errors.array(),
                    isCreate: true
                });
            });
            return;
        }
        else {
            table.save(function (err) {
                if (err) { return next(err); }
                res.redirect(table.url);
            });
        }
    }
];

exports.table_delete_get = function(req, res, next) {
    async.parallel({
        table: function(callback) {
            Table.findById(req.params.id)
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.table == null) {
            res.redirect('/catalog/tables');
        }
        res.render(deleteForm, {
            title: deleteTableMsg,
            table: results.table
        });
    });
};

exports.table_delete_post = function(req, res, next) {
    async.parallel({
        table: function(callback) {
            Table.findById(req.body.id)
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        Table.findByIdAndRemove(req.body.id, function deleteTable(err) {
            if (err) { return next(err); }
            res.redirect('/catalog/tables');
        });
    });
};

exports.table_update_get = function(req, res, next) {
    async.parallel({
        table: function(callback) {
            Table.findById(req.params.id)
                .exec(callback);
        },
        waiter: function(callback) {
            Waiter.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.table == null) {
            return catchError(notFoundMsg, next)
        }
        res.render(createForm, {
            title: updateTableMsg,
            waiter: results.waiter,
            table: results.table,
            isCreate: false
        });
    });
};

exports.table_update_post = [
    body('id_waiter', waiterNotEmptyMsg).trim().isLength({ min: 1 }).escape(),
    body('count_peoples', countNotEmptyMsg).trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let table = new Table({
            _id: req.params.id,
            position: req.body.position,
            id_waiter: req.body.id_waiter,
            count_peoples: req.body.count_peoples,
        });

        if (!errors.isEmpty()) {
            async.parallel({
                waiter: function(callback) {
                    Waiter.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render(createForm, {
                    title: updateTableMsg,
                    waiter: results.waiter,
                    table: table,
                    errors: errors.array(),
                    isCreate: false
                });
            });
            return;
        }
        else {
            Table.findByIdAndUpdate(req.params.id, table, {},
                function (err,table) {
                    if (err) { return next(err); }
                    res.redirect(table.url);
                });
        }
    }
];

function catchError(msg, next) {
    let err = new Error(msg);
    err.status = 404;
    return next(err);
}