// const Realm = require("realm");
// const BSON = require("bson");
// const sharp = require('sharp');
const fs = require('fs')
const { config } = require("dotenv");
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

  var imgData = req.file.buffer;
  const user = JSON.parse(localStorage.getItem('user'));
  try {

    // let resizedImage = await sharp(imgData).resize(289, 347).png();
    //  resizedImage = resizedImage.toString('base64');
    // // resizedImage = new Buffer.from(resizedImage, 'base64');
    // console.log(resizedImage);
    function base64_encode(imgData) {
      // read binary data
      var bitmap = fs.readFileSync(imgData);
      // convert binary data to base64 encoded string
      return new Buffer(bitmap).toString('base64');
  }
  const resizedImage=base64_encode(imgData);
  console.log({resizedImage});

    await User.findOneAndUpdate({
      _id:req.cookies.uid
    }, {
      $set: {
        image: response.data.id
      }
    }); // Uploading URL TO Mongo




  } catch (err) {
    console.error("Edit Profile Image: ", err);
  } finally {
    res.redirect(`/profile/${req.cookies.uid}`);
  }
}

const createPost = async (req, res) => {
  // const Users = await User.find();
  const Events = await Event.find();
  let user = JSON.parse(localStorage.getItem('user'));
  // let id = new BSON.ObjectId();
  let image = '';


  try {


    if (req.file) {
      var imgData = req.file.buffer;
      image = await sharp(imgData).resize(450, 250).png().toBuffer();
      image = image.toString('base64');
      image = new Buffer.from(image, 'base64');
      fs.writeFileSync('src/controllers/image.png', image);

      const filePath = path.join(__dirname, 'image.png');
      console.log({ clientID: CLIENT_ID });
      console.log({ clinetSecret: CLIENT_SECRET });
      oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
      })

      const response = await drive.files.create({
        requestBody: {
          name: user._id.toString(),
          mimeType: 'image/png'
        },
        media: {
          mimeType: 'image/png',
          body: fs.createReadStream(filePath)
        }
      })
      image = response.data.id;
    }
    const createPublicUrl = async () => {
     const fileId=image;
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role:'reader',
            type:'anyone',
          }
        })
        const result = await drive.files.get({
          fileId,
          fields:'webViewLink, webContentLink',
        })
        console.log({result});
        return result.webViweLink;
      } catch (error) {
        console.log("erroer in generating public url",error);
      }
    }

    image = await createPublicUrl();
    console.log({image});

    if (req.cookies.uid) {
      const result = await Event.create({
        uid: user._id,
        title: req.body.title.trim(),
        desc: req.body.description.trim(),
        genre: req.body.genre.trim(),
        image: image,
        buttonName: req.body.buttonName || null,
        url: req.body.url || null,
        like: 0
      });

      console.log("Custom: ", req.body.custom);
      console.log("Result: ", result);

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


  let result = await Users.aggregate([
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
  ]).toArray();
  console.log("Result: ", result);




  res.json({ result })
}







module.exports = {
  editProfileImage,
  createPost,
  searchUser
}
