module.exports = function (grunt) {

  grunt.registerTask('buildapp', function (dir) {
    var done = this.async();

    grunt.log.writeln('processing ' + dir);

    grunt.util.spawn({
      grunt: true,
      args: ['prod'],
      opts: {
        cwd: dir
      }
    }, function (err, result, code) {
      if (err == null) {
        grunt.log.writeln('processed ' + dir);
        done();
      }
      else {
        grunt.log.writeln('processing ' + dir + ' failed: ' + code);
        done(false);
      }
    })
  });

  grunt.registerTask('build', function () {
    grunt.task.run(['buildapp:GoogleMaps']);
  });

  grunt.registerTask('default', ['build']);
};