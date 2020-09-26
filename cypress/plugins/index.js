const path = require("path");
const fsExtra = require("fs-extra");


module.exports = (on, config) => {
  on("before:browser:launch", (browser, options) => {
    const downloadDirectory = path.join(__dirname, "..", "fixtures");
    fsExtra.emptyDirSync(downloadDirectory);

    if (browser.family === "chromium" && browser.name !== "electron") {
      options.preferences.default["download"] = {
        default_directory: downloadDirectory,
      };

      return options;
    }

    if (browser.name === "electron") {
      options.preferences["browser.helperApps.neverAsk.saveToDisk"] =
        "text/csv, application/zip";
      return options;
    }

    if (browser.family === "firefox") {
      options.preferences["browser.download.dir"] = downloadDirectory;
      options.preferences["browser.download.folderList"] = 2;

      // needed to prevent download prompt for text/csv files.
      options.preferences["browser.helperApps.neverAsk.saveToDisk"] =
        "text/csv, application/zip";

      return options;
    }
  });
}

const {downloadFile} = require('cypress-downloadfile/lib/addPlugin')
module.exports = (on, config) => {
  on('task', {downloadFile})
}