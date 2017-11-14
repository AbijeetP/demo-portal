module.exports = function (grunt) {
  var jsPath = 'js/';
  var libPath = 'lib/';
  var distPath = 'dist/';
  var cssPath = 'css/';
  var pkg = grunt.file.readJSON('package.json');
  var jsFiles = [
    'dist/js/tasks/tasksModule.js',
    'dist/js/tasks/tasksService.js',
    'dist/js/tasks/tasksController.js',
    'dist/js/directives/task-status-chart/taskStatusChart.js',
    'dist/js/directives/task-complete-chart/taskCompleteChart.js',
    'dist/js/services/chartsService.js'
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
    'tether/dist/js/tether.min.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'datatables.net/js/jquery.dataTables.min.js',
    'datatables/media/js/dataTables.material.min.js',
    'datatables.net-responsive/js/dataTables.responsive.min.js',
    'datatables.net-responsive-bs/js/responsive.bootstrap.min.js',
    'datatables.net-colreorder/js/dataTables.colReorder.min.js',
    'angular-block-ui/dist/angular-block-ui.min.js',
    'toastr/toastr.min.js',
    'moment/min/moment.min.js',
    'ngstorage/ngStorage.min.js',
    'chart.js/dist/Chart.min.js'
  ];

  var minifyFiles = {};
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
        mangle: true,
        maxLineLen: 100000,
        ASCIIOnly: true
      },
      js: {
        files: minifyFiles
      }
    },
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      app: {
        files: {
          'dist/js/tasks/tasksModule.js': ['js/tasks/tasksModule.js'],
          'dist/js/tasks/tasksService.js': ['js/tasks/tasksService.js'],
          'dist/js/tasks/tasksController.js': ['js/tasks/tasksController.js'],
          'dist/js/directives/task-complete-chart/taskCompleteChart.jss': ['js/directives/task-complete-chart/taskCompleteChart.js'],
          'dist/js/directives/task-status-chart/taskStatusChart.js': ['js/directives/task-status-chart/taskStatusChart.js'],
          'dist/services/chartsService.js': ['js/services/chartsService.js'],
        }
      }
    },
    concat: {
      dist: {
        files: {
          'dist/css/lib.min.css': [
            libPath + 'angular-material/angular-material.min.css',
            libPath + 'bootstrap/dist/css/bootstrap.min.css',
            libPath + 'material-design-lite/material.min.css',
            libPath + 'datatables/media/css/dataTables.material.css',
            libPath + 'components-font-awesome/css/font-awesome.min.css',
            libPath + 'toastr/toastr.css',
            libPath + 'tether/dist/css/tether.min.css',
            libPath + 'datatables.net-responsive-bs/css/responsive.bootstrap.min.css',
            libPath + 'datatables.net-colreorder-bs/css/colReorder.bootstrap.min.css',
            libPath + 'angular-block-ui/dist/angular-block-ui.min.css'
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
    grunt.task.run('ngAnnotate');
    grunt.task.run('concat');
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-preprocess');
  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin', 'less']);
};
