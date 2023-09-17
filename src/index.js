const app = require('./app');
const dotenv = require("dotenv");
dotenv.config();
const { mongoose} = require('mongoose');
// const client = MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
const httpServer = require('http').createServer(app);
var socket = require('socket.io');
var io = socket(httpServer);
var frmsg = require('./utils/msgs');

const {User} = require("./models/user.js")


const port = process.env.PORT || 3000;


var Users, Events, Doubts, Points;



httpServer.listen(port, async () => {

  try {

    await io.on("connection", (socket) => {
      console.log("Socket Connected");



      socket.emit('alerts', frmsg.formatMessage('Faisal', 'Welcome to Gossip Room'));

      socket.broadcast.emit('alerts', frmsg.formatMessage('Faisal', 'A new User joined the chat'));

      socket.on('disconnect', () => {
        io.emit('alerts', frmsg.formatMessage('Faisal', 'User has left the chat'));
      });

      socket.on('chatMessage', (msg) => {
        socket.broadcast.emit('message', frmsg.formatMessage('Faisal', msg));
      });

    });

    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>{console.log("connected to mongoDb")})
    .catch((err)=>{console.log(err)});
      
    Users = await User.find({});




    app.set('Users', Users);
    app.set('Events', Events);
    app.set('Doubts', Doubts);
    app.set('Points', Points);





  } catch (e) {
    console.error(e);
  }



  console.log(`server started on port ${process.env.PORT}`);

});
