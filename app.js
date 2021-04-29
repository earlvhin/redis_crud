const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOvr = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to Redis Server');
})

// Set Port
const port = 3000;

// Init App Variables
const app = express();

// View Engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Method Override
app.use(methodOvr('_method'));

// Routes
app.get('/', (req, res, next) => {
    res.render('searchusers');
})

// Search Processing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id;

    client.hgetall(id, (err, obj) => {
        console.log(obj);

        if(!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            })
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            })
        }
    })
})

// Add User
app.get('/user/add', (req, res, next) => {
    res.render('adduser');
})

app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'lastname', lastname,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if (err) {
            console.log(err);
        }

        console.log(reply);
        res.redirect('/');
    })
})

app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/');
})

app.listen(port, () => {
    console.log('Server started on port', port);
})