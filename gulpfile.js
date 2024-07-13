/*
	! Версии для нормальной работы 
    * Gulp 4 - 4.0.2v
	* Node.js - 18.12.1v
	* npm - 8.19.2v
*/

// Подключение модулей(плагинов)
const { src, dest, parallel, series, watch } = require("gulp"),
	concat       = require("gulp-concat"),
 	rename       = require("gulp-rename"),
 	csso         = require("gulp-csso"),
 	imagemin     = require("gulp-imagemin"),
 	autoprefixer = require("gulp-autoprefixer"),
 	sass         = require("gulp-sass")(require('sass')),
 	uglify       = require("gulp-uglify"),
 	del          = require("del"),
	cache        = require("gulp-cache"),
	ftp          = require("vinyl-ftp"),
	gutil        = require('gulp-util');

// Создание модуля 'browser-sync'
const browser    = require("browser-sync").create();


//* Функции для работы с плагинами в 'gulp'

// Отслеживание изменений в 'SASS' файлах и их преобразования в формат 'min.css' 
function styles() {
    return src([
		"app/sass/**/*.sass"
	])
    .pipe(sass({outputStyle: "expanded"}))
    .pipe(csso())
	// .pipe(concat("main.min.css"))
    .pipe(rename(function (e) {
        e.extname = ".min.css";
    }))
    .pipe(autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true
    }))
    .pipe(dest("app/css"))
    .pipe(browser.stream());
}

// Отслеживание изменений в скриптах(JS)
function scripts() {
    return src([
		'app/libs/jquery/jquery.min.js',
		'app/libs/jquery/plugins/mask/jquery.mask.min.js',
        'app/libs/jquery/plugins/jquery-ui-1.13.2/jquery-ui.min.js',
		'app/libs/jquery/plugins/jquery-validation/dist/jquery.validate.js',
		'app/libs/swiper/js/swiper.min.js',
        'app/libs/fancybox/fancybox.min.js',
		'app/js/common.js',
	])
    .pipe(concat("scripts.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browser.reload({stream: true}));
}

// Сжатие и кэширование изображений
function images() {
    return src("app/img/**/*")
    .pipe(cache(imagemin()))
    .pipe(dest("dist/img/"));
}

// Удаление всех элементов в папке dist/
function cleanDist() {
    return del("dist");
}

// Инициализация и настройка параметров модуля browserSync
function browserSync() {
    browser.init({
        server: {
            baseDir: "app"
        },
		notify: false,
    })
}

// Отслеживание изменений в файлах и папках(вложенных)
function watching() {
    watch("app/sass/**/*.sass", styles);
    watch(["app/libs/**/*.js", "app/js/common.js"], scripts).on("change", browser.reload);
    watch("app/*.html").on("change", browser.reload);
}

// Сборка всех элементов для работы приложения в папку
function build() {
    return src([
        'app/js/scripts.min.js',
		'app/css/main.min.css',
        'app/*.html',
        'app/fonts/**/*',
    ], {base: 'app'})
    .pipe(dest("dist/"));
}

// Задачи gulp
exports.build = series( cleanDist, images, build );
exports.default = parallel( styles, scripts, browserSync, watching );
exports.clearCache = () => {return cache.clearAll()};