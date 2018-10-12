// dependencies
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Park = require('./models/parks.js');
const app = express();
const db = mongoose.connection;

// port
//allow use of heroku's port or your own local port, depending on your environment.
const PORT = process.env.PORT || 3000;

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/' + 'parks-of-athens';

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

// Routes
app.get('/', (req, res)=>{
    Park.find({}, (error, allParks)=>{
        res.render('index.ejs', {
            parks: allParks
        });
    });
});

app.get('/parks/new', (req, res)=>{
    res.render('parks/new.ejs');
});

app.post('/parks/new', (req, res)=>{
    Park.create(req.body, (error, newPark)=>{
        res.redirect('/');
    });
});

// Listen
app.listen(PORT, ()=>{
    console.log('listening on port ', PORT);
});
