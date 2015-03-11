define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        describe('Constructing', function() {
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
                expect(defaultContainer).to.have.length(17);
            });
        });

        describe('Get', function() {
            it('returns default container', function() {
                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.equal(descript._containers['default']);
            });

            it('returns custom container', function() {
                descript.add('custom', {
                    src: ['script4']
                });
                var customContainer = descript.get('custom');

                expect(customContainer).to.be.defined;
                expect(customContainer).to.have.length(1);
            });

            it('segmented scripts return wrapped set', function() {
                descript
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    });

                var defaultContainer = descript.get('default');
                var urgentContainer = descript.get('urgent');
                var delayedContainer = descript.get('delayed');

                [defaultContainer, urgentContainer, delayedContainer].forEach(function(wrappedSet) {
                    expect(wrappedSet).to.have.property('selector');
                });
            });

            it('returns all containers when no parameter passed', function() {
                descript
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    });

                var all = descript.get();

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
                descript.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = descript.get('custom');

                expect(customContainer).to.have.length(2);
            });

            it('chains calls when adding containers', function() {
                var scripts = descript
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
                descript.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = descript.get('custom');

                expect(customContainer[0].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[1].attributes[0].value).to.equal('/script4.js');
            });

            it('ensures order of internal scripts is maintained', function() {
                descript.add('custom', {
                    contains: ['alert(\'hi\'', 'gtm.start']
                });
                var customContainer = descript.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].innerHTML).to.contain('alert(\'hi\'');
            });

            it('ensures order of internal and external scripts is maintained', function() {
                descript.add('custom', {
                    src: ['script4', 'script2'],
                    contains: ['alert(\'hi\'', 'gtm.start']
                });
                var customContainer = descript.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[2].attributes[0].value).to.equal('/script4.js');
                expect(customContainer[3].innerHTML).to.contain('alert(\'hi\'');
            });

            it('segments scripts into three containers', function() {
                descript
                    .add('urgent', {
                        src: ['script4', 'script2']
                    })
                    .add('delayed', {
                        src: ['script14', 'script10']
                    });

                var defaultContainer = descript.get('default');
                var urgentContainer = descript.get('urgent');
                var delayedContainer = descript.get('delayed');

                expect(defaultContainer).to.have.length(13);
                expect(urgentContainer).to.have.length(2);
                expect(delayedContainer).to.have.length(2);
            });
        });

        describe('Remove', function() {
            it('correctly removes specific external scripts', function() {
                descript.remove({ src: ['script6', 'script15'] });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific inline scripts', function() {
                descript.remove({ contains: ['gtm.start', 'alert(\'hi\''] });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific external and inline scripts', function() {
                descript.remove({
                    src: ['script3', 'script11'],
                    contains: ['gtm.start', 'alert(\'hi\'']
                });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(13);
            });
        });

        describe('Inject Script', function() {
            it('adds inline script at the correct position', function() {
                descript
                    .add('custom', {
                        src: ['script4.js', 'script1.js']
                    })
                    .injectScript('tester', 'custom', {src: 'script4'}, function() {
                        console.log('test function');
                    });
            });
        });
    });
});
