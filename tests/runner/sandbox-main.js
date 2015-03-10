
require(['sandbox-config'], function() {
    require([
        '$',
        'descript'
    ],
    function($, ScriptManager) {
        var dependencies = {};

        dependencies.$ = $;
        dependencies.ScriptManager = ScriptManager;

        window.dependencies = dependencies;

        window.parent.postMessage('loaded', '*');
    });
});
