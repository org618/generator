'use strict'

const _ = require('lodash');

module.exports = function(db) {
  var module = {};

  function filter_published(items) {
    var today = new Date().toISOString();
    return _.filter(items, (item) => {
      if (item.publishDate <= today) {
        return item;
      }
    });
  }

  function filter_first_published(items) {
    var today = new Date().toISOString();
    return _.find(items, function(item) {
      if (item.publishDate <= today) {
        return item;
      }
    });
  }

  function filter_landscape(videos) {
    videos = _.filter(videos, (item) => {
      if (item.landscapeAsset) {
        return item;
      }
    });
    return videos;
  }

  function filter_4k_landscape(videos) {
    videos = _.filter(videos, (item) => {
      if (item.landscapeAsset && item.landscape4kAsset) {
        // extra test, just in case
        if (item.landscape4kAsset.aws4kPlaylist) {
          return item;
        }
      }
    });
    return videos;
  }

  /**
   * get an object by id
   * @func
   * @name get_by_id
   * @param {string} [language]
   * @param {string} [id]
   * @returns {object}
   */
  module.get_by_id = function(language, id) {
    var localized_db = db.load(language);
    return localized_db.itemsById[id];
  }

  /**
   * get all items of a specific content type
   * @func
   * @name get_all
   * @param {string} [language]
   * @param {string} [content_type]
   * @returns {array} - sorted by slug ascending
   * @example
   * _.each(db.languages(), (language) => {
   *   let localized_db = db.load(language);
   *   db.get_all('en', 'series');
   * });
   */
   module.get_all = function(language, content_type) {
    var localized_db = db.load(language);
    var items = _.filter(localized_db.items, { contentType: content_type });
    return _.orderBy(items, ['slug'], ['asc']);
  }

  /**
   * get all items of a specific content type where field = val
   * @func
   * @name get_where
   * @param {string} [language]
   * @param {string} [content_type]
   * @param {string} [field]
   * @param {string} [val]
   * @returns {array} - unsorted
   * @example
   * var videos = db.get_all_where(language, 'video', 'series', '5CLLlQKyLSoEEyAIeMoMMK');
   */
  module.get_all_where = function(language, content_type, field, val) {
    var collection = module.get_all(language, content_type);
    return  _.filter(collection, function (entry) {
      if (entry[field] && entry[field].id === val) {
        return entry;
      }
    });
  }

  /**
   * get all published items of a specific content type (uses publishDate)
   * @func
   * @name get_all_published
   * @param {string} [language]
   * @param {string} [content_type]
   * @returns {array} - sorted by slug ascending
   * @example
   * _.each(db.languages(), (language) => {
   *   let localized_db = db.load(language);
   *   db.get_all_published('en', 'series');
   * });
   */
  module.get_published = function(language, content_type) {
    var items = module.get_all(language, content_type);
    return filter_published(items);
  }

  return module;
};
