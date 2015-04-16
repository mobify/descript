define([
    'test-sandbox',
    'common'
], function(testSandbox, common) {
    var Descript;
    var descript;
    var $;

    describe('Descript insertScript', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('adds inline script at the correct position', function() {
            descript
                .add('custom', {
                    src: ['script4.js', 'script1.js']
                })
                .insertScript({src: 'script4'}, function() {
                    console.log('test function');
                });

            var $inlineScript = descript.get('custom').eq(2);

            expect($inlineScript.html()).to.contain('test function');
        });

        it('invokes inline script when appended', function(done) {
            var scripts;
            descript
                .add('custom', {
                    src: ['script4.js', 'script1.js', 'script2.js', 'script14.js']
                })
                .insertScript({src: 'script4'}, function() {
                    // signal to the test window that we're done
                    window.parent.postMessage('loaded', '*');
                });

            // signal completion of our test
            $(window).one('message', function() {
                done();
            });

            scripts = descript.get('custom').map(function() {
                var script = $(this)[0].outerHTML;

                return script
                    .replace('text/mobify-script', 'text/javascript')
                    .replace(/x-src="([^)]*)"/, 'src="$1"');
            }).get().join('');

            $('body').append(scripts);
        });

        it('adds external script at the correct position', function() {
            descript
                .add('custom', {
                    src: ['script4.js', 'script1.js']
                })
                .insertScript({src: 'script4'}, 'external-script.js');

            var $externalScript = descript.get('custom').eq(2);
            var src = $externalScript.attr('x-src');

            expect(src).to.be.defined;
            expect(src).to.equal('external-script.js');
        });

        it('throws when searchType contains multiple types', function() {
            descript
                .add('custom', {
                    contains: ['alert(\'hi\'']
                });

            expect(function() {
                descript.insertScript({
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
                descript.insertScript({contains: ['alert(\'hi\'', 'console']}, 'alert', 'console.log');
            }).to.throw(common.errors.MULTIPLE_SEARCH_PATTERNS);
        });
    });
});
