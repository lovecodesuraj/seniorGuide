const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    name:String,
    branch:String,
    email:String,
    password:String,
    genre:Array,
    rollNo:Number,
    gender:String,
    college:String,
    image:String,
    archived:Array
})

 var User=mongoose.model('User',userSchema);
 module.exports={User};