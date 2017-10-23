module.exports = function (grunt) {

  grunt.registerTask('buildProd', function (dir) {
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

  // Add grunt.task.run(['buildProd:{folderName}']) 
  grunt.registerTask('build', function () {
    grunt.task.run(['buildProd:GoogleMaps']);
    grunt.task.run(['buildProd:BootStrap']);
    grunt.task.run(['buildProd:AngularMaterial']);
  });

  grunt.registerTask('default', ['build']);
};