
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

    var scriptSearchers = {
        src: function(script, query) {
            return script.hasAttribute('x-src') && $(script).is('[x-src*="' + query + '"]');
        },
        contains : function(script, query) {
            return !script.hasAttribute('x-src') && $(script).html().indexOf(query) >= 0;
        }
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

    /**
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved. This method is chainable.
     * @param containerName
     * @param scriptPatterns
     */
    ScriptManager.prototype.add = function(containerName, scriptPatterns) {
        var defaultContainer = this._containers[DEFAULT_CONTAINER].get();
        var containerScripts = this._containers[containerName] || [];

        for (var searchType in scriptPatterns) {
            if (scriptPatterns.hasOwnProperty(searchType)) {
                var patterns = scriptPatterns[searchType].reverse();
                var searcher = scriptSearchers[searchType];
                var patternIndex = patterns.length;

                while (patternIndex--) {
                    var scriptItemIndex = defaultContainer.length;

                    while (scriptItemIndex--) {
                        var $script = defaultContainer[scriptItemIndex];

                        if (searcher($script, patterns[patternIndex])) {
                            containerScripts[scriptItemIndex] = defaultContainer.splice(scriptItemIndex, 1)[0];
                        }
                    }
                }
            }
        }

        this._containers[containerName] = containerScripts.filter(function(item) { return !!item; });

        return this;
    };

    /**
     * Returns the specific container requested by containerName,
     * or returns all containers.
     * @param containerName
     * @returns {*}
     */
    ScriptManager.prototype.get = function(containerName) {
        return containerName ? this._containers[containerName] : this._containers;
    };

    return ScriptManager;
}));
