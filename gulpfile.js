var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require('gulp-uglify'); //混淆库
const htmlmin = require('gulp-htmlmin'); //html压缩
const cache = require('gulp-cached'); //用于复制文件时只复制修改过的
var concat = require('gulp-concat'); //合并Js

const rev = require('gulp-rev'), //生成文件hash
    revCollector = require('gulp-rev-collector'), //原始路径替换成hash地址
    fileInclude = require('gulp-file-include'); //界面模板功能

const postcss = require('gulp-postcss'), //css兼容适配
    autoprefixer = require('autoprefixer'); //css补前缀

var connect = require('gulp-connect'); //测试环境

var del = require('del'); //删除文件



//测试环境
gulp.task('server', gulp.parallel(function () {
    return connect.server({
        root: 'dist/',
        // root: 'release/',
        host: '192.168.1.42',
        // livereload: true,
        port: 2240,
    });
}));


//postcss css 自助补全
gulp.task('postcss', gulp.series(function () {
    return gulp.src('./app/view_css/*.css')
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'], //http://www.ydcss.com/archives/94
            cascade: false, //是否美化属性值 默认：true 像这样：
        })]))
        .pipe(gulp.dest('dist/view_css/'));
}));

//模板处理
gulp.task('file-include', gulp.parallel(function () {
    return gulp.src(['./app/view/*.html']) //从app/view 目录
        .pipe(fileInclude({
            prefix: '@', //变量前缀 @include
            basepath: './dist/view_css/', //引用文件路径
            indent: true //保留文件的缩进
        }))
        .pipe(gulp.dest('./dist/view/')); //输出文件路径
}));

//复制图片
gulp.task('copy-img', gulp.parallel(function () {
    return del(['dist/res/**/*']).then(function () { //先删除 删除是异步的，会导致一些编译顺序问题，后续需要调整下
        return gulp.src('./app/res/**/*')
            .pipe(gulp.dest('./dist/res'));
    });
}));


//复制html=>目前只需要复制首页就可以了
gulp.task("copy-html", gulp.parallel(function () {
    // return gulp.src('app/**/*.html')
    return gulp.src('app/*.html')
        .pipe(cache('copy-html')) //只对修改的文件进行复制
        .pipe(gulp.dest("dist"));
}));


//定义看守任务
gulp.task('watch', gulp.parallel(function () {
    gulp.watch('app/*.html', gulp.parallel('copy-html')); //监听首页html
    gulp.watch(['app/*.ts', 'app/**/*.ts'], gulp.series('build-ts', "concat-js")); //监听ts
    gulp.watch('app/style/*.css', gulp.parallel('concat-css')); //监听css
    gulp.watch('app/res/**/*', gulp.series('copy-img')); //监听图片
    gulp.watch(['app/view_css/*.css', 'app/view/*.html'], gulp.series("postcss", "file-include")); //监听库修改
    // gulp.watch('libs/*.js', ['concat-js']);//监听库修改
}));

//编译ts
gulp.task("build-ts", gulp.parallel(function () {
    return browserify({
        // basedir: '.',
        debug: true,
        entries: ['app/Main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
}));

//合并js 
gulp.task("concat-js", gulp.parallel(function () {
    return gulp.src(['libs/zepto.min.js', 'libs/fx.js', 'libs/lazyload.min.js', 'libs/Tween.min.js'])//, 'libs/*.js'
        .pipe(concat('library.js'))
        .pipe(gulp.dest("dist"));
}));

//复制scr目录下的js
gulp.task('copy-js', gulp.parallel(function () {
    return del(['dist/src/*']).then(function () { //先删除 删除是异步的，会导致一些编译顺序问题，后续需要调整下
        return gulp.src('src/*.js')
            .pipe(gulp.dest("dist/src"));
    });
}));

//合并css =>仅合并 style 目录下的
gulp.task("concat-css", gulp.parallel(function () {
    return gulp.src([
        'app/style/normalize.css',
        'app/style/common.css',
        'app/style/*.css'
    ])
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'], //http://www.ydcss.com/archives/94
            cascade: false, //是否美化属性值 默认：true 像这样：
        })]))
        .pipe(gulp.dest('dist/style'));
}));


gulp.task("default", gulp.series("build-ts", "postcss", gulp.parallel( // "revImage", "revHtmlCss"
    [
        "server",
        "concat-js",
        "copy-html",
        "watch",
        "concat-css",
        "file-include",
        "copy-js",
        "copy-img"
    ]), function () {
        console.log(23232)
    }));
// gulp.task("default", gulp.series(),gulp.parallel(['concat-js']));

// 在上面代码开发中的时候，不执行版本管理，所以不做hash处理
//===================== 发布release  => 2018-11-14 16.50 上面dev版本有修改  下面release需要重新整理
// 这里要分步骤发布版本 先把所有的图片都生成hash名称 revImage   然后会生成对应的json文件  然后通过revHtmlCss这个方法替换所有的对应名称
// 然后再走正常的发布流程  gulp还不是特别熟悉，暂时多两步操作


