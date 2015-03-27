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

        describe('constructing', function() {
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

        describe('get', function() {
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

        describe('add', function() {
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

        describe('remove', function() {
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

        describe('injectScript', function() {
            it('adds inline script at the correct position', function() {
                descript
                    .add('custom', {
                        src: ['script4.js', 'script1.js']
                    })
                    .injectScript('tester', 'custom', {src: 'script4'}, function() {
                        console.log('test function');
                    });

                var $inlineScript = descript.get('custom').eq(2);

                expect($inlineScript.html()).to.contain('test function');
            });

            it('invokes inline script when appended', function(done) {
                var scripts;
                descript
                    .add('custom', {
                        src: ['script4.js', 'script1.js', 'script2.js', 'script14.js']
                    })
                    .injectScript('tester', 'custom', {src: 'script4'}, function() {
                        // signal to the test window that we're done
                        window.parent.postMessage('loaded', '*');
                    });

                // signal completion of our test
                $(window).one('message', function() {
                    done();
                });

                scripts = descript.get('custom').map(function() {
                    var script = $(this)[0].outerHTML;

                    return script
                        .replace('text/mobify-script', 'text/javascript')
                        .replace(/x-src="([^)]*)"/, 'src="$1"');
                }).get().join('');

                $('body').append(scripts);
            });
        });

        describe('replace', function() {
            it('replaces portion of script with single replacement', function() {
                descript
                    .add('custom', {
                        contains: ['alert(\'hi\'']
                    })
                    .replace('custom', { contains: ['alert(\'hi\''] }, 'alert', 'console.log');

                var $script = descript.get('custom').eq(0);

                expect($script.html()).to.contain('console.log');
            });

            it('replaces portions of script with multiple replacements', function() {
                descript
                    .add('custom', {
                        contains: ['alert(\'hi\'']
                    })
                    .replace(
                        'custom',
                        { contains: ['alert(\'hi\''] },
                        [
                            { pattern: 'alert', replacement: 'console.log' },
                            { pattern: 'hi', replacement: 'bye' }
                        ]
                    );

                var $script = descript.get('custom').eq(0);

                expect($script.html()).to.contain('console.log(\'bye\')');
            });
        });

        describe('addSearcher', function() {
            var searcher;

            beforeEach(function() {
                searcher = function($script, query) {
                    var src = $script.attr('x-src');

                    return src && query.constructor === RegExp && query.test(src);
                };
                descript.addSearcher('regex', searcher);
            });

            it('adds a custom searcher', function() {
                expect(descript.searchers).to.have.property('regex');
                expect(descript.searchers.regex).to.equal(searcher);
            });

            it('uses a custom searcher to find scripts', function() {
                descript.add('patterns', {
                    regex: [/.*script\d\.js/]
                });

                var $patternScripts = descript.get('patterns');

                expect($patternScripts).to.have.length(9);
            });
        });
    });
});
