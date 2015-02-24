define([
    'test-sandbox'
], function(testSandbox) {
    var ScriptManager;
    var scriptManager;
    var $;

    describe('ScriptManager', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                ScriptManager = dependencies.ScriptManager;
                scriptManager = new ScriptManager();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('is created via constructor', function() {
            expect(scriptManager).to.be.an.instanceOf(ScriptManager);
        });

        it('correctly pre-processes scripts into script array', function() {
            expect(scriptManager.scripts).to.be.an('array');
            expect(scriptManager.scripts).to.have.length(3);
        });

        it('correctly pre-processes external scripts', function() {
            var firstScript = scriptManager.scripts[1];

            expect(firstScript).to.have.property('container');
            expect(firstScript).to.have.property('$script');
            expect(firstScript).to.have.property('inline');

            expect(firstScript.inline).to.be.false;
        });

        it('correctly pre-processes inline scripts', function() {
            var firstScript = scriptManager.scripts[0];

            expect(firstScript).to.have.property('container');
            expect(firstScript).to.have.property('$script');
            expect(firstScript).to.have.property('inline');

            expect(firstScript.inline).to.be.true;
        });
    });
});
