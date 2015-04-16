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
            var src = $script.attr('x-src');

            return src && ($.type(query) === 'regexp' ? query.test(src) : $script.is('[x-src*="' + query + '"]'));
        },
        contains: function($script, query) {
            var src = $script.attr('x-src');
            var scriptContents = $script.text();

            return !src && ($.type(query) === 'regexp' ? query.test(scriptContents) : scriptContents.indexOf(query) >= 0);
        }
    };

    /**
     * Initializes descript with a default container containing
     * all the scripts on the page.
     * @constructor
     */
    var Descript = function(options) {
        if (Descript.prototype._instance) {
            return Descript.prototype._instance;
        }

        Descript.prototype._instance = this;

        this.options = $.extend(true, {}, Descript.DEFAULTS, options);

        this.searchers = DEFAULT_SEARCHERS;

        this._buildDefaultContainer();
    };

    Descript.VERSION = '1.0.0';

    /**
     * Default options
     * @type {{preserve: null}}
     */
    Descript.DEFAULTS = {
        preserve: null
    };

    /**
     * Initializes descript, ensuring a Singleton instance.
     * @returns {*|Descript}
     */
    Descript.init = function(options) {
        return Descript.prototype._instance || new Descript(options);
    };

    /**
     * Returns the specific container requested by container.
     * @param container
     * @returns {*}
     */
    Descript.prototype.get = function(container) {
        if (!container) { throw new Error('You must specify a script container'); }

        var $scripts = this.getAll()[container];

        if (!$scripts) {
            throw new Error('The ' + container + ' script container is empty');
        }

        return $scripts;
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
        var self = this;

        this._each(searchTypes, function(scriptItemIndex) {
            self._removeScript(scriptItemIndex);
        });

        return this;
    };

    /**
     * Determines whether a specific script exists.
     * @returns {boolean}
     */
    Descript.prototype.exists = function(searchType) {
        return !!this._find(searchType);
    };

    /**
     * Inserts a script into the container specified by `container`. In terms of position, the
     * inserted script is added directly after the script defined in `searchType`.
     *
     * If a function is provided for the scriptToInsert parameter, the script is added as an
     * inline script. If a string is provided, the script is inserted as an external script.
     * @param searchType
     * @param scriptToInsert
     */
    Descript.prototype.insertScript = function(searchType, scriptToInsert) {
        var script = this._find(searchType);
        var _getScript = function() {
            var $script = $('<script />');

            if ($.type(scriptToInsert) === 'function') {
                return $script
                    .attr('type', 'text/mobify-script')
                    .text('(' + scriptToInsert.toString() + ')();')[0];
            } else {
                return $script.attr('x-src', scriptToInsert);
            }
        };

        if (script) {
            this._scripts.splice(script.index + 1, 0, {
                container: script.script.container,
                $script: _getScript()
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
                script.$script.text(script.$script.text().replace(currentPattern.pattern, currentPattern.replacement));
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

    /**
     * Builds the default script container during initialization.
     * @private
     */
    Descript.prototype._buildDefaultContainer = function() {
        this._scripts = $('script[x-src], script[type="text/mobify-script"]')
            .map(function(_, script) {
                var $script = $(script);

                return {
                    container: DEFAULT_CONTAINER,
                    $script: $script
                };
            })
            .get();

        if (this.options.preserve) {
            this.remove(this.options.preserve);
        }

        for (var i = 0; i < this._scripts.length; i++) {
            var $script = this._scripts[i].$script;

            this._scripts[i].$script = $script.remove();
        }
    };

    /**
     * Normalizes search type values into an array.
     *
     * Valid search types are:
     *
     * 1. strings containing a single pattern, i.e. 'script1'
     * 2. strings containing multiple, comma separated patterns, i.e. 'script1, script2'
     * 3. arrays containing multiple patterns i.e. ['script1', 'script2']
     *
     * @param searchType
     * @returns {*}
     * @private
     */
    Descript.prototype._getSearchPatterns = function(searchType) {
        if ($.type(searchType) === 'regexp') {
            return [searchType];
        }

        if ($.type(searchType) === 'string') {
            if (searchType.indexOf(',') >= 0) {
                return searchType.replace(/\s/, '').split(',');
            }

            return [searchType];
        }

        return searchType;
    };

    Descript.prototype._removeScript = function(index) {
        var scripts = this._scripts;
        var rest = scripts.slice(index + 1 || scripts.length);

        scripts.length = index < 0 ? scripts.length + index : index;
        scripts.push.apply(scripts, rest);
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
