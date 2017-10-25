module.exports = function (grunt) {
    var jsPath = 'js/';
    var libPath = 'lib/';
    var distPath = 'dist/';
    var cssPath = 'css/';
    var pkg = grunt.file.readJSON('package.json');

    var jsFiles = [
        'script.js'
    ];

    var cssFiles = {};
    cssFiles[distPath + 'css/style.css'] = cssPath + 'style.less';

    var initialLoadScripts = [
        'jquery/dist/jquery.min.js',
        'moment/min/moment.min.js',
        'bootstrap/dist/js/bootstrap.min.js',
        'bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
        'datatables.net-responsive/js/dataTables.responsive.min.js',
        'datatables.net-responsive-bs4/js/responsive.bootstrap4.min.js',
        'datatables.net-colreorder/js/dataTables.colReorder.min.js',
        'jquery.notify/js/jquery.notify.min.js'
    ];

    var minifyFiles = {};

    // For minifying custom js files.
    for (var i = 0; i < jsFiles.length; i++) {
        jsFiles[i] = jsPath + jsFiles[i];
    }

    //For adding blockUI plugin into jsFiles
    jsFiles.push(libPath + 'blockUI/jquery.blockUI.js');

    // For minifying initial load plugin js files.
    for (var i = 0; i < initialLoadScripts.length; i++) {
        initialLoadScripts[i] = libPath + initialLoadScripts[i];
    }

    minifyFiles[distPath + 'js/main.min.js'] = jsFiles;
    minifyFiles[distPath + 'js/initialScripts.min.js'] = initialLoadScripts;

    // Grunt configuration
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: true
            },
            js: {
                files: minifyFiles
            }
        },
        concat: {
            dist: {
                files: {
                    'dist/css/lib.min.css': [
                        libPath + 'bootstrap/dist/css/bootstrap.min.css',
                        libPath + 'components-font-awesome/css/font-awesome.min.css',
                        libPath + 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css',
                        libPath + 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css',
                        libPath + 'datatables.net-colreorder-bs4/css/colReorder.bootstrap4.min.css',
                        libPath + 'jquery.notify/css/jquery.notify.css'
                    ]
                },
            },
        },
        cssmin: {
            options: {
                mangle: true
            },
            css: {
                files: {
                    'dist/css/style.min.css': [distPath + 'css/style.css']
                }
            }
        },
        imagemin: {
            dynamic: {
                files: [{
                        expand: true, // Enable dynamic expansion
                        cwd: 'img/', // Src matches are relative to this path
                        src: ['*.{png,jpg,gif}'], // Actual patterns to match
                        dest: 'dist/img/'                  // Destination path prefix
                    }]
            }
        },
        less: {
            // Run the LESS compiler on all LESS files to get our *.css file
            // This will run LESS compiler on all the LESS under css folder.
            development: {
                options: {
                    // paths: codebase + 'css'
                    ieCompat: false,
                    strictUnits: true,
                    compress: false
                },
                files: cssFiles
            }
        },
        watch: {
            css: {
                files: cssPath + '*.less',
                tasks: ['less'],
                options: {
                    livereload: true,
                    spawn: false
                }
            },
            js: {
                files: jsPath + '**/*.js',
                tasks: [],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('prod', function () {
        grunt.task.run('less');
        grunt.task.run('concat');
        grunt.task.run('uglify');
        grunt.task.run('cssmin');
        grunt.task.run('imagemin');
    });

    grunt.registerTask('dev', function () {
        grunt.task.run('less');
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'cssmin', 'less']);
};
