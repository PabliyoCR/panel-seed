const gulp = require('gulp')
const shell = require('gulp-shell')
const argv = require('yargs').argv;

const projectPath = argv.projectPath
const projectName = argv.projectName
const brand = argv.brand
const appID = `com.${projectName}.panel`
const panelWidth = argv.panelWidth
const panelHeight = argv.panelHeight
const panelOrientation = panelWidth > panelHeight ? 'landscape' : 'portrait'
const colorTheme = argv.colorTheme
const timezone = argv.timezone

// Setting Up Utilities
const utilitiesCommands = [
    `cp ${__dirname}/panel-seed/.gitignore ${projectPath}`,
]

// Setting Up Angular
const angularCommands = [
    `cd ${projectPath}`,
    `mkdir angular`,
    `cd angular`,
    `ng new ${projectName} --routing --style=scss`,
    `cd ${projectName}`,
    `ng g ${__dirname}/panel-seed/src/collection.json:panel-seed --font-size 24 --panel-orientation ${panelOrientation} --vw ${panelWidth} --vh ${panelHeight} --dry-run=false`,
    `sed -i '' 's/"styles": \\[/"styles": \\[ \\n${indent(14)}"node_modules\\/bootstrap\\/dist\\/css\\/bootstrap.min.css",/g' angular.json`,
    `sed -i '' 's/"scripts": \\[\\]/"scripts": \\["node_modules\\/bootstrap\\/dist\\/js\\/bootstrap.bundle.min.js"\\]/g' angular.json`,
    `sed -i '' 's/.*outputPath.*/${indent(12)}"outputPath": ".\\/..\\/..\\/webroot",/g' angular.json`,
    `ng g m slides --routing`,
]

const capacitorInitCommands = [
    `cd ${projectPath}`,
    `mkdir webroot`,
    `mkdir capacitor`,
    `cd capacitor`,
    `npm init -y`,
    `npm i @capacitor/cli -D`,
    `npm i @capacitor/core @capacitor-community/electron -S`,
    `npx cap init ${projectName} ${appID} --web-dir ../webroot`,
    `npx cap add @capacitor-community/electron`,
]

const electronConfigurationCommands = [
    `cd ${projectPath}/capacitor/electron`,
    `npm i electron-builder`,
    `sed -i '' 's/scripts": {/scripts": {\\n${indent(4)}"electron:build-windows": "npm run build \\&\\& electron-builder build --windows",\\n${indent(4)}"electron:build-mac": "npm run build \\&\\& electron-builder build --mac -c.mac.identity=null",/g' package.json`,
    `cd src`,
    `sed -i '' 's/x: this.mainWindowState.x,/fullscreen: true,\\n      resizable: false, \\n      minimizable: false, \\n      maximizable: false, \\n      fullscreenable: true, \\n      autoHideMenuBar: true,/g' setup.ts`,
    `sed -i '' 's/y: this.mainWindowState.y,//g' setup.ts`,
    `sed -i '' 's/width: this.mainWindowState.width,//g' setup.ts`,
    `sed -i '' 's/height: this.mainWindowState.height,//g' setup.ts`,
    `sed -i '' -e '/responseHeaders:/,+7d' setup.ts`,
    `sed -i '' 's/autoUpdater.checkForUpdatesAndNotify();/\\/\\/autoUpdater.checkForUpdatesAndNotify();/g' index.ts`,
    `awk -v x='\\ncontextBridge.exposeInMainWorld("API_ELECTRON", {\\n  name: "electron",\\n  plugins: contextApi,\\n  on: (channel : any, listener : any) => {\\n${indent(4)}ipcRenderer.on(channel, listener)\\n  },\\n  send: (channel : any, ...args : any) => {\\n${indent(4)}ipcRenderer.send(channel, ...args)\\n  },\\n  removeAllListeners: (channel : any) => {\\n${indent(4)}ipcRenderer.removeAllListeners(channel)\\n  }\\n});' '$0 == x {found=1} END {if(!found) print x} 1' rt/electron-rt.ts > tmp && mv tmp  rt/electron-rt.ts`,
    `cd ..`,
    `sed -i '' 's/  "keywords/  "build": {\\n${indent(4)}"appId": "${appID}",\\n${indent(4)}"productName": "${projectName}",\\n${indent(4)}"files": [\\n${indent(6)}"assets\\/\\*\\*",\\n${indent(6)}"build\\/\\*\\*",\\n${indent(6)}"preloader.js",\\n${indent(6)}"plugins\\/\\*\\*",\\n${indent(6)}"capacitor.config.json",\\n${indent(6)}"app\\/\\*\\*"\\n${indent(4)}],\\n${indent(4)}"mac": {\\n${indent(6)}"category": "public.app-category.medical",\\n${indent(6)}"target": {\\n${indent(8)}"target" : "default",\\n${indent(8)}"arch" : [\\n${indent(10)}"x64"\\n${indent(8)}]\\n${indent(6)}},\\n${indent(6)}"icon": "assets\\/appIcon.png"\\n${indent(4)}},\\n${indent(4)}"win": {\\n${indent(6)}"target": {\\n${indent(8)}"target" : "NSIS",\\n${indent(8)}"arch" : [\\n${indent(10)}"x64"\\n${indent(8)}]\\n${indent(6)}},\\n${indent(6)}"icon": "assets\\/icon-384x384.png"\\n${indent(4)}}\\n  },\\n  "keywords/g' package.json`,
]

const trackingCommands = [
    `cd  ${projectPath}`,
    `cp -R ${__dirname}/panel-seed/magma-panel-report capacitor/electron/assets`,
    `cp -a ${__dirname}/panel-seed/icons/${brand}/. capacitor/electron/assets/`,
    `cd capacitor/electron/src`,
    `sed -i '' '1 s/^/import { Report } from "..\\/assets\\/magma-panel-report\\/Report"\\n/' index.ts`,
    `awk -v x='const report = new Report();\\nipcMain.on("create-tracking", (event, track) => {\\n  report.insertRecord(track);\\n});\\n\\nipcMain.on("quit-application", () => {\\n  app.quit()\\n});' '$0 == x {found=1} END {if(!found) print x} 1' index.ts > tmp && mv tmp  index.ts`,
    `sed -i '' 's/import type { MenuItemConstructorOptions/import { ipcMain, MenuItemConstructorOptions/g' index.ts`,
    `cd ..`,
    `npm i sqlite3 moment-timezone`,
    `cd assets/magma-panel-report`,
    `sed -i '' 's/\\$\\$report-title\\$\\$/${projectName}/g' config.js`,
    `sed -i '' 's/\\$\\$report-theme\\$\\$/${colorTheme}/g' config.js`,
    `sed -i '' 's/\\$\\$report-timezone\\$\\$/${timezone}/g' config.js`,
]

gulp.task('setup-utilities', shell.task(utilitiesCommands.join('; ')))
gulp.task('setup-angular', shell.task(angularCommands.join('; ')))
gulp.task('setup-capacitor', shell.task(capacitorInitCommands.join('; ')))
gulp.task('setup-electron', shell.task(electronConfigurationCommands.join('; ')))
gulp.task('setup-tracking', shell.task(trackingCommands.join('; ')))

function indent(number) {
    return ' '.repeat(number)
}

exports.angularAndCapacitor = gulp.series(
    'setup-utilities',
    gulp.parallel('setup-angular', 'setup-capacitor'),
    gulp.parallel('setup-electron', 'setup-tracking')
)

exports.onlyCapacitor = gulp.series(
    'setup-utilities',
    'setup-capacitor',
    gulp.parallel('setup-electron', 'setup-tracking')
)