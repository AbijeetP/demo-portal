var path = require( 'path' );

module.exports = function( grunt ) {
  var baseDirPath = path.join( __dirname, '/' );
  var distDirPath = baseDirPath + 'dist/';
  var objPackageDtls = grunt.file.readJSON( 'package.json' );

  // Add custom scripts to the below array.
  var customJSFiles = [
    'js/constants.js',
    'js.utility.js',
    'js/app.js',
    'js/script.js',
    'js/sidebar.js',
    'js/commonMenu.js'
  ];

  var minifyJSFiles = {};

  // For minifying custom JS files.
  for ( var i = 0; i < customJSFiles.length; i++ ) {
    customJSFiles[ i ] = baseDirPath + customJSFiles[ i ];
  }
  minifyJSFiles[ distDirPath + 'js/main.min.js' ] = customJSFiles;

  // For creating CSS files from less
  var lessFiles = {};
  lessFiles[ distDirPath + 'css/style.css' ] = baseDirPath + 'css/style.less';

  // For minifying CSS files
  var minifiedCSSFiles = {};
  minifiedCSSFiles[ distDirPath + 'css/style.min.css' ] = distDirPath + 'css/style.css';

  var preprocessOpts = {
    context: {
      DEBUG: true,
      NODE_ENV: 'development',
      VERSION: objPackageDtls.version
    }
  };

  if (grunt.option('production')) {
    preprocessOpts.context.NODE_ENV = 'production';
  } else if (grunt.option('development')) {
    preprocessOpts.context.NODE_ENV = 'development';
  }

  // Grunt config object
  var objConfig = {
    preprocess: {
      options: preprocessOpts,
      multifile: {
        files: {
          'index.html': 'index.toprocess.html'
        }
      }
    },
    watch: {
      css: {
        files: baseDirPath + 'css/*.less',
        tasks: [ 'less' ],
        options: {
          livereload: true,
          spawn: false
        }
      },
      scripts: {
        files: baseDirPath + 'js/*.js',
        tasks: [],
        options: {
          livereload: true,
          spawn: false
        }
      }
    },
    uglify: {
      options: {
        mangle: true
      },
      js: {
        files: minifyJSFiles
      }
    },
    less: {
      development: {
        options: {
          ieCompat: false,
          strictUnits: true,
          compress: false
        },
        files: lessFiles
      }
    },
    cssmin: {
      options: {
        mangle: true
      },
      css: {
        files: minifiedCSSFiles
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
    }
  };

  // Configuration
  grunt.initConfig( objConfig );

  // Run 'grunt dev' to in development
  grunt.registerTask( 'dev', function() {
    grunt.task.run( 'less' );
    grunt.task.run( 'preprocess' );
  } );

  // Run 'grunt prod' in production mode
  grunt.registerTask( 'prod', function() {
    grunt.task.run( 'less' );
    grunt.task.run( 'preprocess' );
    grunt.task.run( 'uglify' );
    grunt.task.run('cssmin');
    grunt.task.run('imagemin');
  });

  grunt.loadNpmTasks( 'grunt-preprocess' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks('grunt-contrib-imagemin');
};
