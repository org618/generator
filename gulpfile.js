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
const nodemon = require('gulp-nodemon');
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
  // return del([
  //   './public/**/*.html',
  //   './public/**/*.rss'
  // ]);
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

function msToHMS(duration) {
  var seconds = duration / 1000;
  var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
  seconds = seconds % 60;
  seconds = Math.round(seconds);
  if (hours < 10) { hours = '0' + hours};
  if (minutes < 10) { minutes = '0' + minutes};
  if (seconds < 10) { seconds = '0' + seconds};
  return hours+':'+minutes+':'+seconds;
}

gulp.task('render', ['clean', 'db:sync'], function () {
  _.each(db.languages(), (language) => {
    // --language was passed. skip this language?
    if (argv['language'] && language !== argv['language']) {
      gutil.log(gutil.colors.magenta('skipping [' + language + ']'));
    } else {
      // let localized_db = db.load(language);
      // console.log('\t', `[ ${language} ]`, localized_db.items.length, 'items');

      let podcasts = db.get_all(language, 'podcast');
      // podcasts[0]['image'] = `https:${podcasts[0].image.file.url}`;
      // console.log(podcasts[0].image.file.url);
      // console.log(podcasts);

      let episodes = db.get_all(language, 'episode');
      // console.log(audios);
      _.each(episodes, (episode) => {
        // console.log(audio.asset.file.url);
        episode['media'] = `https:${episode.asset.file.url}`;
      });

      //console.log('\t', `[ ${language} ]`, podcasts.items.length, 'items');

      // _(['reports','sandbox']).each((item) => {
      //   require(`./src/lib/${item}.js`)(language, db);
      // });

      // render index.html
      var data = {
        podcast: podcasts[0],
        episodes: episodes
      };

      gulp
        .src('./src/templates/index.hbs')
        .pipe(hb()
          .data(data)
        )
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./public/'));

      gulp
        .src('./src/templates/feed.hbs')
        .pipe(hb()
          .data(data)
        )
        .pipe(rename('feed.rss'))
        .pipe(gulp.dest('./public/'));

    }
  });
});

//
// dev only tasks
//

gulp.task('watch', function () {
  gulp.watch([
    './src/lib/**/*.js',
    './src/middleware/**/*.js',
    './src/setup/**/*.js',
    './src/routes/**/*.js',
    './src/templates/**/*.hbs',
    './src/server.js'
  ], [
    // 'jshint'
  ])
    .on('change', function (event) {
      console.log(event.path + ' was ' + event.type);
    });
});

gulp.task('dev', [/*'jshint',*/ 'render', 'watch'], function () {
   nodemon({
    script: './src/server.js',
    ext: 'js, hbs',
    cwd: '.',
    ignore: [
      'node_modules/**'
    ],
    env: {
      'NODE_ENV': 'development'
    },
    watch: [
      '/src/data/**/*',
      '/src/templates/**/*',
      '/src/js/**/*',
      '/src/data/**/*',
      '/src/lib/**/*',
      '/src/middleware/**/*',
      '/src/routes/**/*',
      '/src/setup/**/*',
      '/src/server.js'
    ]
  })
    // .on('change', [
    //   // 'jshint',
    //   'render'
    // ]);
});

gulp.task('build', ['render'], function () {

});
