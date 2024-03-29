import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import browserify from 'gulp-browserify';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-dart-sass';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import ejs from 'gulp-ejs';
import rename from'gulp-rename';
import clean from 'gulp-clean';

const server = browserSync.create();

const paths = {
  distDir: './dist/',
  srcImages: 'src/images/**/*.{jpg,jpeg,png,svg,ico}',
  distImages: 'dist/images/',
  srcFonts: 'src/fonts/**/*',
  distFonts: 'dist/fonts/',
  srcScripts: 'src/javascripts/app.js',
  distScripts: 'dist/javascripts/',
  srcStyles: 'src/stylesheets/**/*.scss',
  distStyles: 'dist/stylesheets/',
  srcHtml: 'src/**/*.ejs',
  distHtml: 'dist/',
};

let notifyOnError = function(err) {
  notify.onError({
    title: 'Itou',
    subtitle: 'Error!',
    message: '<%= error.message %>'
  })(err);
  this.emit('end');
};

// Styles Task
export function styles() {
  return gulp
    .src(paths.srcStyles)
    .pipe(
      plumber({
        errorHandler: notifyOnError,
      }),
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distStyles));
}

// Purge Styles Task
export function purgestyles() {
  return (
    gulp
      .src(paths.srcStyles)
      .pipe(
        plumber({
          errorHandler: notifyOnError,
        }),
      )
      .pipe(sass())
      .pipe(cleanCSS())
      .pipe(gulp.dest(paths.distStyles))
  );
}

// Compress Images Task
export function images() {
  return gulp.src(paths.srcImages, {
    since: gulp.lastRun(images)
  })
    .pipe(plumber({
      errorHandler: notifyOnError
    }))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: true}
        ]
      })
    ]))
    .pipe(gulp.dest(paths.distImages));
}

// Copy the CNAME file for configuring a subdomain in GitHub
export function cname() {
  return gulp.src('CNAME')
    .pipe(gulp.dest(paths.distHtml));
}

// Copy the Scripts files
export function scripts() {
  return gulp.src(paths.srcScripts)
    .pipe(gulp.dest(paths.distScripts));
}

// Copy the Font files
export function fonts() {
  return gulp.src(paths.srcFonts)
    .pipe(gulp.dest(paths.distFonts));
}

// Templates to HTML Task
export function html() {
  return gulp.src(paths.srcHtml)
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(paths.distHtml));
}

// Clean dist directory
export function cleandist() {
  return gulp.src(paths.distDir + '*')
  .pipe(clean({force: true}));
}

// BrowserSync Reload Task
function reload(done) {
  server.reload();
  done();
}

// BrowserSync Serve Task
export function serve(done) {
  server.init({
    server: {
      baseDir: paths.distDir
    },
    open: false,
    notify: false,
    injectChanges: true,
    reloadDebounce: 1000
  });
  done();
}

// Import Images from Itou Theme
export function importItouThemeImages() {
  return gulp.src('./node_modules/itoutheme/src/images/**/*.{jpg,jpeg,png,svg,ico}')
    .pipe(gulp.dest('src/images/'));
}

// Import Fonts from Itou Theme
export function importItouThemeFonts() {
  return gulp.src('./node_modules/itoutheme/src/fonts/**/*')
    .pipe(gulp.dest('src/fonts/'));
}

// Import Script from Itou Theme
export function importItouThemeScripts() {
  return gulp.src('./node_modules/itoutheme/dist/javascripts/**/*')
    .pipe(gulp.dest('src/javascripts/'));
}

// Watch Task
function watch() {
  gulp.watch(paths.srcHtml, gulp.series(html, reload));
  gulp.watch(paths.srcStyles, gulp.series(styles, reload));
  gulp.watch(paths.srcImages, gulp.series(images, reload));
}

const dev = gulp.series(cleandist, html, cname, styles, scripts, images, fonts, serve, watch);
gulp.task('dev', dev);

const build = gulp.series(cleandist, html, cname, purgestyles, scripts, images, fonts);
gulp.task('build', build);

export default dev;
