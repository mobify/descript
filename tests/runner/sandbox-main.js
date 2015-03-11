
require(['sandbox-config'], function() {
    require([
        '$',
        'descript'
    ],
    function($, Descript) {
        var dependencies = {};

        dependencies.$ = $;
        dependencies.Descript = Descript;

        window.dependencies = dependencies;

        window.parent.postMessage('loaded', '*');
    });
});
