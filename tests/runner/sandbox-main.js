
require(['sandbox-config'], function() {
    require([
        '$',
        'script-manager'
    ],
    function($, ScriptManager) {
        var dependencies = {};

        dependencies.$ = $;
        dependencies.ScriptManager = ScriptManager;

        window.dependencies = dependencies;

        window.parent.postMessage('loaded', '*');
    });
});
