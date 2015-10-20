define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript constructor', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('creates instance', function() {
            expect(descript).to.be.an.instanceOf(Descript);
        });

        it('creates only one instance', function() {
            var otherDescript = Descript.init();

            expect(descript).to.equal(otherDescript);
        });

        it('pre-processes scripts into script array', function() {
            var defaultContainer = descript.get('default');

            expect(defaultContainer).to.be.an('array');
            expect(defaultContainer).to.have.length(22);
        });
    });
});
