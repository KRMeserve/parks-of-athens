// dependencies
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Park = require('./models/parks.js');
const User = require('./models/users.js');
const app = express();
const session = require('express-session');
require('dotenv').config();
const db = mongoose.connection;

// port
//allow use of heroku's port or your own local port, depending on your environment.
const PORT = process.env.PORT || 3000;

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/' + 'parks-of-athens';

// SECRET
const SECRET = process.env.SECRET;

// Connect to Mongo
mongoose.connect(MONGODB_URI, { useNewUrlParser: true});

// Errors/Success Messages
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

//Open the connection to mongo
db.on('open', ()=>{});

//Middleware
// use public folder for static assets, like css
app.use(express.static('public'));
//populates req.body with parsed info from forms
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}));

// Routes
app.get('/', (req, res)=>{
    Park.find({}, (error, allParks)=>{
        res.render('index.ejs', {
            parks: allParks,
            currentUser: req.session.currentUser
        });
    });
});

app.get('/parks/new', (req, res)=>{
    res.render('parks/new.ejs', {
        currentUser: req.session.currentUser
    });
});

app.post('/parks/new', (req, res)=>{
    Park.create(req.body, (error, newPark)=>{
        res.redirect('/');
    });
});

app.get('/parks/:id', (req, res)=>{
    Park.findById(req.params.id, (error, park)=>{
        res.render('parks/show.ejs', {
            park: park,
            currentUser: req.session.currentUser
        });
    });
});

app.post('/users', (req, res)=>{
    User.findOne({username: req.body.username}, (error, foundUsername)=>{
        if (foundUsername === null) {
            res.send('<a href="/">Username or Password was incorrect.</a>');
        } else if (req.body.password == foundUsername.password) {
            req.session.currentUser = foundUsername;
            res.redirect('/');
        } else {
            res.send('<a href="/">Username or Password was incorrect.</a>');
        }
    });
});

app.get('/users', (req, res)=>{
    res.render('users/login.ejs', {
        currentUser: req.session.currentUser
    });
});

app.get('/users/new', (req, res)=>{
    res.render('users/new.ejs', {
        currentUser: req.session.currentUser
    });
});

app.delete('/users/delete', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
});

app.post('/users/new', (req, res)=>{
    User.create(req.body, (error, newUser)=>{
        res.redirect('/');
    });
});



// Listen
app.listen(PORT, ()=>{
    console.log('listening on port ', PORT);
});
