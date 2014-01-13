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
            }
        },
        
        connect: {
            server: {
                options: {
                    port: 9000,
                    keepalive: true
                }
            }
        }
    });

    // Load plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default tasks.
    grunt.registerTask('default', ['watch', 'connect']);
};
