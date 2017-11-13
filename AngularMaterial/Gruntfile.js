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
    'angular/angular.min.js',
    'angular-animate/angular-animate.min.js',
    'angular-aria/angular-aria.min.js',
    'angular-messages/angular-messages.min.js',
    'angular-material/angular-material.min.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'datatables.net/js/jquery.dataTables.min.js',
    'datatables.net-bs/js/dataTables.bootstrap.min.js',
  ];
  var minifyFiles = {};
  // For minifying custom js files.
  for (var i = 0; i < jsFiles.length; i++) {
    jsFiles[i] = jsPath + jsFiles[i];
  }
  // For minifying initial load plugin js files.
  for (var i = 0; i < initialLoadScripts.length; i++) {
    initialLoadScripts[i] = libPath + initialLoadScripts[i];
  }
  minifyFiles[distPath + 'js/main.min.js'] = jsFiles;
  minifyFiles[distPath + 'js/initialScripts.min.js'] = initialLoadScripts;

  var preprocessOpts = {
    context: {
      DEBUG: true,
      NODE_ENV: 'development',
      VERSION: pkg.version
    }
  };

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
    preprocess: {
      options: preprocessOpts,
      html: {
        src: 'index.toprocess.html',
        dest: 'index.html'
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
    grunt.task.run('uglify');
    grunt.task.run('cssmin');
    grunt.task.run('imagemin');
    grunt.task.run('preprocess');
  });
  grunt.registerTask('dev', function () {
    grunt.task.run('less');
    grunt.task.run('preprocess');
  });
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-preprocess');
  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin', 'less']);
};
