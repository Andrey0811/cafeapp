let bookshelf = require('mongoose');

let Schema = bookshelf.Schema;

let VisitorSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true}
});

VisitorSchema.virtual('url').get( function () {
    return '/catalog/visitor/' + this._id;
});

module.exports = bookshelf.model('Visitor', VisitorSchema)