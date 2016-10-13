'use strict'

function Database() {
  this.localized_databases = {};

  // helpers

  this.get_year_from_date = function(date_in) {
    return make_date(date_in).substring(0, 4);
  };

  // YYYY-MM-DD
  function make_date(date_in) {
    return date_in.substring(0, 10);
  }
};

var db = new Database();

// data loading & syncing
Database.prototype.sync = require('./lib/data.js')(db).sync;
Database.prototype.sync_for = require('./lib/data.js')(db).sync_for;
Database.prototype.load = require('./lib/data.js')(db).load;

// data queries
Database.prototype.get_by_id = require('./lib/queries.js')(db).get_by_id;
Database.prototype.get_all = require('./lib/queries.js')(db).get_all;
Database.prototype.get_all_where = require('./lib/queries.js')(db).get_all_where;
Database.prototype.get_published = require('./lib/queries.js')(db).get_published;

// info & stats
Database.prototype.languages = require('./lib/info.js')(db).languages;
Database.prototype.databases = require('./lib/info.js')(db).databases;

/** @module Database */
module.exports = db;
