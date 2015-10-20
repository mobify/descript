define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript remove', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('correctly removes specific external scripts', function() {
            descript.remove({src: ['script6', 'script15']});

            var defaultContainer = descript.get('default');

            expect(defaultContainer).to.have.length(20);
        });

        it('correctly removes specific inline scripts', function() {
            descript.remove({contains: ['gtm.start', 'alert(\'hi\'']});

            var defaultContainer = descript.get('default');

            expect(defaultContainer).to.have.length(20);
        });

        it('correctly removes specific external and inline scripts', function() {
            descript.remove({
                src: ['script3', 'script11'],
                contains: ['gtm.start', 'alert(\'hi\'']
            });

            var defaultContainer = descript.get('default');

            expect(defaultContainer).to.have.length(18);
        });
    });
});
