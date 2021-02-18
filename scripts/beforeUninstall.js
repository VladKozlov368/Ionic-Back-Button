const path = require('path');
const fs = require('fs');

const walk = function (dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else {
            /* Is a file */
            if (file.includes('MainActivity.java')) {
                results.push(file);
            }
        }
    });
    return results;
};

module.exports = function (_) {
    const androidDir = path.resolve(process.cwd(), 'platforms\\android');
    console.log('start uninstalling the Back Button Plugin');
    let activityPath = undefined;

    if (fs.existsSync(androidDir)) {
        activityPath = walk(androidDir)[0];
        console.log('Found MainActivity.java');
    } else {
        throw Error(`Directory not found -> ${androidDir}`);
    }

    if (activityPath === undefined) {
        throw Error('File not found -> MainActivity.java in the platform/android folder');
    }

    console.log('Start deleting the onBackPressed method');
    var data = fs.readFileSync(activityPath, {encoding: 'utf-8'});
    var dataArray = data.split('\n');
    var searchKeyword = 'public void onBackPressed() {';
    var classPluginBackButton = 'import pro.inmost.ionic.back.button.CordovaPluginBackButton;';
    var lastIndex = -1;
    var importPluginBackButtonIndex = -1;

    for (var index = 0; index < dataArray.length; index++) {
        var line = dataArray[index];

        if (line.includes(classPluginBackButton)) {
            importPluginBackButtonIndex = index;
            continue;
        }

        if (line.includes(searchKeyword)) {
            lastIndex = index - 1; // -1 should also take the Override word
        }
    }

    dataArray.splice(lastIndex, 10);
    dataArray.splice(importPluginBackButtonIndex, 1);

    const updatedData = dataArray.join('\n');
    fs.writeFileSync(activityPath, updatedData);
    console.log('Deleting onBackPressed method was successful');
};
