var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var ITEMS_FILE = path.join(__dirname, 'items.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest items.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', function(req, res) {
    res.render('index.html');
})

app.get('/api/items', function(req, res) {
  fs.readFile(ITEMS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/items', function(req, res) {
  fs.readFile(ITEMS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var item_file = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newItem= {
      id: Date.now(),
      amount: req.body.amount,
      description: req.body.description,
    };
    item_file.items.push(newItem);
    fs.writeFile(ITEMS_FILE, JSON.stringify(item_file, null, 4), function(err) {
      if (err) {
        console.error("blah " + err);
        process.exit(1);
      }
      res.json(item_file);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
