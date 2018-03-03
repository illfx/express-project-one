var express = require('express');
var router = express.Router();

var redis = require('redis');

// create a new redis client and connect to our local redis instance
var client = redis.createClient();

// if an error occurs, print it to the console
client.on('error', function (err) {
    console.log("Error " + err);
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//     res.render('index.njk');
// });

router.get('', function(req, res) {
    client.keys('*', function (err, keys) {

            if (err) return console.log(err);

            let items = [];
            for(let i = 0, len = keys.length; i < len; i++) {
                items[i] = new Promise((resolve)=> {
                    client.get(keys[i], function (err, val) {
                        if(err) console.log('error: ', err);
                        resolve({key: keys[i], value: val});
                    });
                });
            }

            Promise.all(items).then(function(items){
                res.render('redis/index.njk',  { keys: keys, items: items });
            });

    });
});

router.get('/:key', function(req, res) {
    client.get(req.params.key, function(err, value){
        res.send(value);
    });
});

router.post('/redis/store', function(req, res) {
    client.set(req.body.key, req.body.value, redis.print);
});

module.exports = router;
