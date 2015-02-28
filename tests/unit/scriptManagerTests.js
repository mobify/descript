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

                expect(firstScript).to.have.property('$script');
                expect(firstScript).to.have.property('inline');

                expect(firstScript.inline).to.be.true;
            });

            it('pre-processes external scripts', function() {
                var firstScript = scriptManager.get('default')[1];

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
                scriptManager.add('custom', {
                    src: ['script4']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer).to.be.defined;
                expect(customContainer).to.have.length(1);
            });
        });

        describe('Add', function() {
            it('creates custom container with scripts', function() {
                scriptManager.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer).to.have.length(2);
            });

            it('ensures order of scripts is maintained', function() {
                scriptManager.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer[0].$script[0].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[1].$script[0].attributes[0].value).to.equal('/script4.js');
            });
        });
    });
});
