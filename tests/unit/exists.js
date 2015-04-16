define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;`
    var descript;
    var $;

    describe('Descript exists', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('returns true when script exists in default container using src searcher', function() {
            expect(descript.exists({src: 'script1'})).to.be.true;
        });

        it('returns false when script doesn\'t exist in default container using src searcher', function() {
            expect(descript.exists({src: 'no-such-script'})).to.be.false;
        });

        it('returns true when script exists in default container using contains searcher', function() {
            expect(descript.exists({contains: 'alert'})).to.be.true;
        });

        it('returns false when script doesn\'t exist in default container using contains searcher', function() {
            expect(descript.exists({contains: 'no inline script'})).to.be.false;
        });

        it('returns true when script exists in default container using regex searcher', function() {
            expect(descript.exists({regex: /.*script\d.*/})).to.be.true;
        });

        it('returns false when script doesn\'t exist in default container using regex searcher', function() {
            expect(descript.exists({contains: /no-pattern/})).to.be.false;
        });
    });
});
