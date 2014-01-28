module.exports = function (grunt) {
    'use strict'; 
    // Project config.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            all: {
                files: {
                    'build/tsw.min.js': ['src/scripts/tsw-core.js', 'src/scripts/tsw-effects.js', 'src/scripts/tsw-music.js']
                },
                options: {
                    banner: '/* <%= pkg.title %> <%= pkg.version %> (c) 2013 Stuart Memo */\n'
                }
            }
        },
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
                        expand: true,
                        src: 'src/index.html',
                        dest: 'build/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },
        watch: {
            html: {
                files: 'src/index.html',
                tasks: ['uglify', 'copy']
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default tasks.
    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('server', ['connect', 'watch']);
};
