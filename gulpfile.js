var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprity = require('sprity');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel = require('gulp-babel');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

// generate sprite.png and _sprite.scss 
gulp.task('sprites', function () {
    return sprity.src({
        src: './src/images/**/*.{png,jpg}'
    })
        .pipe(gulpif('*.png', gulp.dest('./dist/images/')))
});

gulp.task('compress', function (cb) {
    gulp.src('pdf-annotation.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    
});

gulp.task('compresscss', function (cb) {
    
    gulp.src('src/**/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/'));
});


gulp.task('default', ['sprites', 'compress', 'compresscss']);