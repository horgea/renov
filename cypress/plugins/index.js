// cypress/plugins/index.js
const path = require('path')
const fs = require("fs")
const fsExtra = require('fs-extra')
const unzipper = require('unzipper')
const xlsx = require("node-xlsx").default


module.exports = (on, config) => {
  on('before:browser:launch', (browser, options) => {
    const downloadDirectory = path.join(__dirname, '..', 'downloads')
    fsExtra.emptyDirSync(downloadDirectory)

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      options.preferences.default['download'] = { default_directory: downloadDirectory }

      return options
    }

    if (browser.name === 'electron') {
      options.preferences['browser.helperApps.neverAsk.saveToDisk'] = 'text/csv, application/zip'
      return options
    }

    if (browser.family === 'firefox') {
      options.preferences['browser.download.dir'] = downloadDirectory
      options.preferences['browser.download.folderList'] = 2

      // needed to prevent download prompt for text/csv files.
      options.preferences['browser.helperApps.neverAsk.saveToDisk'] = 'text/csv, application/zip'

      return options
    }
  })

  on("task", {
    parseXlsx({ filePath }) {
      return new Promise((resolve, reject) => {
        try {
          const jsonData = xlsx.parse(fs.readFileSync(filePath))
          resolve(jsonData)
        } catch (e) {
          reject(e)
        }
      })
    }
  });

  on("task", {
    readFromZip(zipFile) {
      fs.createReadStream('cypress/archives_0e549074-b9de-4b0c-83b1-25e3584a6ce3.zip')
        .pipe(unzipper.Extract({ path: 'cypress/downloads/' }));
      // fs.createReadStream(zipFile)
      //   .pipe(unzipper.Parse())
      //   .on('entry', function (entry) {
      //     const fileName = entry.path;
      //     const type = entry.type; // 'Directory' or 'File'
      //     const size = entry.vars.uncompressedSize; // There is also compressedSize;
      //     console.log(fileName)
      //     entry.autodrain();

      //   });
    }
  })
}
