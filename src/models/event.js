const mongoose=require("mongoose");

const EventSchema=mongoose.Schema({
     
title:String,
description:String,
uid:String,
image:String,
genre:Array,
url:String,
Like:Number,
buttonName:String,
})

 var Event=mongoose.model('Event',EventSchema);
 module.exports={Event};