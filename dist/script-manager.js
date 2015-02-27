
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

    var scriptSearchers = {
        src: function(scriptItem, query) {
            return !scriptItem.inline && scriptItem.$script.is('[x-src*="' + query + '"]');
        },
        contains : function(scriptItem, query) {
            return scriptItem.inline && scriptItem.$script.html().indexOf(query) >= 0;
        }
    };

    var ScriptManager = function() {
        this._containers = {
            'default': []
        };
        this._processScripts();
    };

    ScriptManager.prototype._processScripts = function() {
        this._containers['default'] = $('script[x-src], script[type="text/mobify-script"]')
                .map(function(_, script) {
                    var $script = $(script);

                    return {
                        container: DEFAULT_CONTAINER,
                        $script: $script,
                        inline: !script.hasAttribute('x-src')
                    };
                }).get();
    };

    ScriptManager.prototype.add = function(containerName, querySources) {
        var defaultContainer = this._containers[DEFAULT_CONTAINER];
        var containerScripts = this._containers[containerName] || [];

        for (var searchType in querySources) {
            if (querySources.hasOwnProperty(searchType)) {
                var queries = querySources[searchType].reverse();
                var searcher = scriptSearchers[searchType];

                for (var queryIndex = 0, queriesLength = queries.length; queryIndex < queriesLength; queryIndex++) {
                    var scriptItemIndex = defaultContainer.length;

                    while (scriptItemIndex--) {
                        var scriptItem = defaultContainer[scriptItemIndex];

                        if (searcher(scriptItem, queries[queryIndex])) {
                            containerScripts[scriptItemIndex] = defaultContainer.splice(scriptItemIndex, 1);
                        }
                    }
                }
            }
        }

        this._containers[containerName] = containerScripts.filter(function(item) { return !!item; });
    };

    ScriptManager.prototype.get = function(containerName) {
        return containerName ? this._containers[containerName] : this._containers;
    };

    return ScriptManager;
}));
