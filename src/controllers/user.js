// const Realm = require("realm");
// const BSON = require("bson");
// const mongoose=require("mongoose");
const {User} = require("../models/user.js");
const ejs = require('../public/javascript/ejs');



if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}



const getHome = async (req, res) => {

  try {
    if (req.cookies.uid) {
      res.redirect(`/profile/${req.cookies.uid}`);
    } else {
      if (req.query.tokenId == null) {
        res.render('home')

      } else {
        const token = req.query.token;
        const tokenId = req.query.tokenId;

        console.log('Token Id: ', tokenId);
        await app.emailPasswordAuth.confirmUser(token, tokenId);
        res.render('form', { title: 'Detail Form' });
      }
    }
  } catch (e) {
    console.error("Get Home Error: ", e);
  }

}


const getSignUp = function (req, res) {
  if (req.cookies.uid) {
    res.redirect(`/profile/${req.cookies.uid}`);
  } else {
    res.render('SignUp');
  }
}

const signUp = async (req, res) => {
  // console.log(req.body)
  try {
    if (!req.body.email || !req.body.password || !req.body.confirm) {
      throw new Error("All fields must be filled");
    } else if (req.body.password !== req.body.confirm) {
      throw new Error("Passwords do not match");
    } else {
      const { name, email, password, gender, branch, rollNo,college } = req.body;
      let genre = req.body.genre.split(' ');

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.send({ Message: "User Already exists." })
      } else {
        const newUser = await User.create({
          name,
          email,
          college,
          password,
          branch,
          gender,
          genre,
          rollNo
        });
        res.cookie('uid',newUser._id);
        localStorage.setItem('user',JSON.stringify(newUser))
        res.redirect(`/profile/${newUser._id}`);
      }


    }
    
  } catch (e) {
    console.error("SignUp Error: ", e);
  }
}

// const form = async ({ body, params }, res) => {
  //   try {
//     const credentials = Realm.Credentials.emailPassword(
//       body.email,
//       body.password
//     );
//     const user = await app.logIn(credentials);
//     console.log("Form: ", user.id);
//     const mongoUser = user.mongoClient("mongodb-atlas");
//     const collection = mongoUser.db("").collection("Users");

//     let genre = body.genre.split(' ');

//     const result = await collection.insertOne({
  //       _id: new BSON.ObjectId(user.id),
  //       name: body.name,
//       branch: body.branch,
//       genre: genre,
//       rollNo: body.rollNo,
//       email: body.email,
//       gender: body.gender
//     })

//     console.log("Form: ", result);
//     console.log("Successfully logged in!", user.id);
//     res.cookie('uid', new BSON.ObjectId(user.id));
//     res.redirect(`/profile/${user.id}`);

//   } catch (e) {
  //     console.error("Form Error: ", e);
  //   }
  
  // }
  
  
  const getLogIn = async (req, res) => {
  if (req.cookies.uid) {
    res.redirect(`/profile/${req.cookies.uid}`);
  } else {
    res.render('login');
  }
}
const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("All fields are necessary!")
    } else {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        res.send({ Message: "User not found." })
      } else {
        if (!existingUser.password === password) {
          res.send({ Message: "Wrong credentials." })
        } else {
          // const user=await User.findOne({email})
          const user=await User.findOne({email});
          console.log("Successfully logged in!", existingUser.id);
          localStorage.setItem('user',JSON.stringify(user));
          res.cookie('uid',existingUser.id)
          res.redirect(`/profile/${existingUser.id}`);
        }
      }

    }

  } catch (e) {
    console.error("Failed to log in", e);
  }
}
const logOut = async (req, res) => {
  try {
    if (req.cookies.uid) {
      res.clearCookie('uid');
      localStorage.removeItem('user')
    }
    res.redirect('/')
  } catch (e) {
    console.error('Log Out Error: ', e);
  }

}

const getProfile = async (req, res) => {


  try {
    console.log(req.params.id)
    let id =req.params.id;
    let owner = false;
    let user = {};


    if (!req.cookies.uid) {
      res.redirect('/');

    } else {
      const Users = User.find({});
      // const Events = req.app.get('Events');

      user = await User.findOne({ _id: id });
      console.log({ user })
      if (user === null) {
        console.log("user not found");
        // await app.allUsers[req.cookies.uid.toString()]?.logOut();
        res.render('SignUp', { title: "SignUp" });
      } // Render To Form For New User

      if (id.toString() === req.cookies.uid.toString()) {
        localStorage.setItem('user', JSON.stringify(user));
        owner = true;
      } // Update LocalStorage

      // let events = await Events.find({ uid: id });
      events=[];
      res.render('newProfile', { user, events, ejs, owner }); //Rende Profile

    }
  } catch (e) {
    console.error("Get Profile Error: ", e);
  }
}


module.exports = {
  getHome,
  getSignUp,
  signUp,
  getLogIn,
  logIn,
  logOut,
  getProfile,

  //upVote,
  //downVote
}
