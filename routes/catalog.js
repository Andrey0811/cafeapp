let express = require('express');
let router = express.Router();

let reservationController = require('../controllers/reservation');
let tableController = require('../controllers/table');
let visitorController = require('../controllers/visitor');
let waiterController = require('../controllers/waiter');

router.get('/', reservationController.index);

router.get('/reservation/create', reservationController.reservation_create_get);

router.post('/reservation/create', reservationController.reservation_create_post);

router.get('/reservation/:id/delete', reservationController.reservation_delete_get);

router.post('/reservation/:id/delete', reservationController.reservation_delete_post);

router.get('/reservation/:id/update', reservationController.reservation_update_get);

router.post('/reservation/:id/update', reservationController.reservation_update_post);

router.get('/reservation/:id', reservationController.reservation_detail);

router.get('/reservations', reservationController.reservation_list);

router.get('/table/create', tableController.table_create_get);

router.post('/table/create', tableController.table_create_post);

router.get('/table/:id/delete', tableController.table_delete_get);

router.post('/table/:id/delete', tableController.table_delete_post);

router.get('/table/:id/update', tableController.table_update_get);

router.post('/table/:id/update', tableController.table_update_post);

router.get('/table/:id', tableController.table_detail);

router.get('/tables', tableController.table_list);

router.get('/visitor/create', visitorController.visitor_create_get);

router.post('/visitor/create', visitorController.visitor_create_post);

router.get('/visitor/:id/delete', visitorController.visitor_delete_get);

router.post('/visitor/:id/delete', visitorController.visitor_delete_post);

router.get('/visitor/:id/update', visitorController.visitor_update_get);

router.post('/visitor/:id/update', visitorController.visitor_update_post);

router.get('/visitor/:id', visitorController.visitor_detail);

router.get('/visitors', visitorController.visitor_list);

router.get('/waiter/create', waiterController.waiter_create_get);

router.post('/waiter/create', waiterController.waiter_create_post);

router.get('/waiter/:id/delete', waiterController.waiter_delete_get);

router.post('/waiter/:id/delete', waiterController.waiter_delete_post);

router.get('/waiter/:id/update', waiterController.waiter_update_get);

router.post('/waiter/:id/update', waiterController.waiter_update_post);

router.get('/waiter/:id', waiterController.waiter_detail);

router.get('/waiters', waiterController.waiter_list);

module.exports = router;
