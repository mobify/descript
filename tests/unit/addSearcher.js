define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript addSearcher', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                searcher = function($script, query) {
                    return $script.attr('data-script') === query;
                };
                descript.addSearcher('dataScript', searcher);

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        var searcher;

        it('adds a custom searcher', function() {
            expect(descript.searchers).to.have.property('dataScript');
            expect(descript.searchers.dataScript).to.equal(searcher);
        });

        it('uses a custom searcher to find scripts', function() {
            descript.add('patterns', {
                dataScript: ['custom']
            });

            var $patternScripts = descript.get('patterns');

            expect($patternScripts).to.have.length(1);
        });
    });
});
