let express = require('express');
let router = express.Router();

let redis = require('redis');

// create a new redis client and connect to our local redis instance
let client = redis.createClient();

// if an error occurs, print it to the console
client.on('error', (err) => {
    console.log("Error " + err);
});

/**
 * IT IS NOT RECOMMENDED TO USE THIS TYPE OF LOOKUP
 */
router.get('/', function(req, res) {
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

router.get('/:key', (req, res) => {
    client.get(req.params.key, (err, value) => {
        res.send(value);
    });
});

router.delete('/:key', (req, res) =>{
    client.del(req.params.key);
    res.end();
});

router.post('/store', (req, res) => {
    if(req.body.key.trim() !== ""){
        client.set(req.body.key, req.body.value);
        res.redirect('/redis');
    }else{
        res.render('redis/index.njk', { errors: { key : 'A key is required'}, old: req.body });
    }
});

module.exports = router;
