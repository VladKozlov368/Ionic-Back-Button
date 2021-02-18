var exec = require('cordova/exec');
var cordova = require('cordova');
var channel = require('cordova/channel');

channel.createSticky('onBackButtonExt');

channel.onCordovaReady.subscribe(function () {
    initBackButton();

    console.log(channel);
});

function initBackButton() {
    if (cordova.platformId !== 'android') {
        return;
    }

    var success = function () {
        cordova.fireDocumentEvent('onBackButtonExt');
    };

    var error = function (e) {
        console.error('error', e);
    };

    exec(success, error, 'CordovaPluginBackButton', 'initBackButton');
}
