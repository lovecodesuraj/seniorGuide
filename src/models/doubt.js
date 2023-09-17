const mongoose=require("mongoose");

const DoubtSchema=mongoose.Schema(
    {
        uid: String,
        userName: String,
        question: String,
        desc: String,
        upvotes: Array,
        downvotes: Array,
        domain: String,
        answers:Array
      })

 var Doubt=mongoose.model('Doubt',DoubtSchema);
 module.exports={Doubt};