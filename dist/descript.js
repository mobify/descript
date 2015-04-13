(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework);
    }
}(function($) {
    var DEFAULT_CONTAINER = 'default';
    var DEFAULT_SEARCHERS = {
        src: function($script, query) {
            return $script.attr('x-src') && $script.is('[x-src*="' + query + '"]');
        },
        contains: function($script, query) {
            return !$script.attr('x-src') && $script.html().indexOf(query) >= 0;
        },
        regex: function($script, query) {
            var src = $script.attr('x-src');

            return src && Object.prototype.toString.call(query) === '[object RegExp]' && query.test(src);
        }
    };

    var removeItem = function(array, index) {
        var rest = array.slice(index + 1 || array.length);
        array.length = index < 0 ? array.length + index : index;
        return array.push.apply(array, rest);
    };

    /**
     * Initializes descript with a default container containing
     * all the scripts on the page.
     * @constructor
     */
    var Descript = function() {
        if (Descript.prototype._instance) {
            return Descript.prototype._instance;
        }

        Descript.prototype._instance = this;

        this._scripts = $('script[x-src], script[type="text/mobify-script"]')
                            // we remove all the scripts from the DOM so we can manipulate them before adding them back in
                            .remove()
                            .map(function(_, script) {
                                var $script = $(script);

                                return {
                                    container: DEFAULT_CONTAINER,
                                    $script: $script
                                };
                            })
                            .get();
        this.searchers = DEFAULT_SEARCHERS;
    };

    /**
     * Initializes descript, ensuring a Singleton instance.
     * @returns {*|Descript}
     */
    Descript.init = function() {
        return Descript.prototype._instance || new Descript();
    };

    /**
     * Returns the specific container requested by container.
     * @param container
     * @returns {*}
     */
    Descript.prototype.get = function(container) {
        if (!container) { throw new Error('You must specify a script container'); }

        return this.getAll()[container];
    };

    /**
     * Returns all containers as name/value pairs
     * @returns {{}}
     */
    Descript.prototype.getAll = function() {
        var self = this;

        if (!this._containers) {
            this._containers = {};

            this._scripts.map(function(script) {
                var currentContainer = script.container;
                var $scripts = self._containers[currentContainer] || $();

                self._containers[currentContainer] = $scripts.add(script.$script);
            });
        }

        return this._containers;
    };

    /**
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved. This method is chainable.
     * @param container
     * @param searchTypes
     */
    Descript.prototype.add = function(container, searchTypes) {
        this._each(searchTypes, function(scriptItemIndex, script) {
            script.container = container;
        });

        return this;
    };

    /**
     * Removes specified scripts from the default container.
     * @param searchTypes
     * @returns {Descript}
     */
    Descript.prototype.remove = function(searchTypes) {
        var scripts = this._scripts;

        this._each(searchTypes, function(scriptItemIndex) {
            removeItem(scripts, scriptItemIndex);
        });

        return this;
    };

    /**
     * Injects a script into the container specified by `container`. In terms of position, the
     * injected script is added directly after the script defined in `searchType`. The injected
     * script is added as an inline script.
     * @param searchType
     * @param scriptToInject
     */
    Descript.prototype.injectScript = function(searchType, scriptToInject) {
        var script = this._find(searchType);

        if (script) {
            this._scripts.splice(script.index + 1, 0, {
                container: script.script.container,
                $script: $('<script />')
                    .attr('type', 'text/mobify-script')
                    .html('(' + scriptToInject.toString() + ')();')[0]
            });
        }
    };

    /**
     * Replaces string patterns in inline scripts.
     * @param searchType
     * @param pattern
     * @param replacement
     */
    Descript.prototype.replace = function(searchType, pattern, replacement) {
        var scriptItem = this._find(searchType);

        if (scriptItem && scriptItem.script) {
            var script = scriptItem.script;
            var patterns = [];

            if (arguments.length === 3) {
                patterns.push({pattern: pattern, replacement: replacement});
            } else {
                patterns = pattern;
            }

            for (var i = 0, l = patterns.length; i < l; i++) {
                var currentPattern = patterns[i];
                script.$script.html(script.$script.html().replace(currentPattern.pattern, currentPattern.replacement));
            }
        }
    };

    /**
     * Adds a new script searcher to match scripts in specific ways, such as by regex
     * @param name
     * @param searcher
     */
    Descript.prototype.addSearcher = function(name, searcher) {
        this.searchers[name] = searcher;
    };

    Descript.prototype._getSearchPatterns = function(searchType) {
        if (typeof searchType === 'string') {
            if (searchType.indexOf(',') >= 0) {
                return searchType.replace(/\s/, '').split(',');
            }

            return [searchType];
        }

        return searchType;
    };

    /**
     * Processes each script in the container.
     * @param searchTypes
     * @param execute
     * @private
     */
    Descript.prototype._each = function(searchTypes, execute) {
        var scripts = this._scripts;

        for (var searchType in searchTypes) {
            if (searchTypes.hasOwnProperty(searchType)) {
                var searchPatterns = this._getSearchPatterns(searchTypes[searchType]);
                var searcher = this.searchers[searchType];
                var patternIndex = searchPatterns.length;

                while (patternIndex--) {
                    var scriptIndex = scripts.length;

                    while (scriptIndex--) {
                        var script = scripts[scriptIndex];

                        if (searcher($(script.$script), searchPatterns[patternIndex])) {
                            execute(scriptIndex, script);
                        }
                    }
                }
            }
        }
    };

    /**
     * Searches scripts to find a single script based on the supplied searchType
     * @param searchType
     * @returns {{$script: (*|jQuery|HTMLElement), index: *}}
     * @private
     */
    Descript.prototype._find = function(searchType) {
        var scripts = this._scripts;
        var attribute;
        var searchPattern;
        var searcher;
        var scriptIndex;

        var attributes = Object.keys(searchType);

        // Validate whether we have multiple search types, i.e. { src: ..., contains: ... }. We should only have one type.
        if (attributes.length > 1) {
            throw new Error('The searchType parameter should contain only one type, i.e. { src: \'script1\' }');
        }

        attribute = attributes[0];
        searchPattern = searchType[attribute];

        // Validate whether we have multiple patterns, i.e. { src: ['script1', 'script2'] }. We should only have one pattern.
        if ($.isArray(searchPattern) && searchPattern.length > 1) {
            throw new Error('The searchType value should be a string or an array with only a single item, i.e. { src: \'script1\' } or { contains: [\'script1\'] }');
        }

        searcher = this.searchers[attribute];
        scriptIndex = scripts.length;

        while (scriptIndex--) {
            var script = scripts[scriptIndex];

            if (searcher($(script.$script), searchType[attribute])) {
                return {
                    script: script,
                    index: scriptIndex
                };
            }
        }
    };

    return Descript;
}));
