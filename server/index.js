
require('babel-polyfill');
const cluster = require('cluster');

const config = require('../config');
const db = require('../lib/db');
const express = require('express');
const mongoose = require('mongoose');
// Application.
const middleware = require('./lib/middleware');
const router = require('./lib/router');
var timeout = require('connect-timeout')

/* Database */
// Connect to the database.
mongoose.connect(db.getDSN(), db.getOptions());

/* API */
// Setup the application.
const app = express();


if (config.os == "window"){
  middleware(app);
  router(app);
  app.use(timeout(1000000))
  server = app.listen(config.api.port, () => {
    console.log(`Wagerr Explorer running on port ${ config.api.port }`);
  });
  server.setTimeout(1000000);

} else {
  // Master
  if (cluster.isMaster) {
    let cpus = require('os').cpus().length;
    if (cpus > 4) {
      cpus = 4;
    }

    // cpus = 1;

    if (process.argv.length > 2 && !isNaN(process.argv[2])) {
      cpus = parseInt(process.argv[2], 10);
    }

    console.log('Start', cpus, 'workers');
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      cluster.fork();
    });
  }
  // Worker
  else {
    const config = require('../config');
    const db = require('../lib/db');
    const express = require('express');
    const mongoose = require('mongoose');
    // Application.
    const middleware = require('./lib/middleware');
    const router = require('./lib/router');
    var timeout = require('connect-timeout')

    /* Database */
    // Connect to the database.
    mongoose.connect(db.getDSN(), db.getOptions());

    /* API */
    // Setup the application.
    const app = express();

    middleware(app);
    router(app);
    app.use(timeout(1000000))
    server = app.listen(config.api.port, () => {
      console.log(`Wagerr Explorer running on port ${ config.api.port }`);
    });
    server.setTimeout(1000000);
  }
}

module.exports =  app;
