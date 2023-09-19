const imageToBase64 = require('image-to-base64');

const fs = require('fs')
const { config } = require("dotenv");
const sharp = require("sharp");

config();
const path = require('path');
const { drive } = require('../services/googleapis');
const { User } = require("../models/user.js")
const { Event } = require("../models/event.js")
const { google } = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
)

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });




if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}










const editProfileImage = async (req, res) => {

  const user = JSON.parse(localStorage.getItem('user'));
  var imgData = req.file.buffer;
  try {
    
    
    // var imgData = req.file.buffer;
    image = await sharp(imgData).resize(450, 250).png().toBuffer();
    image = image.toString('base64');
    image = new Buffer.from(image, 'base64');
    fs.writeFileSync('src/controllers/image.png', image);

    const filePath = path.join(__dirname, 'image.png');
    // var imageAsBase64 = fs.readFileSync(filePath, 'base64');
    var imageAsBase64 = await imageToBase64(filePath);
    imageAsBase64="data:image/jpeg;base64,"+imageAsBase64;
    
    const updatedUser = await User.findOneAndUpdate({
      _id: req.cookies.uid
    }, {
      $set: {
        image: imageAsBase64
      }
    }); // Uploading URL TO Mongo
    console.log({ updatedUser });
    
    
    
  } catch (err) {
    console.error("Edit Profile Image: ", err);
  } finally {
    res.redirect(`/profile/${req.cookies.uid}`);
  }
}

const createPost = async (req, res) => {
  let user = JSON.parse(localStorage.getItem('user'));
  let image = '';
  var imgData = req.file.buffer;
  
  try {
    
    
    if (req.file) {
      image = await sharp(imgData).resize(450, 250).png().toBuffer();
      image = image.toString('base64');
      image = new Buffer.from(image, 'base64');
      fs.writeFileSync('src/controllers/image.png', image);
      
      const filePath = path.join(__dirname, 'image.png');
      var imageAsBase64 = await imageToBase64(filePath);
      imageAsBase64="data:image/jpeg;base64,"+imageAsBase64;
      
      if (req.cookies.uid) {
        const result = await Event.create({
          uid: user._id,
          title: req.body.title.trim(),
          desc: req.body.description.trim(),
          genre: req.body.genre.trim(),
          image: imageAsBase64,
          buttonName: req.body.buttonName || null,
          url: req.body.url || null,
          like: 0
        });
        console.log({result})
      }
    }
  } catch (err) {
    console.error("Create Post Error: ", err);
  } finally {
    // res.redirect(`/profile/${req.cookies.uid.toString()}`);
    res.redirect('/events')
  }


}

const searchUser = async (req, res) => {


  const Users = await User.find();


  let result = await User.find([
    {
      "$search": {
        "autocomplete": {
          "query": `${req.query.name}`,
          "path": "name",
          "fuzzy": {
            "maxEdits": 2
          }
        }
      }
    }
  ]);
  console.log("Result: ", result);
  res.json({ result })
}







module.exports = {
  editProfileImage,
  createPost,
  searchUser
}
