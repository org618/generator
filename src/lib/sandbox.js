'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const hb = require('gulp-hb');
const rename = require('gulp-rename');
const _ = require('lodash');
const service = 'sandbox';

// series.availableForSyndication
// series.xxxPublishDate
// video.xxxPublishDate

// simulate contentful data
var schedule = [
  {
    contentType: 'series',
    slug: 'alice-in-paris',
    syndicationPublishDates: {
      leecoPublishDate: '2015-08-27',
    }
  }
];

module.exports = function(language, db) {
  gutil.log(`${service}`);
  syndication_series(language, db);
};

function syndication_series(language, db) {
  var total_episode_count = 0;
  var all_series = db.get_all_series(language);
  all_series = _.cloneDeep(all_series);

  _.each(all_series, (series) => {
    if (series.availableForSyndication === true) {
      series.episodes = db.get_published_landscape_videos_for_series(language, series.id);
      total_episode_count += series.episodes.length;
      gutil.log(`${series.slug} : ${series.episodes.length} episodes avail`);

      console.log('\t',`Tastemade publishDate ${series.publishDate}`);

      var found = _.find(schedule, {  contentType: 'series', slug: series.slug });
      if (found) {
        console.log('\t',`LeEco publishDate ${found.syndicationPublishDates.leecoPublishDate}`);
      }

      _.each(series.episodes, (episode) => {
        episode = db.transform_video(episode);
        episode.publishedYear = db.get_year_from_date(episode.publishDate);
      });
    }
  });
  
  gutil.log(`total episodes: ${total_episode_count}`);
}