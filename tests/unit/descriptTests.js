define([
    'test-sandbox'
], function(testSandbox) {
    var Descript;
    var descript;
    var $;

    describe('Descript', function() {
        var MULTIPLE_SEARCH_TYPES_ERROR = 'The searchType parameter should contain only one type, i.e. { src: \'script1\' }';
        var MULTIPLE_SEARCH_PATTERNS_ERROR = 'The searchType value should be a string or an array with only a single item, i.e. { src: \'script1\' } or { contains: [\'script1\'] }';
        var contains = {
            alertPattern: 'alert(\'hi\''
        };

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
        });

        describe('getAll', function() {
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

        describe('add', function() {
            it('throws when no container parameter is supplied', function() {
                descript.add('custom', {
                    src: ['script4', 'script2']
                });

                expect(descript.get).to.throw;
            });

            it('creates custom container with scripts using src search type', function() {
                descript.add('custom', {
                    src: ['script4', 'script2']
                });
                var customContainer = descript.get('custom');

                expect(customContainer).to.have.length(2);
            });

            it('creates custom container with scripts using contains search type', function() {
                descript.add('custom', {
                    contains: [contains.alertPattern]
                });
                var customContainer = descript.get('custom');

                expect(customContainer).to.have.length(1);
            });

            it('creates custom container with scripts using regex search type', function() {
                descript.add('custom', {
                    regex: [/.*script\d\.js/]
                });
                var customContainer = descript.get('custom');

                expect(customContainer).to.have.length(9);
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
                    contains: [contains.alertPattern, 'gtm.start']
                });
                var customContainer = descript.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].innerHTML).to.contain(contains.alertPattern);
            });

            it('ensures order of internal and external scripts is maintained', function() {
                descript.add('custom', {
                    src: ['script4', 'script2'],
                    contains: [contains.alertPattern, 'gtm.start']
                });
                var customContainer = descript.get('custom');

                expect(customContainer[0].innerHTML).to.contain('gtm.start');
                expect(customContainer[1].attributes[0].value).to.equal('/script2.js');
                expect(customContainer[2].attributes[0].value).to.equal('/script4.js');
                expect(customContainer[3].innerHTML).to.contain(contains.alertPattern);
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

        describe('remove', function() {
            it('correctly removes specific external scripts', function() {
                descript.remove({ src: ['script6', 'script15'] });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific inline scripts', function() {
                descript.remove({ contains: ['gtm.start', contains.alertPattern] });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(15);
            });

            it('correctly removes specific external and inline scripts', function() {
                descript.remove({
                    src: ['script3', 'script11'],
                    contains: ['gtm.start', contains.alertPattern]
                });

                var defaultContainer = descript.get('default');

                expect(defaultContainer).to.have.length(13);
            });
        });

        describe('insertScript', function() {
            it('adds inline script at the correct position', function() {
                descript
                    .add('custom', {
                        src: ['script4.js', 'script1.js']
                    })
                    .insertScript({src: 'script4'}, function() {
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
                    .insertScript({src: 'script4'}, function() {
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

            it('adds external script at the correct position', function() {
                descript
                    .add('custom', {
                        src: ['script4.js', 'script1.js']
                    })
                    .insertScript({src: 'script4'}, 'external-script.js');

                var $externalScript = descript.get('custom').eq(2);
                var src = $externalScript.attr('x-src');

                expect(src).to.be.defined;
                expect(src).to.equal('external-script.js');
            });

            it('throws when searchType contains multiple types', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    });

                expect(function() {
                    descript.insertScript({
                        src: ['script1'],
                        contains: [contains.alertPattern]
                    }, 'alert', 'console.log');
                }).to.throw(MULTIPLE_SEARCH_TYPES_ERROR);
            });

            it('throws when searchType is an array with multiple search patterns', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    });

                expect(function() {
                    descript.insertScript({ contains: [contains.alertPattern, 'console'] }, 'alert', 'console.log');
                }).to.throw(MULTIPLE_SEARCH_PATTERNS_ERROR);
            });
        });

        describe('replace', function() {
            it('replaces portion of script with single replacement', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    })
                    .replace({ contains: [contains.alertPattern] }, 'alert', 'console.log');

                var $script = descript.get('custom').eq(0);

                expect($script.html()).to.contain('console.log');
            });

            it('replaces portions of script with multiple replacements', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    })
                    .replace(
                        { contains: [contains.alertPattern] },
                        [
                            { pattern: 'alert', replacement: 'console.log' },
                            { pattern: 'hi', replacement: 'bye' }
                        ]
                    );

                var $script = descript.get('custom').eq(0);

                expect($script.html()).to.contain('console.log(\'bye\')');
            });

            it('throws when searchType contains multiple types', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    });

                expect(function() {
                    descript.replace({
                        src: ['script1'],
                        contains: [contains.alertPattern]
                    }, 'alert', 'console.log');
                }).to.throw(MULTIPLE_SEARCH_TYPES_ERROR);
            });

            it('throws when searchType is an array with multiple search patterns', function() {
                descript
                    .add('custom', {
                        contains: [contains.alertPattern]
                    });

                expect(function() {
                    descript.replace({ contains: [contains.alertPattern, 'console'] }, 'alert', 'console.log');
                }).to.throw(MULTIPLE_SEARCH_PATTERNS_ERROR);
            });
        });

        describe('addSearcher', function() {
            var searcher;

            beforeEach(function() {
                searcher = function($script, query) {
                    return $script.attr('data-script') === query;
                };
                descript.addSearcher('dataScript', searcher);
            });

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

    describe('Descript with preserve', function() {
        beforeEach(function(done) {
            var setUpComplete = function(iFrame$, dependencies) {
                $ = iFrame$;
                Descript = dependencies.Descript;

                done();
            };

            testSandbox.setUp('sandbox', setUpComplete);
        });

        describe('init', function() {
            it('preserves specified scripts', function() {
                descript = Descript.init({
                    preserve: {
                        contains: 'www.googletagmanager.com'
                    }
                });

                expect(descript.get('default')).to.have.length(16);
            });
        });
    });
});
