'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const hb = require('gulp-hb');
const rename = require('gulp-rename');
const _ = require('lodash');
const service = 'reports';

module.exports = function(language, db) {
  gutil.log(`${service}`);
  render_asset_report(language, db);
  render_series_reports(language, db);
};

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

function render_series_reports(language, db) {
  gutil.log(gutil.colors.cyan('render_series_reports'));
  var all_series = db.get_all_series(language);
  var grand_total_duration = 0;
  var syndicatable_total_duration = 0;
  // series
  _.each(all_series, (series) => {
    // console.log(series.slug);
    series['episodes'] = db.get_published_landscape_videos_for_series(language, series.id);
    series['episodesCount'] = series['episodes'].length;

    let totalDuration = 0;
    _.each(series['episodes'], (episode) => {
      // console.log('\t', episode.slug);
      totalDuration += episode.landscapeAsset.duration;
      episode['durationHMS'] = msToHMS(episode.landscapeAsset.duration);
    });
    series['durationHMS'] = msToHMS(totalDuration);
    // console.log(`totals episodes: ${series.episodesCount} duration: ${series.durationHMS}`);
    // render index.html
    let data = { language: language, series: series };
    grand_total_duration += totalDuration;

    if (series.availableForSyndication) {
      syndicatable_total_duration += totalDuration;
    }
    gulp
      .src('./src/templates/reports/series_report.hbs')
      .pipe(hb().data(data))
      .pipe(rename(series.slug + '_series_report.html'))
      .pipe(gulp.dest('./public/' + language + '/reports/'));
  }); 
  // render index.html
  var data = { 
    language: language, 
    series: all_series,
    grandTotalDurationHMS: msToHMS(grand_total_duration),
    syndicatableTotalDurationHMS: msToHMS(syndicatable_total_duration)
  };
  gulp
    .src('./src/templates/reports/series_report_index.hbs')
    .pipe(hb().data(data))
    .pipe(rename('series_report_index.html'))
    .pipe(gulp.dest('./public/' + language + '/reports/'));
}

//
// missing assets report
//

function make_missing_entry(owner, desc) {
  return {
    owner: owner,
    desc: desc
  };
}

function find_missing_series_assets_for(series) {
  // gutil.log(series.slug, series.id);
  var found = [];
  // 1x1 thumbnail
  if (series.squareThumbnailImageTitled && series.squareThumbnailImageTitled.file) {
    series['1x1thumbnail'] = 'https:' + series.squareThumbnailImageTitled.file.url;
  } else {
    gutil.log(gutil.colors.magenta('series missing square thumbnail'), series.slug, series.id);
    found.push(make_missing_entry(series, 'series missing square thumbnail'));
  }
  // 16x9 thumbnail
  if (series.landscapeThumbnailImageTitled && series.landscapeThumbnailImageTitled.file) {
    series['16x9thumbnail'] = 'https:' + series.landscapeThumbnailImageTitled.file.url;
  } else if (series.maxThumbnailImage && series.maxThumbnailImage.file) {
    series['16x9thumbnail'] = 'https:' + series.maxThumbnailImage.file.url;
  } else {
    gutil.log(gutil.colors.magenta('series missing landscape thumbnail'), series.slug, series.id);
    found.push(make_missing_entry(series, 'series missing landscape thumbnail'));
  }
  // showcase image
  if (series.appleSpotlightImage && series.appleSpotlightImage.file) {
    series['showcaseImage'] = 'https:' + series.appleSpotlightImage.file.url;
  } else {
    gutil.log(gutil.colors.magenta('series missing apple showcase image'), series.slug, series.id);
    found.push(make_missing_entry(series, 'series missing apple showcase image'));
  }
  // hero image
  if (series.appleHeroImage && series.appleHeroImage.file) {
    series['heroImage'] = 'https:' + series.appleHeroImage.file.url;
  } else {
    gutil.log(gutil.colors.magenta('series missing apple hero image'), series.slug, series.id);
    found.push(make_missing_entry(series, 'series missing apple hero image'));
  }
  return found;
}

function find_missing_video_assets_for(video) {
  // gutil.log(video.slug, video.id);
  var found = [];
  // video asset
  if (video.landscapeAsset && video.landscapeAsset.awsPlaylists) {
    video['media'] = video.landscapeAsset.awsPlaylists[0].src;
  } else {
    gutil.log(gutil.colors.magenta('video missing landscape asset'), video.slug, video.id);
    found.push(make_missing_entry(video, 'video missing landscape asset'));
  }
  // 16x9 thumbnail (NOTE: these fields are BACKWARDS in Contentful)
  if (video.landscapeThumbnail && video.landscapeThumbnail.file) {
    video['16x9thumbnail'] = 'https:' + video.landscapeThumbnail.file.url;        
  } else if (video.landscapeThumbnailClean && video.landscapeThumbnailClean.file) {
      video['16x9thumbnail'] = 'https:' + video.landscapeThumbnailClean.file.url;
  } else {
    gutil.log(gutil.colors.magenta('video missing landscape thumbnail'), video.slug, video.id);
    found.push(make_missing_entry(video, 'video missing landscape thumbnail'));
  }
  return found;
};

function render_asset_report(language, db) {
  gutil.log(gutil.colors.cyan('render_series_asset_report'));
  var series = db.get_all_series(language);
  var series_missing_assets = [];
  var videos_missing_assets = [];
  // series
  _.each(series, (entry) => {
    let found = find_missing_series_assets_for(entry);
    if (found.length > 0) { 
      series_missing_assets.push(entry); 
      entry.report = [];
    }
    _.each(found, (report) => {
      entry.report.push(report);
    });    
  });
  // landscape videos
  var videos = db.get_published_landscape_videos(language);
  _.each(videos, (video) => {
    let found = find_missing_video_assets_for(video);
    if (found.length > 0) { 
      videos_missing_assets.push(video); 
      video.report = [];
    }
    _.each(found, (report) => {
      video.report.push(report);
    });
  });
  // data for handlebars
  var data = { 
    language: language,
    series: series_missing_assets,
    videos: videos_missing_assets,
  };
  // render output
  gulp
    .src('./src/templates/reports/asset_report.hbs')
    .pipe(hb()
      .data(data)
    )
    .pipe(rename('asset_report.html'))
    .pipe(gulp.dest('./public/' + language + '/reports/'));
}
