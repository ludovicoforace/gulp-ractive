'use strict';
const fs = require('fs');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const gulp = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');
const ractiveify = require('ractiveify');
ractiveify.extensions.push('ractive');

let appStatus;
let watchRunning;

function buildBundle(inputfile, outputfile) {
  const settings = {
    basedir: '.',
    debug: true,
    entries: inputfile,
    cache: {},
    packageCache: {}
  };
  return function () {
    if (!fs.existsSync('./dist')) {
      fs.mkdir('./dist', function () { });
    }
    if (appStatus === 'watching') {
      var bundler = watchify(browserify(settings));
    } else {
      var bundler = browserify(settings);
    }
    bundler = bundler
      .transform(babelify.configure({ presets: ['env'] }))
      .transform(ractiveify);

    function bundle() {
      if (appStatus === 'building') {
        return bundler
          .bundle()
          .pipe(source(outputfile))
          .pipe(buffer())
          .pipe(uglify())
          .pipe(gulp.dest('./dist'));
      } else {
        return bundler
          .bundle()
          .pipe(source(outputfile))
          .pipe(gulp.dest('./dist'));
      }
    }

    if (appStatus === 'watching') {
      bundler.on('update', bundle);
    }
    return bundle();
  };
}

gulp.task('compile-less', function () {
  const autoprefix = autoprefixer(
    {
      browsers: ['last 99 versions'],
      cascade: false
    }
  );
  var bundler = gulp
    .src(['./node_modules/sash-layout/**/*.css', './src/less/**/*.less'])
    .pipe(less({
      paths: ['.', './src/less']
    }));

  if (appStatus === 'building') {
    bundler = bundler
      .pipe(autoprefix)
      .pipe(csso());
  } else {
    bundler = bundler
      .pipe(autoprefix);
  }
  return bundler
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-static', function () {
  let bundler;
  const destination = gulp.dest('./dist');

  if (watchRunning) {
    bundler = gulp
      .src('./src/index.html');
  } else {
    bundler = gulp
      .src([
        './src/img/*.png',
        './src/img/*.jpg',
        './src/img/*.gif',
        './src/img/*.ico',
        './src/data/*.json',
        './src/data/*.js',
        './src/other/*.*',
        './src/index.html'
      ]);
  }

  if (appStatus === 'building') {
    return bundler
      .pipe(imagemin())
      .pipe(destination);
  } else {
    return bundler
      .pipe(destination);
  }
});


gulp.task('clean', function (cb) {
  return del(['./dist'], cb);
});

gulp.task('bundle', buildBundle('./src/main.js', 'main.js'));

gulp.task('default', function (cb) {
  if (appStatus === 'building') {
    runSequence('clean', ['bundle', 'compile-less', 'copy-static'], cb);
  } else {
    runSequence(['bundle', 'compile-less', 'copy-static'], cb);
  }
});

gulp.task('sync-browser', ['default'], function () {
  browserSync.init(['./dist/**'], {
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('build', function (cb) {
  appStatus = 'building';
  runSequence('default', cb);
});

gulp.task('watch', function (cb) {
  appStatus = 'watching';
  runSequence('sync-browser', function () {
    watchRunning = true;
    gulp.watch('./src/**/*.html', ['copy-static']);
    gulp.watch('./src/**/*.less', ['compile-less']);
    cb();
  });
});
