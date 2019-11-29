var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    fullName: {type: String, required: true},
    phoneNum: {type: String, required: true},
    address: {type: String},
    role: {type:String},
    status: {type:String},
    company: {type:String},
    description: {type:String},
    birthday: {type:Date},
    orderList: []
})
userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
}
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports = mongoose.model('User',userSchema)