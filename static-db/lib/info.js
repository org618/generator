'use strict'

const _ = require('lodash');
const spaces = require('../spaces.json');

module.exports = function(db) {
  var module = {};

  /**
   * returns an array of supported 2 letter language codes
   * @func
   * @name languages
   * @returns {array}
   * @example
   * _.each(db.languages(), (language) => {
   *   let localized_db = db.load(language);
   *   console.log('\t', `[ ${language} ]`, localized_db.items.length, 'items');
   * });
   */
  module.languages = function() {
    var result = [];
    _.forEach(spaces, (value, language) => {
      result.push(language);
    });
    return result;
  };

   module.databases = function() {
    var result = [];
    _.forEach(spaces, (value, language) => {
      let db_info = {};
      db_info.language = language;
      // check the status of the localized database      
      if (db.localized_databases[language]) {
        db_info.status = 'cached';
      } else {
        db_info.status = 'not loaded';
      }
      result.push(db_info);
    });
    return result;
  };

  return module;
};
