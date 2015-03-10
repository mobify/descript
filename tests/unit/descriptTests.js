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

            it('segmented scripts return wrapped set', function() {
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

                [defaultContainer, urgentContainer, delayedContainer].forEach(function(wrappedSet) {
                    expect(wrappedSet).to.have.property('selector');
                });
            });

            it('returns all containers when no parameter passed', function() {
                scriptManager
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    });

                var all = scriptManager.get();

                expect(all).to.have.property('default');
                expect(all.default).to.be.an('array');

                expect(all).to.have.property('urgent');
                expect(all.urgent).to.be.an('array');

                expect(all).to.have.property('delayed');
                expect(all.delayed).to.be.an('array');
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

            it('ensures order of external scripts is maintained', function() {
                scriptManager.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer[0].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[1].attributes[0].value).to.equal('/script4.js');
            });

            it('ensures order of internal scripts is maintained', function() {
                scriptManager.add('custom', {
                    contains: ['alert(\'hi\'', 'gtm.start']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].innerHTML).to.contain('alert(\'hi\'');
            });

            it('ensures order of internal and external scripts is maintained', function() {
                scriptManager.add('custom', {
                    src: ['script4', 'script2'],
                    contains: ['alert(\'hi\'', 'gtm.start']
                });
                var customContainer = scriptManager.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[2].attributes[0].value).to.equal('/script4.js');
                expect(customContainer[3].innerHTML).to.contain('alert(\'hi\'');
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

        describe('Remove', function() {
            it('correctly removes specific external scripts', function() {
                scriptManager.remove({ src: ['script6', 'script15'] });

                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific inline scripts', function() {
                scriptManager.remove({ contains: ['gtm.start', 'alert(\'hi\''] });

                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific external and inline scripts', function() {
                scriptManager.remove({
                    src: ['script3', 'script11'],
                    contains: ['gtm.start', 'alert(\'hi\'']
                });

                var defaultContainer = scriptManager.get('default');

                expect(defaultContainer).to.have.length(13);
            });
        });
    });
});
