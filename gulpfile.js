import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true }) //1. style.less найден файл
    .pipe(plumber()) // 2. в файле обрабатываются ошибки
    .pipe(sass().on('error', sass.logError)) // style.sass --> style.css
    .pipe(postcss([ // style.css
      autoprefixer(), // style.css -> превращается в style.css с префиксами
      csso() // style.css[prefix] -> превращается в style.css[prefix, min], т.е минимизируется код, удаляя ненужные символы,знаки и прочее
    ]))
    .pipe(rename('style.min.css')) // переименовать файл в min
    .pipe(gulp.dest('build/css', { sourcemaps: '.' })) // положить его в директорию
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true })) // удаляет пробелы
  .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe (terser())
  .pipe (gulp.dest('build/js'))
}

// images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'))
}

// WebP
const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'))
}

// SVG
const svg = () =>
  gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'))

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
  .pipe(svgo())
  .pipe(svgstore({
    inLineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

// Copy
const copy = (done) => {
  return gulp.src(['source/fonts/**/*.{woff2,woff}',
  'source/*ico',
  'source/*manifest',
  'source/*budget'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return del ('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload()
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch('source/js/script.js', gulp.series(scripts));
}

//Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
