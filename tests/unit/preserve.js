define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript init with preserve', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('preserves specified scripts', function() {
            descript = Descript.init({
                preserve: {
                    contains: 'www.googletagmanager.com'
                }
            });

            expect(descript.get('default')).to.have.length(16);
        });
    });
});
