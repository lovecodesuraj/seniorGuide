const mongoose=require("mongoose");

const EventSchema=mongoose.Schema({
     
title:String,
desc:String,
uid:String,
image:String,
genre:Array,
url:String,
Likes:Array,
buttonName:String,
})

 var Event=mongoose.model('Event',EventSchema);
 module.exports={Event};