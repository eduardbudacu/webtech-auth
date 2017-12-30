const express = require("express")
const bodyParser = require("body-parser") 
const cors = require("cors")
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  
const session = require("express-session");

const app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cors());

app.use(session({ secret: 'secret1321231231' }));
app.use(passport.initialize());
app.use(passport.session());
 
  
const User = {
    findOne: function(userDetails, callback) {
        callback(null, {
            id:1, 
            username:userDetails.username, 
            password: 1234, 
            validPassword: function(password) {
        return true;
    }})
    }
}

passport.use(new LocalStrategy( 
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });


app.use(express.static('../frontend/'))

app.get('/users/:username',
  function(req, res) {
    res.send('Hello, '+ req.user.username);
});

app.listen(8080);