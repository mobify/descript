module.exports = function(grunt) {
    return {
        options: {
            banner: '/*! <%= pkg.name %> <%= pkg.version %> (<%= pkg.repository.url%>) */\n'
        },
        build: {
            files: {
                'dist/script-manager.min.js': 'dist/script-manager.js'
            }
        }
    };
};