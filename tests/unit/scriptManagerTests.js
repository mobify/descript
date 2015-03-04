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
                scriptManager = ScriptManager.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        describe('Constructing', function() {
            it('creates instance', function() {
                expect(scriptManager).to.be.an.instanceOf(ScriptManager);
            });

            it('creates only one instance', function() {
                var otherScriptManager = ScriptManager.init();

                expect(scriptManager).to.equal(otherScriptManager);
            });

            it('pre-processes scripts into script array', function() {
                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.be.an('array');
                expect(defaultContainer).to.have.length(17);
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

            it('chains calls when adding containers', function() {
                var scripts = scriptManager
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    })
                    .get();

                expect(Object.keys(scripts)).to.have.length(3);
            });

            it('ensures order of scripts is maintained', function() {
                scriptManager.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer[0].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[1].attributes[0].value).to.equal('/script4.js');
            });

            it('segments scripts into three containers', function() {
                scriptManager
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    });

                var defaultContainer = scriptManager.get('default');
                var urgentContainer = scriptManager.get('urgent');
                var delayedContainer = scriptManager.get('delayed');

                expect(defaultContainer).to.have.length(13);
                expect(urgentContainer).to.have.length(2);
                expect(delayedContainer).to.have.length(2);
            });
        });
    });
});
