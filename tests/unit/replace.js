define([
    'test-sandbox',
    'common'
], function(testSandbox, common) {
    var Descript;
    var descript;
    var $;

    describe('Descript replace', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('replaces portion of script with single replacement', function() {
            descript
                .add('custom', {
                    contains: ['alert(\'hi\'']
                })
                .replace({contains: ['alert(\'hi\'']}, 'alert', 'console.log');

            var $script = descript.get('custom').eq(0);

            expect($script.html()).to.contain('console.log');
        });

        it('replaces portions of script with multiple replacements', function() {
            descript
                .add('custom', {
                    contains: ['alert(\'hi\'']
                })
                .replace(
                {contains: ['alert(\'hi\'']},
                [
                    {pattern: 'alert', replacement: 'console.log'},
                    {pattern: 'hi', replacement: 'bye'}
                ]
            );

            var $script = descript.get('custom').eq(0);

            expect($script.html()).to.contain('console.log(\'bye\')');
        });

        it('throws when searchType contains multiple types', function() {
            descript
                .add('custom', {
                    contains: ['alert(\'hi\'']
                });

            expect(function() {
                descript.replace({
                    src: ['script1'],
                    contains: ['alert(\'hi\'']
                }, 'alert', 'console.log');
            }).to.throw(common.errors.MULTIPLE_SEARCH_TYPES);
        });

        it('throws when searchType is an array with multiple search patterns', function() {
            descript
                .add('custom', {
                    contains: ['alert(\'hi\'']
                });

            expect(function() {
                descript.replace({contains: ['alert(\'hi\'', 'console']}, 'alert', 'console.log');
            }).to.throw(common.errors.MULTIPLE_SEARCH_PATTERNS);
        });
    });

});
