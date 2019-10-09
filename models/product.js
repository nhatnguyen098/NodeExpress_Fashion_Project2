var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;
var schema = new Schema({
    imagePath: {type: String, required: true},
    title: {type: String, require: true},
    description: {type: String, required: true},
    userGroup: {type: String, required:true},
    price: {type: Number, required: true},
    reviews: [],
    orderList: [],
    productRate: {type: Number},
    totalProfit: {type: Number}
})
schema.plugin(mongoosePaginate);
module.exports = mongoose.model('Product',schema);