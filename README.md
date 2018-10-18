# parks-of-athens
Yelp for the many parks of Athens
---
[Parks of Athens](https://parks-of-athens.herokuapp.com/)
---

## Technologies Used

This unit project was focused on working in node, express, mongo, mongoose, and ejs. As such, all back-end work was done with mongoDB, mongoose, and express. The front-end work was done within the server.js file and the multiple ejs files.

Minimal security was done using bcrypt, but even so I recommend not entering your normal username/password into the parks of Athens website.

---

## Approach Taken

The first day was spent planning the multiple pathways that this website would have. I knew early on that I didn't want anyone to simply be able to add a new park to the website and that the only thing the average user would be able to edit/delete would be their own reviews. This took a lot of conceptual planning before beginning work, and I eventually started with bare minimal CSS and focused on getting my different ejs pathways to work.

Strangely enough, when I got discouraged in my progress I was making on the actual functionality of the site and switched to CSS, I actually fixed some functionality issues along the way. The website went from a barely working app to something I'm pretty proud of fairly quickly. I am glad I didn't try to use bootstrap or another framework (although I'm sure it would have looked better if I had) because going back through my entire website to get the CSS working how I wanted actually is how I realized why certain things weren't working the way I wanted.

With CSS, I tried to focus on making the website look pleasant on the mobile first. Then, I focused on what it would look like on medium resolutions and finally on 1080p width monitors. This was the first real project that I worked on attempting a 'mobile first' CSS philosophy and I learned a lot about how to approach this on the next project.  

---

## Unsolved Problems

Unfortunately, the way I approached the website was to just start throwing code into the server.js file and thought "I'll add the routers later." By the time I finished the CSS and functionality of the website, the project was due shortly and I didn't want to end up with weird bugs hours before presentation. As a result, my server.js page holds all of my routers and I know that this would have been an easy fix if I spent 30 minutes getting the proper pathways set up early on in the project. On future projects I will always do that first.

I wanted my moving picture to BE the background of the header but couldn't figure out how to get that to work. I think the website would look a bit cooler if the video wasn't stuck to its aspect ratio and I could have figured out how to zoom in a little and make it wider. However, it is working at least and still looks nice. I think it would make the website look much better, though.

I was using partials for the header and footer across all of my ejs files. However, something is wrong with my project, because even though I have used the express static function on the public folder my pathways to reach the CSS and partials were different for every page! I spent countless hours trying to fix that and met with the TAs multiple times and none of us could solve the issue. I think this issue might be tied to my routers having never been implemented, but this problem doesn't make sense to me.

---

## Code I Am Proud Of

```
<% if (park.reviews.length > 0) { %>
    <div class="user-rating">
        <p>User Rating:
            <% let userRating = 0; %>
            <% for (let i = 0; i < park.reviews.length; i++) { %>
                <% userRating += park.reviews[i].rating %>
            <% } %>
            <% userRating = userRating/park.reviews.length %>
            <%=userRating.toFixed(1)%>/5
        </p>
    </div>
<% } %>
```  
The User Rating will appear on the show page for the parks in which the users have left ratings. First, I check to make sure there are user ratings before printing the user-rating div. Then, I run a for loop and add all of the ratings together. Then I divide the sum by the amount of reviews to get the average rating. The answer is then printed to the page to display the rating out of five (and showed with a single decimal point).



```
// Adding a Review to the Park
app.post('/parks/:id/review', (req, res)=>{
    req.body.author = req.session.currentUser.username;
    Park.findById(req.params.id, (error, park)=>{
        let reviewsArray = park.reviews;
        reviewsArray.push(req.body);
        park.reviews = reviewsArray;
        Park.findByIdAndUpdate(req.params.id, {reviews: reviewsArray}, {new: true}, (error, reviews)=>{
            res.redirect('/');
        })
    });
});

// Updating the Review inside the Park
app.put('/parks/:id/:i', (req, res)=>{
    Park.findById(req.params.id, (error, park)=>{
        let parkReview = park.reviews;
        const newReview = req.body.review;
        const newRating = req.body.rating;
        parkReview[req.params.i].review = newReview;
        parkReview[req.params.i].rating = newRating;
        Park.findByIdAndUpdate(req.params.id, {reviews: parkReview}, {new:true}, (error, reviews)=>{
            res.redirect('/');
        });
    });
});
```
When a user is posting a review, I needed to add the review as an object within the key 'review' on the park's actual database entry. This is not something I had been taught how to do and the above code was reached after many days of working toward functionality. The logic turned out to be fairly simple, but I'm still happy that I was able to get this working.

First, I found the correct park and created a variable holding the array of reviews already present. Then, I added the new review object to the array. Then, I use the findByIdAndUpdate function to wipe the current reviews array and replace it with the new array holding all the old reviews AND the new one.

The same logic was followed for editing the review. I created a variable with all the reviews, and then replaced the review and rating of the correct review inside my variable. Then, I used the findByIdAndUpdate function to replace the reviews with the new, updated array.



```
<% if (currentUser) { %>
    <% if (currentUser.username =='KyleRM') { %>
        <a href="/parks/new">Add a New Park</a>
    <% } %>
<% } %>
```
The above code is VERY simple and something I'm ashamed took me so long to figure out (with a TA's help). I didn't know that you could nest a more complex if statement inside another if statement in order to allow the page to load should the object in question not be defined.

I wanted to be able to add a new park only if I was the one who was logged into the website. The above if statement only shows the button to add a new park when the user logged in has a username of KyleRM.

---
