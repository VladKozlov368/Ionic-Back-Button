var path = require('path');
var fs = require('fs');

var walk = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
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
    var androidDir = path.resolve(process.cwd(), 'platforms\\android');
    console.log('start initializing the Back Button Plugin');
    var activityPath = undefined;

    if (fs.existsSync(androidDir)) {
        activityPath = walk(androidDir)[0];
        console.log('Found MainActivity.java');
    } else {
        throw Error(`Directory not found -> ${androidDir}`);
    }

    if (activityPath === undefined) {
        throw Error('File not found -> MainActivity.java in the platform/android folder');
    }

    var onBackPressed =
        `
  @Override
  public void onBackPressed() {
    if (CordovaPluginBackButton.onBackListener != null) {
      PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "");
      pluginResult.setKeepCallback(true);
      for (int i = 0; i < CordovaPluginBackButton.onBackListener.size(); i++) {
        CordovaPluginBackButton.onBackListener.get(i).sendPluginResult(pluginResult);
      }
    }
  }
}
`;

    console.log('Start adding the onBackPressed method');
    var data = fs.readFileSync(activityPath, {encoding: 'utf-8'});
    var dataArray = data.split('\n'); // convert file data in an array
    var searchKeyword = '}'; // we are looking for a line, contains, key word '}' in the file
    var lastIndex = -1;
    var importIndex = -1;
    var importPluginResultIndex = -1;
    var importPluginBackButtonIndex = -1;
    var classPluginResult = 'import org.apache.cordova.PluginResult;';
    var classPluginBackButton = 'import pro.inmost.ionic.back.button.CordovaPluginBackButton;';

    for (var index = 0; index < dataArray.length; index++) {
        var line = dataArray[index];

        if (line.includes('public void onBackPressed() {')) {
            lastIndex = -1;
            break;
        }

        if (line.includes('import')) {
            importIndex = index + 1;
        }

        if (line.includes(classPluginResult)) {
            importPluginResultIndex = index;
            continue;
        }

        if (line.includes(classPluginBackButton)) {
            importPluginBackButtonIndex = index;
            continue;
        }

        if (line.includes(searchKeyword)) { // check if a line contains the '}' keyword
            lastIndex = index; // found a line includes a '}' keyword
        }
    }

    if (lastIndex === -1) {
        console.log('Skip. onBackPressed method has already been added');
        return;
    }

    dataArray.splice(lastIndex, 1); // remove the keyword '}' from the data Array
    dataArray = addImport(importIndex, importPluginResultIndex, classPluginResult, dataArray);
    dataArray = addImport(importIndex, importPluginBackButtonIndex, classPluginBackButton, dataArray);

    var updatedData = dataArray.join('\n');
    fs.writeFileSync(activityPath, updatedData);
    fs.writeFileSync(activityPath, onBackPressed, {flag: 'a'});
    console.log('Adding onBackPressed method was successful');
};

function addImport(importIndex, pluginIndex, importPath, data) {
    if (pluginIndex !== -1) {
        return data;
    }

    return insert(data, importIndex, importPath);
}

function insert(arr, index, newItem) {
    return [
        // part of the array before the specified index
        ...arr.slice(0, index),
        // inserted item
        newItem,
        // part of the array after the specified index
        ...arr.slice(index),
    ];
}
