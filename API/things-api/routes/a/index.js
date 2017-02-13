// this is routs/a/index.js
// this framework inspiration comes from Scotch.io
// https://scotch.io/tutorials/keeping-api-routing-clean-using-express-routers
const routes = require('express').Router();
const admin = require('./admin');
const checkout = require('./checkout');

//add route handelers for subfolders here:
routes.use('/admin', admin);
//any route specific middleware should be added here:

//add route handelers for this directorys routes here:
routes.post('/checkout/:id/:person/:qty', checkout);

//this is an inline route handler...
//this is where you land if you goto GET https://localhost:3000/a/
routes.get('/', (req, res) => {
  res.status(200).json({ message: 'You have connected to SECURE USER AUTHORIZED CATTHINGS API!' });
});


//Export our router to the the parent router.
module.exports = routes;
