var express = require('express');
var ig = require('instagram-node').instagram();
var app = express();
var path    = require("path");


var CLIEND_ID = '623198827dc54f7c80b19f349e87dcc0';
var CLIENT_SECRET = '8ee1ac77f4d1438d8f886ed61b6549b8';
var ACCESS_TOKEN;
var redirect_uri = 'http://localhost:3000/handleauth';

ig.use({
  client_id: CLIEND_ID,
  client_secret: CLIENT_SECRET
});

app.use('/', express.static('public'));

app.post('/like/:media_id', function(req, res, next) {
  ig.add_like(req.params.media_id, {
    sign_request: {
      client_secret: CLIENT_SECRET,
      client_req: req
    }
  }, function(err) {
    return res.send('OK');
  });
});

//retreiveing images data
app.get('/media', function (req, res) {
  ig.media_search(parseFloat(req.query.lat), parseFloat(req.query.lng), {distance: 5000},  function(err, medias, remaining, limit) {
    res.json({data: medias  });
  });
});

exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes','public_content']}));
};

exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    ig.use({ access_token: result.access_token });
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      res.redirect('/map.html');
    }
  });
};


// This is where users will go to authorize
app.get('/', exports.authorize_user);

// This is redirect URI
app.get('/handleauth', exports.handleauth);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
