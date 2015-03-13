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

    var notNull = function(item) {
        return !!item;
    };

    var toSelectorArray = function(arr) {
        return $(arr).map(function() {
            return this;
        });
    };

    var scriptSearchers = {
        src: function($script, query) {
            return $script.attr('x-src') && $script.is('[x-src*="' + query + '"]');
        },
        contains: function($script, query) {
            return !$script.attr('x-src') && $script.html().indexOf(query) >= 0;
        }
    };

    var removeItem = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };

    /**
     * Initializes the script manager with a default container containing
     * all the scripts on the page.
     * @constructor
     */
    var Descript = function() {
        if (Descript.prototype._instance) {
            return Descript.prototype._instance;
        }

        Descript.prototype._instance = this;

        this._containers = {};
        this._containers[DEFAULT_CONTAINER] = $('script[x-src], script[type="text/mobify-script"]').remove();
    };

    /**
     * Singleton function returning an instance of a script manager.
     * @returns {*|Descript}
     */
    Descript.init = function() {
        return Descript.prototype._instance || (Descript.prototype._instance = new Descript());
    };

    Descript.prototype._process = function(scriptAttributes, execute) {
        var defaultContainer = this.get(DEFAULT_CONTAINER).toArray();

        for (var attribute in scriptAttributes) {
            if (scriptAttributes.hasOwnProperty(attribute)) {
                var attributePatterns = scriptAttributes[attribute].reverse();
                var searcher = scriptSearchers[attribute];
                var patternIndex = attributePatterns.length;

                while (patternIndex--) {
                    var scriptIndex = defaultContainer.length;

                    while (scriptIndex--) {
                        var $script = $(defaultContainer[scriptIndex]);

                        if (searcher($script, attributePatterns[patternIndex])) {
                            execute && execute(scriptIndex, $script);
                            removeItem(defaultContainer, scriptIndex);
                        }
                    }
                }
            }
        }

        this._containers[DEFAULT_CONTAINER] = toSelectorArray(defaultContainer);
    };

    Descript.prototype._find = function(containerScripts, scriptAttribute) {
        var attribute = Object.keys(scriptAttribute)[0];
        var searcher = scriptSearchers[attribute];
        var scriptIndex = containerScripts.length;

        while (scriptIndex--) {
            var $script = $(containerScripts[scriptIndex]);

            if (searcher($script, scriptAttribute[attribute])) {
                return {
                    $script: $script,
                    index: scriptIndex
                };
            }
        }
    };

    /**
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved. This method is chainable.
     * @param containerName
     * @param scriptAttributes
     */
    Descript.prototype.add = function(containerName, scriptAttributes) {
        var containerScripts = this.get(containerName) || [];

        this._process(scriptAttributes, function(scriptItemIndex, $script) {
            containerScripts[scriptItemIndex] = $script[0];
        });

        this._containers[containerName] = toSelectorArray(containerScripts.filter(notNull));

        return this;
    };

    /**
     * Removes specified scripts from the default container.
     * @param scriptAttributes
     * @returns {Descript}
     */
    Descript.prototype.remove = function(scriptAttributes) {
        this._process(scriptAttributes);

        return this;
    };

    /**
     * Injects a script into the container specified by `containerName`. In terms of position, the
     * injected script is added directly after the script defined in `scriptAttribute`. The injected
     * script is added as an inline script.
     * @param scriptName
     * @param containerName
     * @param scriptAttribute
     * @param scriptToInject
     */
    Descript.prototype.injectScript = function(scriptName, containerName, scriptAttribute, scriptToInject) {
        var containerScripts = this.get(containerName).toArray();
        var getInvoker = function() {
            return $('<script />')
                .attr('type', 'text/mobify-script')
                .html('(' + scriptToInject.toString() + ')();')[0];
        };

        var script = this._find(containerScripts, scriptAttribute);

        if (script) {
            containerScripts.splice(script.index + 1, 0, getInvoker());
            this._containers[containerName] = toSelectorArray(containerScripts);
        }
    };

    /**
     * Returns the specific container requested by containerName,
     * or when no parameter is supplied returns all containers as name/value pairs.
     * @param containerName
     * @returns {*}
     */
    Descript.prototype.get = function(containerName) {
        return containerName ? this._containers[containerName] : this._containers;
    };

    /**
     * Replaces string patterns in inline scripts. Patterns can be
     * @param containerName
     * @param scriptAttribute
     * @param pattern
     * @param replacement
     */
    Descript.prototype.replace = function(containerName, scriptAttribute, pattern, replacement) {
        var containerScripts = this.get(containerName).toArray();
        var script = this._find(containerScripts, scriptAttribute);

        if (script) {
            var patterns = [];

            if (arguments.length === 4) {
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

    return Descript;
}));
