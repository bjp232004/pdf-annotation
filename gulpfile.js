var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprity = require('sprity');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel = require('gulp-babel');

// generate sprite.png and _sprite.scss 
gulp.task('sprites', function () {
    return sprity.src({
        src: './src/images/**/*.{png,jpg}',
        style: './sprite.css',
    })
        .pipe(gulpif('*.png', gulp.dest('./dist/images/'), gulp.dest('./dist/css/')))
});

gulp.task('compress', function (cb) {
    gulp.src('pdf-annotation.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['sprites', 'compress']);