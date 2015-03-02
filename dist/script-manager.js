
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
        contains : function(scriptItem, query) {
            return !script.hasAttribute('x-src') && $(script).html().indexOf(query) >= 0;
        }
    };

    /**
     * Initializes the script manager with a default container containing all the
     * scripts on the page.
     * @constructor
     */
    var ScriptManager = function() {
        this._containers = {};
        this._containers[DEFAULT_CONTAINER] = $('script[x-src], script[type="text/mobify-script"]');
    };

    ScriptManager.init = function() {
        return instance || (instance = new ScriptManager());
    };

    /**
     * Adds scripts from the default container into the specified custom container.
     * Ensures DOM order of scripts is preserved.
     * @param containerName
     * @param scriptPatterns
     */
    ScriptManager.prototype.add = function(containerName, scriptPatterns) {
        var defaultContainer = this._containers[DEFAULT_CONTAINER].get();
        var containerScripts = this._containers[containerName] || [];

        for (var searchType in scriptPatterns) {
            if (scriptPatterns.hasOwnProperty(searchType)) {
                var queries = scriptPatterns[searchType].reverse();
                var searcher = scriptSearchers[searchType];
                var queryIndex = queries.length;

                while (queryIndex--) {
                    var scriptItemIndex = defaultContainer.length;

                    while (scriptItemIndex--) {
                        var scriptItem = defaultContainer[scriptItemIndex];

                        if (searcher(scriptItem, queries[queryIndex])) {
                            containerScripts[scriptItemIndex] = defaultContainer.splice(scriptItemIndex, 1)[0];
                        }
                    }
                }
            }
        }

        this._containers[containerName] = containerScripts.filter(function(item) { return !!item; });
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
