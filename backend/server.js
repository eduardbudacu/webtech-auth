const express = require("express")
const bodyParser = require("body-parser") 
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  
const session = require("express-session");

const app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin ? req.headers.origin : "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  next();
});

app.use(session({ secret: 'secret1321231231' }));
app.use(passport.initialize());
app.use(passport.session());
 
  
const User = {
    findOne: function(userDetails, callback) {
        callback(null, {
            id:1, 
            username:userDetails.username, 
            validPassword: function(password) {
              if(password == 1234) {
                return true;
              } else {
                return false;
              }  
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
   res.status(200).send({username: req.user.username, id: req.user.id});
});


app.use(express.static('../frontend/'))

function isAuthenticated(req, res, next) {
  // check the user session
  if (req.user)
      return next();
  res.status(401).send();
}


app.get('/users/me',
  isAuthenticated,
  function(req, res) {
    res.status(200).send({username: req.user.username, id: req.user.id});
});

app.get('/logout', function(req, res){
  req.logout();
  res.status(200).send('bye');
});

app.listen(8080);