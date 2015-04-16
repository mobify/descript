define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var patterns;
    var $;

    describe('Descript _getSearchPatterns', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();
                patterns = descript._getSearchPatterns;

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('normalizes to array for single regex', function() {
            expect(patterns(/someregex/)).to.be.an('array');
        });

        it('normalizes to array for single string', function() {
            expect(patterns('script1')).to.be.an('array');
        });

        it('normalizes to array for multiple, comma separated string', function() {
            expect(patterns('script1, script2, script3')).to.be.an('array');
        });

        it('returns array for array', function() {
            expect(patterns(['script1', 'script2', 'script3'])).to.be.an('array');
        });
    });
});
