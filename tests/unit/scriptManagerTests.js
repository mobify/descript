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

        describe('Constructing', function() {
            it('creates instance', function() {
                expect(scriptManager).to.be.an.instanceOf(ScriptManager);
            });

            it('pre-processes scripts into script array', function() {
                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.be.an('array');
                expect(defaultContainer).to.have.length(17);
            });

            it('pre-processes inline scripts', function() {
                var firstScript = scriptManager.get('default')[0];

                expect(firstScript).to.have.property('container');
                expect(firstScript).to.have.property('$script');
                expect(firstScript).to.have.property('inline');

                expect(firstScript.inline).to.be.true;
            });

            it('pre-processes external scripts', function() {
                var firstScript = scriptManager.get('default')[1];

                expect(firstScript).to.have.property('container');
                expect(firstScript).to.have.property('$script');
                expect(firstScript).to.have.property('inline');

                expect(firstScript.inline).to.be.false;
            });
        });

        describe('Get', function() {
            it('returns default container', function() {
                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.equal(scriptManager._containers['default']);
            });

            it('returns custom container', function() {
                scriptManager.add('urgent', {
                    src: ['script4']
                });
                var customContainer = scriptManager.get('urgent');

                expect(customContainer).to.be.defined;
                expect(customContainer).to.have.length(1);
            });
        });
    });
});
