// dependencies
const bcrypt = require('bcrypt');
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

// --- Seed added, do not run again ---
// app.get('/parks/seed', (req, res)=>{
//     Park.create([
//         {
//             name: 'Memorial Park',
//             img: 'https://i.pinimg.com/originals/98/6a/c4/986ac4bdbd5509a66ada14d896ccee13.jpg',
//             description: 'Memorial Park is one of the most popular locations for families to visit. Nestled in the Five Points neighborhood, the park boasts a swimming pool, the Birchmore Trail, a lake, and Bear Hollow Zoo. Additionally, the 72-acre park is the home of Athens Creative Theatre.',
//             rating: 4,
//             review: []
//         }, {
//             name: 'UGA State Botanical Gardens',
//             img: 'http://botgarden.uga.edu/wp-content/uploads/2016/12/slideshowHeritage2.jpg',
//             description: 'The State Botanical Garden of Georgia at the University of Georgia aims to acquire and disseminate botanical knowledge and to foster appreciation, understanding and stewardship of plants and nature through collections and displays, horticultural gardens, research, educational programs, exhibitions and special events. The garden is a 313-acre preserve set aside by UGA in 1968 for the study and enjoyment of plants and nature. Located three miles south of campus, it is a living laboratory serving educational, research, recreational and public service roles for the university and the citizens of Georgia. It contains a number of specialized theme gardens and collections, more than five miles of nature trails, and four major facilities including a tropical conservatory.',
//             rating: 5,
//             review: []
//         }, {
//             name: 'Sandy Creek Park',
//             img: 'https://photos.smugmug.com/Athens-GA/Sandy-Creek-Park/i-6Mz5x8p/1/8a33ae17/L/122714SCPLake1-L.jpg',
//             description: 'Enjoy outdoor recreation in a beautiful setting. This 782-acre park surrounds 260-acre Lake Chapman and offers a variety of activities throughout the year. Athens-Clarke County takes pride in providing the community with facilities like those of many state parks. Sandy Creek Park is the largest single location within the Athens-Clarke County Leisure Services System encompassing more than a third of all of their property and with more amenity types than any other single park in the system.',
//             rating: 4,
//             review: []
//         }
//     ])
// });

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

app.delete('/parks/:id/:i', (req,res)=>{
    Park.findById(req.params.id, (error, park)=>{
        let reviewsArray = park.reviews;
        reviewsArray.splice(req.params.i, 1);
        park.reviews = reviewsArray;
        Park.findByIdAndUpdate(req.params.id, {reviews: reviewsArray}, {new: true}, (error, reviews)=>{
            res.redirect('/');
        });
    });
});

app.post('/parks/:id/review', (req, res)=>{
    req.body.author = req.session.currentUser.username;
    Park.findById(req.params.id, (error, park)=>{
        let reviewsArray = park.reviews;
        reviewsArray.push(req.body);
        park.reviews = reviewsArray;
        Park.findByIdAndUpdate(req.params.id, {reviews: reviewsArray}, {new: true}, (error, reviews)=>{
            res.render('parks/show.ejs', {
                park: park,
                currentUser: req.session.currentUser
            });
        })
    });
});

app.put('/parks/:id/:i', (req, res)=>{
    Park.findById(req.params.id, (error, park)=>{
        let parkReview = park.reviews;
        const newReview = req.body.review;
        const newRating = req.body.rating;
        parkReview[req.params.i].review = newReview;
        parkReview[req.params.i].rating = newRating;
        console.log(park);
        Park.findByIdAndUpdate(req.params.id, {reviews: parkReview}, {new:true}, (error, reviews)=>{
            res.redirect('/');
        });
    });
});

app.get('/parks/:id/:i/edit', (req, res)=>{
    Park.findById(req.params.id, (error, park)=>{
        res.render('parks/edit.ejs', {
            currentUser: req.session.currentUser,
            park: park,
            i: req.params.i
        });
    });
});

app.post('/users', (req, res)=>{
    User.findOne({username: req.body.username}, (error, foundUsername)=>{
        if (bcrypt.compareSync(req.body.password, foundUsername.password)) {
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
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    User.create(req.body, (error, newUser)=>{
        res.redirect('/');
    });
});



// Listen
app.listen(PORT, ()=>{
    console.log('listening on port ', PORT);
});
