let Waiter = require('../models/waiter');
let Table = require('../models/table');

let async = require('async');

// Показать список всех waiters.
exports.waiter_list = function(req, res) {
    Waiter.find()
        .sort('name')
        .populate('name')
        .exec(function (err, list_waiters) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('waiter_list', { title: 'Список официантов', waiters_list: list_waiters });
        });
};

// Показать подробную страницу для данного waiter.
exports.waiter_detail = function(req, res) {
    async.parallel({
        waiter: function(callback) {
            Waiter.findById(req.params.id)
                .exec(callback);
        },
        tables: function(callback) {
            Table.find({ 'id_waiter': req.params.id })
                .sort('position')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        // if (results.book==null) { // No results.
        //     let err = new Error('Book not found');
        //     err.status = 404;
        //     return next(err);
        // }
        // Successful, so render.
        res.render('waiter_detail', { title: results.waiter.name, waiter: results.waiter, tables: results.tables } );
    });
};

// Показать форму создания waiter по запросу GET.
exports.waiter_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter create GET');
};

// Создать waiter по запросу POST.
exports.waiter_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter create POST');
};

// Показать форму удаления waiter по запросу GET.
exports.waiter_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter delete GET');
};

// Удалить waiter по запросу POST.
exports.waiter_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter delete POST');
};

// Показать форму обновления waiter по запросу GET.
exports.waiter_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter update GET');
};

// Обновить waiter по запросу POST.
exports.waiter_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Waiter update POST');
};
