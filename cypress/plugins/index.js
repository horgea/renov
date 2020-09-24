// cypress/plugins/index.js
const path = require('path')
const fs = require("fs")
const xlsx = require("node-xlsx").default

module.exports = (on, config) => {
  on('before:browser:launch', (browser, options) => {
    const downloadDirectory = path.join(__dirname, '..', 'downloads')

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      options.preferences.default['download'] = { default_directory: downloadDirectory }

      return options
    }

    if(browser.name === 'electron') {
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
  })
}