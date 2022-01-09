let express = require('express');
let router = express.Router();

// Требующиеся модули контроллеров.
let reservationController = require('../controllers/reservation');
let tableController = require('../controllers/table');
let visitorController = require('../controllers/visitor');
let waiterController = require('../controllers/waiter');

// GET catalog home page.
router.get('/', reservationController.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
// GET запрос для создания книги. Должен появиться до маршрута, показывающего книгу(использует id)
router.get('/reservation/create', reservationController.reservation_create_get);

// POST request for creating Book.
router.post('/reservation/create', reservationController.reservation_create_post);

// GET request to delete Book.
router.get('/reservation/:id/delete', reservationController.reservation_delete_get);

// POST request to delete Book.
router.post('/reservation/:id/delete', reservationController.reservation_delete_post);

// GET request to update Book.
router.get('/reservation/:id/update', reservationController.reservation_update_get);

// POST request to update Book.
router.post('/reservation/:id/update', reservationController.reservation_update_post);

// GET request for one Book.
router.get('/reservation/:id', reservationController.reservation_detail);

// GET request for list of all Book items.
router.get('/reservations', reservationController.reservation_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
// GET-запрос для создания автора. Должен появиться до маршрута для id (для вывода автора)
router.get('/table/create', tableController.table_create_get);

// POST request for creating Author.
router.post('/table/create', tableController.table_create_post);

// GET request to delete Author.
router.get('/table/:id/delete', tableController.table_delete_get);

// POST request to delete Author.
router.post('/table/:id/delete', tableController.table_delete_post);

// GET request to update Author.
router.get('/table/:id/update', tableController.table_update_get);

// POST request to update Author.
router.post('/table/:id/update', tableController.table_update_post);

// GET request for one Author.
router.get('/table/:id', tableController.table_detail);

// GET request for list of all Authors.
router.get('/tables', tableController.table_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
// GET-запрос для создания жанра. Должен появиться до маршрута, выводящего жанр (( с использованием id)
router.get('/visitor/create', visitorController.visitor_create_get);

//POST request for creating Genre.
router.post('/visitor/create', visitorController.visitor_create_post);

// GET request to delete Genre.
router.get('/visitor/:id/delete', visitorController.visitor_delete_get);

// POST request to delete Genre.
router.post('/visitor/:id/delete', visitorController.visitor_delete_post);

// GET request to update Genre.
router.get('/visitor/:id/update', visitorController.visitor_update_get);

// POST request to update Genre.
router.post('/visitor/:id/update', visitorController.visitor_update_post);

// GET request for one Genre.
router.get('/visitor/:id', visitorController.visitor_detail);

// GET request for list of all Genre.
router.get('/visitors', visitorController.visitor_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
// GET-запрос для создания экземпляра книги. Должен появиться до маршрута, выводящего BookInstance с использованием id
router.get('/waiter/create', waiterController.waiter_create_get);

// POST request for creating BookInstance.
router.post('/waiter/create', waiterController.waiter_create_post);

// GET request to delete BookInstance.
router.get('/waiter/:id/delete', waiterController.waiter_delete_get);

// POST request to delete BookInstance.
router.post('/waiter/:id/delete', waiterController.waiter_delete_post);

// GET request to update BookInstance.
router.get('/waiter/:id/update', waiterController.waiter_update_get);

// POST request to update BookInstance.
router.post('/waiter/:id/update', waiterController.waiter_update_post);

// GET request for one BookInstance.
router.get('/waiter/:id', waiterController.waiter_detail);

// GET request for list of all BookInstance.
router.get('/waiters', waiterController.waiter_list);

module.exports = router;
