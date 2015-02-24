
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
    var selector = {
        SRC: '[x-src*="{0}"]',
        CONTAINS: ':contains("{0}")'
    };

    var ScriptManager = function() {
        this._processScripts();
    };

    ScriptManager.prototype._processScripts = function() {
        this.scripts = $('script[x-src], script[type="text/mobify-script"]')
                .map(function(_, script) {
                    var $script = $(script);

                    return {
                        container: 'default',
                        $script: $script,
                        inline: !script.hasAttribute('x-src')
                    };
                });
    };

    return ScriptManager;
}));
