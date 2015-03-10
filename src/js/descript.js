
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
    var instance;

    var notNull = function(item) {
        return !!item;
    };

    var toSelectorArray = function(arr) {
        return $(arr).map(function() {
            return this;
        });
    };

    var scriptSearchers = {
        src: function(script, query) {
            return script.hasAttribute('x-src') && $(script).is('[x-src*="' + query + '"]');
        },
        contains : function(script, query) {
            return !script.hasAttribute('x-src') && $(script).html().indexOf(query) >= 0;
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
    var ScriptManager = function() {
        this._containers = {};
        this._containers[DEFAULT_CONTAINER] = $('script[x-src], script[type="text/mobify-script"]');
    };

    /**
     * Singleton function returning an instance of a script manager.
     * @returns {*|ScriptManager}
     */
    ScriptManager.init = function() {
        return instance || (instance = new ScriptManager());
    };

    ScriptManager.prototype._process = function(scriptAttributes, execute) {
        var defaultContainer = this._containers[DEFAULT_CONTAINER].get();

        for (var attribute in scriptAttributes) {
            if (scriptAttributes.hasOwnProperty(attribute)) {
                var attributePatterns = scriptAttributes[attribute].reverse();
                var searcher = scriptSearchers[attribute];
                var patternIndex = attributePatterns.length;

                while (patternIndex--) {
                    var scriptItemIndex = defaultContainer.length;

                    while (scriptItemIndex--) {
                        var $script = defaultContainer[scriptItemIndex];

                        if (searcher($script, attributePatterns[patternIndex])) {
                            execute && execute(scriptItemIndex, $script);
                            removeItem(defaultContainer, scriptItemIndex);
                        }
                    }
                }
            }
        }

        this._containers[DEFAULT_CONTAINER] = toSelectorArray(defaultContainer);
    };

    /**
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved. This method is chainable.
     * @param containerName
     * @param scriptAttributes
     */
    ScriptManager.prototype.add = function(containerName, scriptAttributes) {
        var containerScripts = this._containers[containerName] || [];

        this._process(scriptAttributes, function(scriptItemIndex, $script) {
            containerScripts[scriptItemIndex] = $script;
        });

        this._containers[containerName] = toSelectorArray(containerScripts.filter(notNull));

        return this;
    };

    ScriptManager.prototype.remove = function(scriptAttributes) {
        this._process(scriptAttributes);

        return this;
    };

    /**
     * Returns the specific container requested by containerName,
     * or when no parameter is supplied returns all containers as name/value pairs.
     * @param containerName
     * @returns {*}
     */
    ScriptManager.prototype.get = function(containerName) {
        return containerName ? this._containers[containerName] : this._containers;
    };

    return ScriptManager;
}));