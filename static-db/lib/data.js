'use strict'

const fs = require('fs');
const _ = require('lodash');
const async = require('async');
const contentful = require('contentful');
const spaces = require('../spaces.json');
const chalk = require('chalk');

function make_file_name(language) {
  return `${__dirname}/../data/${language}.json`;
}

function initial_sync(client, file, cb) {
    console.log(chalk.magenta(`initial sync [${file}]`));

    client.sync({ initial: true, resolveLinks: false })
      .then(function(response) {
        let data = {
          items: response.entries.concat(response.assets),
          nextSyncToken: response.nextSyncToken
        };
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
        return cb();
      })
      .catch((err) => { return cb(err) }
    );
  }

function delta_sync(client, file, cb) {
  console.log(chalk.magenta(`delta sync [${file}]`));

  var json = fs.readFileSync(file, 'utf-8');
  var data = JSON.parse(json);

  client.sync({ nextSyncToken: data.nextSyncToken, resolveLinks: false })
    .then(function(response) {
      console.log('processing changes for [' + file + ']');

      // skip if there are no changes
      if (response.nextSyncToken === data.nextSyncToken) {
        console.log('no changes for [' + file + ']');
        return cb();
      }

      function update_item(item) {
        var ndx = _.findIndex(data.items, (ndx) => { return ndx.sys.id === item.sys.id });
        if (ndx > -1) {
          // replace the existing entry
          data.items[ndx] = item;
        } else {
          // otherwise add the new entry
          data.items.push(item);
        }
      }

      function remove_item(item) {
        var ndx = _.findIndex(data.items, (ndx) => { return ndx.sys.id === item.sys.id });
        if (ndx < 0) return;
        data.items.splice(ndx, 1);
      }

      console.log('writing changes for [' + file + ']');

      response.entries.forEach(update_item);
      response.assets.forEach(update_item);
      response.deletedEntries.forEach(remove_item);
      response.deletedAssets.forEach(remove_item);

      data['nextSyncToken'] = response.nextSyncToken;
      var stringifiedResponse = JSON.stringify(data, null, 2);
      fs.writeFileSync(file, stringifiedResponse, 'utf-8');
      return cb();
    })
    .catch((err) => { return cb(err) }
  );
}

module.exports = function(db) {
  var module = {};

  /**
   * data sync. will do an initial sync of fresh data or a delta sync if the data is locally cached
   * @func
   * @name sync
   * @returns {Promise}
   * @example
   * db.sync()
   *   .then(() => {
   *     done();
   *   })
   *  .catch((err) => {
   *    throw err;
   *    done();
   *  });
   */
  module.sync = function() {
    var sync_tasks = {};

    _.forEach(spaces, (value, language) => {
      sync_tasks[language] = function(cb) {
        let client = contentful.createClient({
          space: spaces[language].space_id,
          accessToken: spaces[language].access_token
        });
        console.log(chalk.blue.inverse(`[ ${language} ]`), chalk.blue('syncing data'));
        let file = make_file_name(language);
        if (fs.existsSync(file)) {
          delta_sync(client, file, cb);
        } else {
          initial_sync(client, file, cb);
        }
      }
    });

    return new Promise(function(resolve, reject) {
      async.series(sync_tasks, function(err, results) {
        if(err) {
          console.log(err);
          reject(Error(err));
        } else {
          resolve('ok');
        }
      });
    });
  };

  /**
   * data sync. will do an initial sync of fresh data or a delta sync if the data is locally cached
   * @func
   * @name sync_for
   * @param {string} [language] - 2 letter code, must be present in spaces.json
   * @returns {Promise}
   * @example
   * db.sync('en')
   *   .then(() => {
   *     done();
   *   })
   *  .catch((err) => {
   *    throw err;
   *    done();
   *  });
   */
  module.sync_for = function(language) {
    var sync_tasks = {};

    sync_tasks[language] = function(cb) {
      let client = contentful.createClient({
        space: spaces[language].space_id,
        accessToken: spaces[language].access_token
      });
      console.log(chalk.blue.inverse(`[ ${language} ]`), chalk.blue('syncing data'));
      let file = make_file_name(language);
      if (fs.existsSync(file)) {
        delta_sync(client, file, cb);
      } else {
        initial_sync(client, file, cb);
      }
    }

    return new Promise(function(resolve, reject) {
      async.series(sync_tasks, function(err, results) {
        if(err) {
          console.log(err);
          reject(Error(err));
        } else {
          resolve('ok');
        }
      });
    });
  };

  /**
   * explicitly loads a localized database from disc or memory if cached. queries will do this implicity
   * @func
   * @name load
   * @param {string} [language] - 2 letter code, must be present in spaces.json
   * @returns {database}
   * @example
   * _.forEach(db.languages(), (language) => {
   *   let localized_db = db.load(language);
   *   console.log('\t', `[ ${language} ]`, localized_db.items.length, 'items');
   * });
   */
  module.load = function(language) {
    // map the contentful item to our format
    function map_contentful_item(item) {
      // remove the language code
      var fields = _.mapValues(item.fields, (field) => { return field[language]; });

      // create a flattened object by removing the fields and sys nesting
      // add a id and contentType to the root of the object
      return _.assign(fields, {id: item.sys.id, contentType: item.sys.type === 'Entry' ? item.sys.contentType.sys.id : 'asset', updatedAt: new Date(item.sys.updatedAt)});
    }

    // load from the filesystem if not cached in memory
    if (!db.localized_databases[language]) {
      let file = make_file_name(language);
      let json = fs.readFileSync(file, 'utf-8');
      let data = JSON.parse(json);

      // transform the data
      let items = [];
      let items_by_id = {};

      items = data.items.map(map_contentful_item);

      // create an object that keys data the items by id
      items_by_id = _.keyBy(items, (item) => { return item.id });

      // loop over every item, then every field on the item
      // if that field is a link, then replace it with the real object
      // if it's an array, do it for each item in the array
      function get_link (field) {
        var link = items_by_id[field.sys.id];
        return link || field; // default to the field if the link was not found
      }

      _.each(items, (item) => {
        _.each(item, (field, field_key) => {
          if (Array.isArray(field) && _.get(field[0], 'sys.type') === 'Link') {
            item[field_key] = _.map(field, get_link);
          } else if (_.get(field, 'sys.type') === 'Link') {
            item[field_key] = get_link(field);
          }
        });
      });

      let localized_db = {
        items: items,
        itemsById: items_by_id
      };

      db.localized_databases[language] = localized_db;
    }

    return db.localized_databases[language];
  };

  return module;
};
