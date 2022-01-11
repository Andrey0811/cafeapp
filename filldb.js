#! /usr/bin/env node

// Get arguments passed on command line
// let userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
let async = require('async');
let Reservation = require('./models/reservation');
let Table = require('./models/table');
let Visitor = require('./models/visitor');
let Waiter = require('./models/waiter')

let mongoose = require('mongoose');
let postgresURL = 'mongodb+srv://aozhigov:root@cluster0.snrtm.mongodb.net/cafeapp?retryWrites=true&w=majority';//userArgs[0];
mongoose.connect(postgresURL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

let reservations = [];
let tables = [];
let visitors = [];
let waiters = [];

function reservationsCreate(visitor, table, count, start_time, end_time, cb) {
    let detail = {
        id_visitor: visitor,
        id_table: table,
        start_time: start_time
    }
    if (count !== false)
        detail.count_peoples = count;
    if (end_time !== false)
        detail.end_time = end_time;

    let reservation = new Reservation(detail);

    reservation.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Reservation: ' + reservation);
        reservations.push(reservation)
        cb(null, reservation)
    });
}

function waiterCreate(name, data, cb) {
    let detail = {
        name: name
    };

    if (data !== false)
        detail.date_employment = data;

    let waiter = new Waiter(detail);

    waiter.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Table: ' + waiter);
        waiters.push(waiter)
        cb(null, waiter);
    });
}

function tableCreate(position, count, waiter, status, cb) {
    let detail = {
        position: position,
        count_peoples: count
    };

    if (waiter !== false)
        detail.id_waiter = waiter;
    if (status !== false)
        detail.status = status;

    let table = new Table(detail);

    table.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Table: ' + table);
        tables.push(table)
        cb(null, table);
    });
}

function visitorCreate(name, number, cb) {
    let detail = {
        name: name,
        email: number
    }
    if (number !== false)
        detail.number = number

    let visitor = new Visitor(detail);
    visitor.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Visitor: ' + visitor);
        visitors.push(visitor)
        cb(null, visitor)
    });
}

function createWaiter(cb) {
    async.parallel([
            function (callback) {
                waiterCreate("Niko", false, callback);
            }
        ],
        cb);
}

function createTable(cb) {
    async.parallel([
            function (callback) {
                tableCreate(1, 2, waiters[0], false, callback);
            },
            function (callback) {
                tableCreate(3, 2, waiters[0], false, callback)
            },
            function (callback) {
                tableCreate(4, 4, waiters[0], false, callback)
            },
            function (callback) {
                tableCreate(6, 4, waiters[0], false, callback)
            },
            function (callback) {
                tableCreate(7, 6, waiters[0], 'Reserved', callback)
            },
            function (callback) {
                tableCreate(5, 4, waiters[0], 'Reserved', callback)
            }
        ],
        cb);
}

function createVisitor(cb) {
    async.parallel([
            function (callback) {
                visitorCreate("Andrey", "0811andrey0811@mail.ru", callback);
            },
            function (callback) {
                visitorCreate("Pasha", false, callback)
            },
            function (callback) {
                visitorCreate("Dima", "test@mail.ru", callback)
            }
        ],
        cb);
}

function createReservations(cb) {
    async.parallel([
            function (callback) {
                reservationsCreate(visitors[0], tables[5], 3, Date.now(), false, callback);
            },
            function (callback) {
                reservationsCreate(visitors[1], tables[4], false, Date.now(), false, callback);
            }
        ],
        cb);
}

async.series([
        createWaiter,
        createTable,
        createVisitor,
        createReservations
    ],
    function (err, results) {
        if (err) {
            console.log('Final error: ' + err);
        } else {
            console.log('Result: ' + results);
        }
        mongoose.connection.close();
    });




