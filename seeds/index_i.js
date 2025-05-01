const mongoose = require('mongoose'); //this is to create mongoose
const campGround = require('../models/campground'); //this it to access the campground model (.. this double dot means to go back twice)
const cities = require('./cities'); //this is to access the cities
const { places, descriptors } = require('./seedHelpers'); //this is to access the seedHelper

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    //this it to connect mongoose for the database
});

const db = mongoose.connection; //this is to establish a connection between the database
//this line is to check if the connection fails, it throws an error message
db.on('error', console.error.bind(console, 'connection Error'));
//this line is to check if the connection is successful, it say "database connected"
db.once('open', () => {
    console.log('Database Connected');
});

//this function is to choose a random element from the array of seedHelpers
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//this is for seed and to create a new model
const seedDB = async () => {
    await campGround.deleteMany({}); //this deletes the database everytime and creates a new database
    for (let i = 0; i < 200; i++) {
        //this loop will go for 50 times
        const random1000 = Math.floor(Math.random() * 1000); //this line gives a random integer from 0 to 1000
        //this block to give us a random city and state
        const randPrice = Math.floor(Math.random() * 20) + 10; //this will generate random price
        const camp = new campGround({
            author: '67c535cad4e3c7c60ba7d5ed',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, //this line is to get a random element from the seedHelper using the sample function
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dycyryrg9/image/upload/v1745433586/YelpCamp/glqguptgjtraawz3tzyz.jpg',
                    filename: 'YelpCamp/glqguptgjtraawz3tzyz',
                },
                
            ], //this is to generate random image
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis, erat ac dapibus gravida, lectus purus auctor risus, sed vehicula odio justo ut magna. Integer dapibus tellus id nibh pretium, ut eleifend magna luctus.',

            price: randPrice,
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close(); //this closes the node after execution
}); //this function executes seed database
