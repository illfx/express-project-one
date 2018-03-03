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
router.get('/', function(req, res, next) {
    res.render('index.njk');
});


// DOES NOT WORK;
router.get('/redis', function(req, res){

    client.multi()
        .keys('*', function (err, replies) {

            console.log("MULTI got " + replies.length + " replies");
            var items  = [];
            replies.forEach(function (reply, index) {
                console.log("Reply " + index + ": " + reply.toString());
                client.get(reply, function(err, data){
                    console.log(data);
                    items.push({key: reply, value: data});
                });
            });
            res.render('redis/index.njk',  { keys: replies, items: items });
        })
        .exec(function (err, replies) {});

});

// DOES NOT WORK;

router.get('/redis', function(req, res) {

    client.keys('*', function (err, keys) {
        if (err) return console.log(err);
        var items  = [],
            values = [];
            keys.forEach(function(key) {
                console.log('each', key);

                client.get(key, function (err, val) {
                    if(err) console.log('error: ', err);
                    values.push(val);
                    items.push({key: key, value: val})
                });


            });
        res.render('redis/index.njk',  { keys: keys, items: items, values: values });
    });

});

router.get('/redis/:key', function(req, res) {
   client.get(req.params.key, function(err, value){
       res.send(value);
   });
});

router.post('/redis/store', function(req, res) {
    client.set(req.body.key, req.body.value, redis.print);
    // res.send(redis.print);
    res.end();
});

module.exports = router;
