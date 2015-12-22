var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require("gulp-sourcemaps");
var watch = require('gulp-watch');
var batch = require('gulp-batch');

gulp.task('default', function () {
  watch('api/es6-controllers/*.js', batch(function (events, done) {
    gulp.start('compile', done);
  }));
});

gulp.task('compile', function () {
  gulp.src([ 'api/es6-controllers/**' ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest('api/controllers/'));
});


