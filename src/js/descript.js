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
        }
    };

    var notNull = function(item) {
        return !!item;
    };

    var toSelectorArray = function(arr) {
        return $(arr).map(function() {
            return this;
        });
    };

    var removeItem = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
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
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved. This method is chainable.
     * @param container
     * @param scriptAttributes
     */
    Descript.prototype.add = function(container, scriptAttributes) {
        this._process(scriptAttributes, function(scriptItemIndex, script) {
            script.container = container;
        });

        return this;
    };

    /**
     * Removes specified scripts from the default container.
     * @param scriptAttributes
     * @returns {Descript}
     */
    Descript.prototype.remove = function(scriptAttributes) {
        var scripts = this._scripts;

        this._process(scriptAttributes, function(scriptItemIndex) {
            removeItem(scripts, scriptItemIndex);
        });

        return this;
    };

    /**
     * Injects a script into the container specified by `container`. In terms of position, the
     * injected script is added directly after the script defined in `scriptAttribute`. The injected
     * script is added as an inline script.
     * @param scriptAttribute
     * @param scriptToInject
     */
    Descript.prototype.injectScript = function(scriptAttribute, scriptToInject) {
        var getInvoker = function() {
            return $('<script />')
                .attr('type', 'text/mobify-script')
                .html('(' + scriptToInject.toString() + ')();')[0];
        };

        var script = this._find(scriptAttribute);

        if (script) {
            this._scripts.splice(script.index + 1, 0, {container: script.script.container, $script: getInvoker()});
        }
    };

    /**
     * Returns the specific container requested by container,
     * or when no parameter is supplied returns all containers as name/value pairs.
     * @param container
     * @returns {*}
     */
    Descript.prototype.get = function(container) {
        var self = this;

        if (!this._containers) {
            this._containers = {};

            this._scripts.map(function(script) {
                var currentContainer = script.container;
                var $scripts = self._containers[currentContainer] || $();

                self._containers[currentContainer] = $scripts.add(script.$script);
            });
        }

        return container ? this._containers[container] : this._containers;
    };

    /**
     * Replaces string patterns in inline scripts.
     * @param scriptAttribute
     * @param pattern
     * @param replacement
     */
    Descript.prototype.replace = function(scriptAttribute, pattern, replacement) {
        var script = this._find(scriptAttribute).script;

        if (script) {
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

    /**
     * Processes each script in the container.
     * @param scriptAttributes
     * @param execute
     * @private
     */
    Descript.prototype._process = function(scriptAttributes, execute) {
        var scripts = this._scripts;

        for (var attribute in scriptAttributes) {
            if (scriptAttributes.hasOwnProperty(attribute)) {
                var attributePatterns = scriptAttributes[attribute].reverse();
                var searcher = this.searchers[attribute];
                var patternIndex = attributePatterns.length;

                while (patternIndex--) {
                    var scriptIndex = scripts.length;

                    while (scriptIndex--) {
                        var script = scripts[scriptIndex];

                        if (searcher($(script.$script), attributePatterns[patternIndex])) {
                            execute && execute(scriptIndex, script);
                        }
                    }
                }
            }
        }
    };

    /**
     * Searches scripts to find a single script based on the supplied scriptAttribute
     * @param scriptAttribute
     * @returns {{$script: (*|jQuery|HTMLElement), index: *}}
     * @private
     */
    Descript.prototype._find = function(scriptAttribute) {
        var scripts = this._scripts;
        var attribute = Object.keys(scriptAttribute)[0];
        var searcher = this.searchers[attribute];
        var scriptIndex = scripts.length;

        while (scriptIndex--) {
            var script = scripts[scriptIndex];

            if (searcher($(script.$script), scriptAttribute[attribute])) {
                return {
                    script: script,
                    index: scriptIndex
                };
            }
        }
    };

    return Descript;
}));
