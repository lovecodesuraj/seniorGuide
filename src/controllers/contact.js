const axios=require("axios");

const dotenv=require("dotenv");
dotenv.config();




const saveContactMessage=async(req,res)=>{
    const {name,email,message}=req.body;
    const url=process.env.GOOGLE_SPREADSHEET_URL;
    try {
     const response=await axios.post(url,{Name:name,Email:email,Message:message});
     res.status(200);
    } catch (error) {
      console.log({error});
    }
}

module.exports={
   
  saveContactMessage,
  }