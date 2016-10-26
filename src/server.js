'use strict';

const express = require('express');
// const bodyParser = require('body-parser');
// const logger = require('./setup/logger').logger();

var app = express();


//
// set up
//

// require('./setup/error')(app);
// require('./setup/logger').initialize(app);
// require('./setup/static')(app);

//
// middleware
//

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

//
// routes
//

// require('./routes')(app);
app.use(express.static('./public'));

//
// fire up the server
//

app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function () {
  // logger.info('server pid %s listening on port %s in %s mode', process.pid,  app.get('port'), app.get('env'));
  console.log('server pid %s listening on port %s in %s mode', process.pid,  app.get('port'), app.get('env'));
});

module.exports = app;
