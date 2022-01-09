let Table = require('../models/table');

// Показать список всех Tables.
exports.table_list = function(req, res) {
    Table.find()
        .sort('position')
        .populate('position')
        .exec(function (err, list_tables) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('tables_list', { title: 'Список столиков', tables_list: list_tables });
        });
};

// Показать подробную страницу для данного Table.
exports.table_detail = function(req, res) {
    async.parallel({
        table: function(callback) {

            Table.findById(req.params.id)
                .exec(callback);
        },
        book_instance: function(callback) {

            BookInstance.find({ 'book': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });
};

// Показать форму создания Table по запросу GET.
exports.table_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Table create GET');
};

// Создать Table по запросу POST.
exports.table_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Table create POST');
};

// Показать форму удаления Table по запросу GET.
exports.table_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Table delete GET');
};

// Удалить Table по запросу POST.
exports.table_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Table delete POST');
};

// Показать форму обновления Table по запросу GET.
exports.table_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Table update GET');
};

// Обновить Table по запросу POST.
exports.table_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Table update POST');
};
