var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require("gulp-sourcemaps");

gulp.task('default', function () {
  gulp.src([ 'api/es6-controllers/**' ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest('api/controllers/'));
});
