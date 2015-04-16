define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript get and getAll', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

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

        it('returns all containers', function() {
            descript
                .add('urgent', {
                    src: ['script4', 'script2']
                })
                .add('delayed', {
                    src: ['script14', 'script10']
                });

            var all = descript.getAll();

            expect(all).to.have.property('default');
            expect(all.default).to.be.an('array');

            expect(all).to.have.property('urgent');
            expect(all.urgent).to.be.an('array');

            expect(all).to.have.property('delayed');
            expect(all.delayed).to.be.an('array');
        });
    });
});
