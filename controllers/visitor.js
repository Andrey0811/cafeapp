let Visitor = require('../models/visitor');

// Показать список всех visitors.
exports.visitor_list = function(req, res) {
    Visitor.find()
        .sort('name')
        .populate('name')
        .exec(function (err, list_visitors) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('visitors_list', { title: 'Список посетителей', visitors_list: list_visitors });
        });
};

// Показать подробную страницу для данного visitor.
exports.visitor_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor detail: ' + req.params.id);
};

// Показать форму создания visitor по запросу GET.
exports.visitor_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor create GET');
};

// Создать visitor по запросу POST.
exports.visitor_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor create POST');
};

// Показать форму удаления visitor по запросу GET.
exports.visitor_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor delete GET');
};

// Удалить visitor по запросу POST.
exports.visitor_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor delete POST');
};

// Показать форму обновления visitor по запросу GET.
exports.visitor_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor update GET');
};

// Обновить visitor по запросу POST.
exports.visitor_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Visitor update POST');
};
