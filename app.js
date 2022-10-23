const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const fuseSearch = require("fuse.js");

var Seniors;
var User;

// const { application } = require("express");
const url =
  "mongodb+srv://tuktuk:adgjmptw@cluster0.hdo52av.mongodb.net/?retryWrites=true&w=majority";
async function connect() {
  try {
    await mongoose.connect(url);
    console.log("connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}
connect();

// var seniorsList=[];

const seniorSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  posts: {
    type: Array,
    default: "",
  },
  collegeName: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  graduationYear: {
    type: String,
    required: true,
  },
  postsUrl: String,
  profilerUrl: String,
  profilePicture: String,
  visitors: Number,
  likes: Number,
});

const Senior = mongoose.model("Senior", seniorSchema);

// senior.save();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
// mongoose.set('useFindAndModify', false);


app.get("/", function (req, res) {
  res.render('door');
});

app.get("/signup", function (req, res) {
  res.render("signup");
});


app.post("/afterSignup", function (req, res) {
  Senior.find({}, function (err, allSeniors) {
    // console.log(allSeniors);
    var i;
    for (i = 0; i < allSeniors.length; i++) {
      if (allSeniors[i].email === req.body.email) {
        break;
      }
    }
    var p1;
    var p2;
    if (i === allSeniors.length) {
      const senior = new Senior({
        userName: req.body.userName,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        posts: [],
        postsUrl: "/posts/" + req.body.userName + "/",
        profilerUrl: "/login/" + req.body.userName,
        collegeName: req.body.collegeName,
        courseName: req.body.courseName,
        branchName: req.body.branchName,
        graduationYear: req.body.graduationYear,
        visitors: 0,
        likes: 0,
      });

      senior.save();
      // res.redirect("/");
      p1 = "door";
      p2 = senior;
    } else {
      p1 = "error";
      p2 = "Email address is in use already";
    }
    res.render(p1, { p2 });
  });
});



app.get("/home", function (req, res) {
  Senior.find({}, function (err, seniors) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", { seniors });
    }
  });
});



app.post("/profile", function (req, res) {
  console.log(User);
    res.render("profile", { User });
});



app.get("/posts/:userName", function (req, res) {
  const userName = req.params.userName;
  Senior.findOneAndUpdate(
    { userName: userName },
    { $inc: { visitors: 1 } },
    { new: true },
    function (err, response) {
      // do something
      if (err) {
        console.log(err);
      } else {
        // console.log("liked succesfully");
      }
    }
  );
  Senior.findOne({ userName: userName }, function (err, senior) {
    var p1;
    var p2;
    if (err) {
      console.log(err);
      p1 = "error";
      p2 = "user not found!!";
    } else {
      p1 = "post";
      p2 = senior;
    }
    res.render(p1, { p2 });
  });
});
app.get("/about", function (req, res) {
  res.render("about", {});
});

app.get("/signup", function (req, res) {
  res.render("signup");
});
app.post("/searchResult", function (req, res) {
  const search = req.body.search;

  const options = {
    isCaseSensitive: false,
    includeScore: false,
    shouldSort: true,
    includeMatches: false,
    findAllMatches: false,
    minMatchCharLength: 1,
    location: 0,
    threshold: 0.6,
    distance: 100,
    useExtendedSearch: false,
    ignoreLocation: false,
    ignoreFieldNorm: false,
    fieldNormWeight: 1,
    keys: ["name", "userName", "collegeName", "branchName", "graduationYear"],
  };

  Senior.find({}, function (err, seniors) {
    var p1;
    var p2;
    if (err) {
      console.log(err);
    } else {
      // list=seniors;
      const fuse = new fuseSearch(seniors, options);
      const result = fuse.search(search);
      if (result.length === 0) {
        p1 = "error";
        p2 = "result not found !!!";
      } else {
        p1 = "results";
        p2 = result;
        // console.log(result);
      }
    }
    res.render(p1, { p2 });
  });
});

app.post("/deletePost", function (req, res) {
  var _id = req.body._id;
  var postId = req.body.postId;

  Senior.findOne({ _id }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      var updatedPosts = user.posts.filter((post) => {
        return post.postId != postId;
      });
      Senior.findByIdAndUpdate(
        { _id },
        { posts: updatedPosts },
        function (err) {
          if (err) {
            console.log(err);
          } else {
          }
        }
      );
    }
  });
  Senior.findById({ _id }, function (err, p2) {
    if (err) {
      console.log(err);
    } else {
      res.render("profile", { p2 });
    }
  });
});

app.post("/home", function (req, res) {
  // res.send("working!!");
  var userName = req.body.userName;
  var password = req.body.password;
  var p1;
  var p2;

  Senior.findOne({ userName }, function (err, user) {
    if (err) {
      console.log(err);
      // connsole.log("error found!!!");
    } else if (user === null) {
      // console.log(p2);
      p1 = "error";
      p2 = "User not found !!!";
    } else if (user.password === password) {
      p1 = "home";
      Senior.find({}, function (err, users) {
        if (err) {
          console.log(err);
        } else {
          seniors =users;
          User=user;
          res.render(p1, { seniors });
        }
      });

    } else {
      p1 = "error";
      p2 = "wrong password !!!";
    }
  });
});

app.post("/newPost", function (req, res) {
  const _id = req.body.id;
  // const url=user.profileUrl;
  const title = req.body.title;
  const details = req.body.details;
  const newPost = {
    postId: title + Math.random(),
    title: title,
    details: details,
    likes: 0,
    comments: [],
  };

  Senior.findByIdAndUpdate(
    { _id },
    { $push: { posts: newPost } },
    { new: true, upsert: true },
    function (err, managerparent) {
      if (err) throw err;
    }
  );
  Senior.findById({ _id }, function (err, p2) {
    if (err) {
      console.log(err);
    } else {
      res.render("profile", { p2 });
    }
  });
});

app.post("/like", function (req, res) {
  var userName = req.body.like;
  // console.log(id);

  Senior.findOneAndUpdate(
    { userName: userName },
    { $inc: { likes: 1 } },
    { new: true },
    function (err, response) {
      // do something
      if (err) {
        console.log(err);
      } else {
        console.log("liked succesfully");
      }
    }
  );
  // res.redirect('back');
  const url = "/posts/" + userName + "/";
  res.redirect(url);
  // res.redirect('back');
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is running on port 3000");
});

// https://infinite-mesa-73877.herokuapp.com/
