'use strict';

const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const hb = require('gulp-hb');
const layouts = require('handlebars-layouts');
const helpers = require('handlebars-helpers');
const concat = require('gulp-concat');
const argv = require('yargs').alias('l', 'language').alias('x', 'exclude').argv;
const _ = require('lodash');
const del = require('del');
const db = require('./static-db');

//
// set up & config
//

const env = process.env.NODE_ENV || 'development';

//
// tasks
//

gulp.task('clean', function () {
  return del([
    './public/**/*'
  ]);
});

// get most recent data
gulp.task('db:sync', function (cb) {
  // --exclude was passed
  if (argv['exclude']) {
    gutil.log(gutil.colors.magenta('excluding db sync'));
    return cb();
  }

  db.sync()
    .then(function() {
      return cb();
    })
    .catch(function(err)  {
      console.log(err);
      return cb();
    }
  );
});

gulp.task('render', ['clean', 'db:sync'], function () {
  _.each(db.languages(), (language) => {
    // --language was passed. skip this language?
    if (argv['language'] && language !== argv['language']) {
      gutil.log(gutil.colors.magenta('skipping [' + language + ']'));
    } else {
      // let localized_db = db.load(language);
      // console.log('\t', `[ ${language} ]`, localized_db.items.length, 'items');

      let podcasts = db.get_all(language, 'podcast');
      // console.log(podcasts[0].image.file.url);
      // console.log(podcasts);

      let audios = db.get_all(language, 'audio');
      // console.log(audios);
      _.each(audios, (audio) => {
        // console.log(audio.asset.file.url);
        audio['media'] = `https:${audio.asset.file.url}`;

        console.log(audio.media);
      });

      //console.log('\t', `[ ${language} ]`, podcasts.items.length, 'items');

      // _(['reports','sandbox']).each((item) => {
      //   require(`./src/lib/${item}.js`)(language, db);
      // });

      // render index.html
      var data = {
        podcast: podcasts[0],
        audios: audios
      };

      gulp
        .src('./src/templates/index.hbs')
        .pipe(hb()
          .data(data)
        )
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./public/'))

        gulp
          .src('./src/templates/feed.hbs')
          .pipe(hb()
            .data(data)
          )
          .pipe(rename('feed.rss'))
          .pipe(gulp.dest('./public/'))

    }
  });
});

gulp.task('build', ['render'], function () {

});
