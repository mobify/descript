require.config({
    baseUrl: '../../',
    paths: {
        'text': 'bower_components/requirejs-text/text',
        'fixtures': 'tests/fixtures',
        '$': 'lib/zeptojs/dist/zepto',
        'chai': 'node_modules/chai/chai',
        'mocha': 'node_modules/mocha/mocha',
        'descript': 'src/js/descript'
    },
    'shim': {
        'mocha': {
            init: function() {
                this.mocha.setup('bdd');
                return this.mocha;
            }
        },
        '$': {
            exports: '$'
        }
    }
});
