'use strict'

const assert = require('assert');
const _ = require('lodash');
const db = require('../index.js');

// npm test -- -t en
// npm test -- -g en
// var argv = process.argv;
// console.log(argv);
// console.log(argv[4]);

function trace_item(item) {
  // console.log('\t', `${item.id} ${item.slug}`);
}

describe('data', function() {
  this.timeout(0);
  // describe('#sync()', function() {
  //   it('should sync all data', (done) => {
  //     db.sync()
  //       .then(() => {
  //         done();
  //       })
  //       .catch((err) =>  {
  //         throw err;
  //         done();
  //       });
  //   });
  // });
  // describe('#sync_for()', function() {
  //   it('should sync all data for a language', (done) => {
  //     db.sync_for('en')
  //       .then(() => {
  //         done();
  //       })
  //       .catch((err) =>  {
  //         throw err;
  //         done();
  //       });
  //   });
  // });
  // describe('#load()', function() {
  //   it('should load localized databases', () => {
  //     _.each(db.languages(), (language) => {
  //       let localized_db = db.load(language);
  //       console.log('\t', `[ ${language} ]`, localized_db.items.length, 'items');
  //     });
  //   });
  // });
});

describe('info', function() {
  this.timeout(0);
  describe('#languages()', function() {
    it('should return languages', function() {
      let result = db.languages();
      console.log('\t', result);
      assert.deepEqual(result, [ 'de', 'en', 'en-UK', 'es', 'fr', 'id', 'jp', 'pt' ]);
    });
  });
  describe('#databases()', function() {
    it('should return info for all databases', function() {
      var result = db.databases();
      console.log('\t', result);
    });
  });
});

describe('queries', function() {
  this.timeout(0);
  describe('#get_all_series()', function() {
    it('should get all series', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_all_series(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_series()', function() {
    it('should get all published series', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_series(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_all_classes()', function() {
    it('should get all classes', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_all_classes(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_classes()', function() {
    it('should get all published classes', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_classes(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_all_authors()', function() {
    it('should get all authors', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_all_authors(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_authors()', function() {
    it('should get all published authors', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_authors(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
 describe('#get_all_articles()', function() {
    it('should get all articles', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_all_articles(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_articles()', function() {
    it('should get all published articles', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_articles(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
});

describe('video queries', function() {
  this.timeout(0);
  describe('#get_published_lessons_for_class()', function() {
    it('should get published lessons for a class', function() {
      _.each(db.languages(), (language) => {
        // en only test, Beehive Cake
        if (language === 'en') {
          let result = db.get_published_lessons_for_class(language, '2gsDk9DDlaAUEykmeuyUS');
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
  describe('#get_all_landscape_videos()', function() {
    it('should get all landscape videos', function() {
      _.each(db.languages(), (language) => {
        // skip de
        if (language !== 'de') {
          let result = db.get_all_landscape_videos(language);
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
  describe('#get_published_landscape_videos()', function() {
    it('should get all published landscape videos', function() {
      _.each(db.languages(), (language) => {
        // skip de
        if (language !== 'de') {
          let result = db.get_published_landscape_videos(language);
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
  describe('#get_published_landscape_videos_for_series()', function() {
    it('should get all published landscape videos for a series', function() {
      _.each(db.languages(), (language) => {
        // en only test, Heritage
        if (language === 'en') {
          let result = db.get_published_landscape_videos_for_series(language, '36X5lcjW2kWMG6iMim80ko');
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
  describe('#get_published_landscape_videos_for_author()', function() {
    it('should get all published landscape videos for an author', function() {
      _.each(db.languages(), (language) => {
        // en only test, Julie Nolke
        if (language === 'en') {
          let result = db.get_published_landscape_videos_for_author(language, '1PTMbRHWqYgcKUCYEacmWi');
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
});

describe('tv queries', function() {
  this.timeout(0);
  describe('#get_current_tv_edition()', function() {
    it('should get the current TV edition', function() {
      _.each(db.languages(), (language) => {
        // skip
        if ((language !== 'de') && (language !== 'fr') && (language !== 'jp')) {
          let result = db.get_current_tv_edition(language);
          console.log('\t', `[ ${language} ]`, result.title);
        }
      });
    });
  });
  describe('#get_current_tv_nav()', function() {
    it('should get the current TV nav', function() {
      _.each(db.languages(), (language) => {
        // skip
        if ((language !== 'de') && (language !== 'fr') && (language !== 'jp')) {
          let result = db.get_current_tv_nav(language);
          console.log('\t', `[ ${language} ]`);
          console.log('\t', `[ ${language} ]`, result.title);
        }
      });
    });
  });
});

describe('spotify queries', function() {
  describe('#get_published_spotify_series()', function() {
    it('should get all published series for spotify', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_spotify_series(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_spotify_videos()', function() {
    it('should get all published videos for spotify', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_spotify_videos(language);
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
  describe('#get_published_spotify_videos_for_series()', function() {
    it('should get all published video for spotify for a series', function() {
      _.each(db.languages(), (language) => {
        let result = db.get_published_spotify_videos_for_series(language, '5CLLlQKyLSoEEyAIeMoMMK'); // turntable
        console.log('\t', `[ ${language} ]`, result.length, 'items');
        _.map(result, trace_item);
      });
    });
  });
});

describe('ad queries', function() {
  this.timeout(0);
  describe('#get_current_ad_edition()', function() {
    it('should get the current ad edition', function() {
      _.each(db.languages(), (language) => {
        // en only
        if (language === 'en') {
          let result = db.get_current_ad_edition(language);
          console.log('\t', `[ ${language} ]`, result.name);
        }
      });
    });
  });
  describe('#get_ad_unit()', function() {
    it('should get an ad unit', function() {
      _.each(db.languages(), (language) => {
        // en only, test Lamarca Picnic
        if (language === 'en') {
          let result = db.get_by_id(language, '1aZg4ZV5vGg4AsUq4uOYoo');
          console.log('\t', `[ ${language} ]`, result.title);
        }
      });
    });
  });
});

describe('4k queries', function() {
  this.timeout(0);
  describe('#get_all_4k_landscape_videos()', function() {
    it('should get all landscape 4K videos', function() {
      _.each(db.languages(), (language) => {
        // skip de
        if (language !== 'de') {
          let result = db.get_all_4k_landscape_videos(language);
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
  describe('#get_published_4k_landscape_videos()', function() {
    it('should get all published 4K landscape videos', function() {
      _.each(db.languages(), (language) => {
        // skip de
        if (language !== 'de') {
          let result = db.get_published_4k_landscape_videos(language);
          console.log('\t', `[ ${language} ]`, result.length, 'items');
          _.map(result, trace_item);
        }
      });
    });
  });
});