//release 发布流程
/**
 *  =========== 资源和css组合发布流程 ============
 *  1,图片资源全部添加hash，【从app目录导出】 ==> revImage
 *  2,压缩css 【从dist导出】 ==> minCss
 *  3,替换css里面原始的资源路径为带Hash的地址, 【从release目录导出】，并压缩css ==> revHtmlCss
 *  4,把css和html组合合并到一起【从dist目录导出】 ==> include-release
 * 
 *  =========== ts发布 重新导出 并混淆 ============
 *  1, 从app目录把最新的ts编译成js ==> build-ts-release
 *  2, 混淆js 目前只需要 混淆bundle.js ==> minJs
 *  
 *  =========== 其它流程操作 ============
 *  1,复制首页到release ==> minHtml
 *  2,复制第三方库[不预加载的库] ==> copy-js-release
 *  3,合并第三方库 需要用到的库 前期需要先加载 ==> concat-js-release
 * 
 * 发布命令 ==> gulp release 
 * 
 * 需要注意的，如果是刚拉下来的新的css需要先gulp一下发布到开发版本中，然后再release
 * 
 */




//将所有的图片名称hash
gulp.task('revImage', gulp.series(function () { //=> 这两个功能在发布线上版本的时候再用，现在好像有问题
    // return del(['release/res/*']).then(function () {//先删除 todo  这里删除文件异步的时候 会有问题
    return gulp.src(['./app/**/*.png', './app/**/*.jpg', '!./app/res/other/*'])
        .pipe(rev()) //文件名称生成hash
        .pipe(gulp.dest('release/'))
        .pipe(rev.manifest(['../sd/'])) //必须有这个方法=>生成对应的rev-manifest.json用来映射路径
        .pipe(gulp.dest('release/'));
    // });
}));

//目前暂时所有的图片都写在css文件里面，所以这里只需要替换对应的css文件即可 => 这两个功能在发布线上版本的时候再用，现在好像有问题
gulp.task('revHtmlCss', gulp.series(function () {
    return gulp.src(['./release/**/*.json', 'release/**/*.css'])
        .pipe(revCollector({
            // replaceReved: true
        })) //rev-manifest.json 文件中的对应替换到css里
        .pipe(gulp.dest('release/'))//输出到该文件夹中
}));

//css压缩  
gulp.task('minCss', gulp.series(function () {

    const postcss = require('gulp-postcss'), //css兼容适配
        autoprefixer = require('autoprefixer'),
        cssMin = require('gulp-minify-css'); //压缩

    return gulp.src('dist/**/*.css')
        .pipe(postcss([autoprefixer()]))
        .pipe(cssMin())
        .pipe(gulp.dest('release/'))//输出到该文件夹中
}))

//css和html 组合 到一起
gulp.task('include-release', gulp.series(function () {
    return gulp.src(['./app/view/*.html']) //从app/view 目录
        .pipe(fileInclude({
            prefix: '@', //变量前缀 @include
            basepath: './release/view_css/', //引用文件路径
            indent: true //保留文件的缩进
        }))
        .pipe(htmlmin({//压缩html
            removeComments: true,//清除HTML注释
            collapseWhitespace: true//压缩HTML
        }))
        .pipe(gulp.dest('./release/view/')); //输出文件路径
}))


//压缩首页
gulp.task('minHtml', gulp.parallel(function () {
    return gulp.src(['dist/index.html'])
        .pipe(htmlmin({
            minifyJS: true,//压缩页面JS
            removeComments: true,//清除HTML注释
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('release'));
}));


//复制scr目录下的js
gulp.task('copy-js-release', gulp.parallel(function () {
    return del(['release/src/*']).then(function () { //先删除  删除是异步的，会导致一些编译顺序问题，后续需要调整下
        return gulp.src('src/*.js')
            .pipe(gulp.dest("release/src"));
    });
}));



//编译ts
gulp.task("build-ts-release", gulp.parallel(function () {
    return browserify({
        // basedir: '.',
        debug: false,
        entries: ['app/Main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("release"));
}));

// //合并js 
gulp.task("concat-js-release", gulp.parallel(function () {
    return gulp.src(['libs/zepto.min.js', 'libs/fx.js', 'libs/lazyload.min.js', 'libs/Tween.min.js'])//, 'libs/*.js'
        .pipe(concat('library.js'))
        .pipe(gulp.dest("release"));
}));

//复制图片
gulp.task("copy-img-release", gulp.parallel(function () {
    return gulp.src('./app/res/other/**')
        .pipe(gulp.dest("release/res/other"));
}))

//混淆js => 最好还是把原来的ts 编译以后再和库合并，然后再发布  目前只混bundle
gulp.task('minJs', gulp.parallel(function () {
    return gulp.src('./release/bundle.js')
        .pipe(uglify())
        .pipe(gulp.dest('release'));
}));

// //测试环境
gulp.task('server-re', gulp.parallel(function () {
    return connect.server({
        root: 'release/',
        // root: 'release/',
        host: '192.168.3.2',
        // livereload: true,
        port: 2221,
    });
}));

//删除不需要的目录
gulp.task('del', gulp.series(function (fb) {
    return del(['release/view_css', 'release/rev-manifest.json']).then(function () { //先删除 删除是异步的，会导致一些编译顺序问题，后续需要调整下
        fb();
    });
}))

gulp.task('release', gulp.series(
    'revImage',
    'minCss',
    'revHtmlCss', 'include-release',
    'build-ts-release', 'minJs',
    'copy-img-release',
    gulp.parallel('minHtml', 'copy-js-release', 'concat-js-release'),
    'del'
));