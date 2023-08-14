const mongoose = require('mongoose');

//connect to mongodb

mongoose.connect('mongodb+srv://labi1:spectacular1.@cluster0.m6lax.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
// mongoose.connect('//mongodb://localhost/bidall', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', ()=>{
    console.log('Connection to local database is established..........');
}).on('error', (error)=>{
    console.log('There was an error connecting to the database', error);
});



