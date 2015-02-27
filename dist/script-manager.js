
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
                });
    };

    ScriptManager.prototype.add = function(containerName, sources) {
        var defaultContainer = this._containers[DEFAULT_CONTAINER];
        var containerScripts = this._containers[containerName] || [];

        for (var key in sources) {
            if (sources.hasOwnProperty(key)) {
                var searcher = scriptSearchers[key];

                for (var i = 0; i < defaultContainer.length; i++) {
                    var scriptItem = defaultContainer[i];

                    if (searcher(scriptItem, key)) {
                        containerScripts.push(defaultContainer.splice(i, 1));
                    }
                }
            }
        }

        this._containers[containerName] = containerScripts;
    };

    ScriptManager.prototype.get = function(containerName) {
        return containerName ? this._containers[containerName] : this._containers;
    };

    return ScriptManager;
}));
