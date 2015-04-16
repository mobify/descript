define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript add', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;
                descript = Descript.init();

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        it('throws when no container parameter is supplied', function() {
            descript.add('custom', {
                src: ['script4', 'script2']
            });

            expect(descript.get).to.throw;
        });

        it('creates custom container with scripts using src search type with string', function() {
            descript.add('custom', {
                src: ['script4', 'script2']
            });
            var customContainer = descript.get('custom');

            expect(customContainer).to.have.length(2);
        });

        it('creates custom container with scripts using contains search type with string', function() {
            descript.add('custom', {
                contains: ['alert(\'hi\'']
            });
            var customContainer = descript.get('custom');

            expect(customContainer).to.have.length(1);
        });

        it('creates custom container with scripts using src search type with regex', function() {
            descript.add('custom', {
                src: [/.*script\d\.js/]
            });
            var customContainer = descript.get('custom');

            expect(customContainer).to.have.length(9);
        });

        it('creates custom container with scripts using contains search type with regex', function() {
            descript.add('custom', {
                contains: [/alert\('hi'/]
            });
            var customContainer = descript.get('custom');

            expect(customContainer).to.have.length(1);
        });

        it('chains calls when adding containers', function() {
            var scripts = descript
                .add('urgent', {
                    src: ['script4', 'script2']
                })
                .add('delayed', {
                    src: ['script14', 'script10']
                })
                .getAll();

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

        it('accepts single string as searchType arguments', function() {
            descript
                .add('urgent', {
                    src: 'script4'
                });

            var urgentContainer = descript.get('urgent');

            expect(urgentContainer).to.have.length(1);
        });

        it('accepts string with comma separated patterns as searchType arguments', function() {
            descript
                .add('urgent', {
                    src: 'script4, script1.js'
                });

            var urgentContainer = descript.get('urgent');

            expect(urgentContainer).to.have.length(2);
        });
    });
});
