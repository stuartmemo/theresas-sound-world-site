'use strict'; 

module.exports = function (grunt) {
    // Project config.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/styles',
                    src: ['**/*.scss'],
                    dest: 'src/styles/',
                    ext: '.css'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        cwd: 'src',
                        expand: true,
                        dest: 'dist',
                        src: ['**/*'],
                    }
                ]
            }
        },
        watch: {
            html: {
                files: 'src/index.html',
                tasks: ['copy']
            },
            sass: {
                files: ['src/styles/*.scss'],
                tasks: ['sass']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['src/**/*']
            }
        },
        connect: {
            server: {
                options: {
                    base: 'src',
                    port: 8000,
                    keepalive: false
                }
            }
        }
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Load plugins.
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default tasks.
    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('server', ['connect', 'watch']);
    grunt.registerTask('build', ['copy', 'sass:dist']);
};
