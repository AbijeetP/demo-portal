module.exports = function (grunt) {
  var jsPath = 'js/';
  var libPath = 'lib/';
  var distPath = 'dist/';
  var cssPath = 'css/';
  var pkg = grunt.file.readJSON('package.json');

  var jsFiles = [
    'dist/js/bootstrap-contributors/googleMapsModule.js',
    'dist/js/bootstrap-contributors/googleMapsService.js',
    'dist/js/bootstrap-contributors/googleMapsController.js',
    'dist/js/search-location/searchLocationModule.js',
    'dist/js/search-location/searchLocationController.js'
  ];

  var cssFiles = {};
  cssFiles[distPath + 'css/style.css'] = cssPath + 'style.less';

  var initialLoadScripts = [
    'jquery/dist/jquery.min.js',
    'bootstrap/dist/js/bootstrap.min.js'
  ];

  var minifyFiles = {};

  // For minifying custom js files.
  for (var i = 0; i < jsFiles.length; i++) {
    jsFiles[i] = jsPath + jsFiles[i];
  }

  // For adding blockUI plugin into jsFiles
  jsFiles.push(libPath + 'blockUI/jquery.blockUI.js');

  // For minifying initial load plugin js files.
  for (var i = 0; i < initialLoadScripts.length; i++) {
    initialLoadScripts[i] = libPath + initialLoadScripts[i];
  }

  minifyFiles[distPath + 'js/main.min.js'] = jsFiles;
  minifyFiles[distPath + 'js/initialScripts.min.js'] = initialLoadScripts;
  minifyFiles[distPath + 'js/bootstrap-contributors.min.js'] = 'dist/js/bootstrap-contributors.js';
  minifyFiles[distPath + 'js/search-location.min.js'] = 'dist/js/search-location.js';

  var preprocessOpts = {
    context: {
      DEBUG: true,
      NODE_ENV: 'production',
      VERSION: pkg.version
    }
  };

  if (grunt.option('production')) {
    preprocessOpts.context.NODE_ENV = 'production';
  } else if (grunt.option('development')) {
    preprocessOpts.context.NODE_ENV = 'development';
  }

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
            libPath + 'components-font-awesome/css/font-awesome.min.css'
          ],
          'dist/js/bootstrap-contributors.js': [
            jsPath + 'bootstrap-contributors/googleMapsModule.js',
            jsPath + 'bootstrap-contributors/googleMapsController.js',
            jsPath + 'bootstrap-contributors/googleMapsService.js'
          ],
          'dist/js/search-location.js': [
            jsPath + 'search-location/searchLocationModule.js',
            jsPath + 'search-location/searchLocationController.js',
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
          cwd: 'img/', // src matches are relative to this path
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
    preprocess: {
      options: preprocessOpts,
      multifile: {
        files: {
          'index.html': 'index.toprocess.html',
          'search-location.html': 'search-location.toprocess.html'
        }
      }
    },
    ngAnnotate: {
      options: {
        expand: true,
        singleQuotes: true,
      },
      app: {
        files: {
          'dist/js/bootstrap-contributors.js': 'dist/js/bootstrap-contributors.js',
          'dist/js/search-location.js': 'dist/js/search-location.js'
        }
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
        tasks: ['concat'],
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
    grunt.task.run('ngAnnotate');
    grunt.task.run('uglify');
    grunt.task.run('cssmin');
    grunt.task.run('imagemin');
    grunt.task.run('preprocess');
  });

  grunt.registerTask('dev', function () {
    grunt.task.run('less');
    grunt.task.run('concat');
    grunt.task.run('preprocess');
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-preprocess');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin', 'less']);
};