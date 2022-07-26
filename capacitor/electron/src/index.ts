import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import { ipcMain, MenuItemConstructorOptions } from 'electron';
import { app, MenuItem, dialog } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';
const { exec } = require("child_process");

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';

var projectPath : string = '';

// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
  //autoUpdater.checkForUpdatesAndNotify();
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line

ipcMain.on("generate-panel", (event : any, args : any,) => {
  const command = `gulp ${args.generate} --projectPath ${projectPath.replace('/', '\\/')} --projectName ${args.projectName} --brand ${args.brand} --panelWidth ${args.panelWidth} --panelHeight ${args.panelHeight} --directory ${args.directory} --colorTheme ${args.colorTheme.replace('#', '\\#')} --timezone ${args.timezone.replace('/', '\\\\/')}`
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        event.reply("reply-generate-panel", { status : 'stderr'});
        return;
    }
    console.log(`stdout: ${stdout}`);
    event.reply("reply-generate-panel", { status : 'stdout'});
  })
});

ipcMain.on("get-project-path", (event : any, args : any,) => {
  console.log('args:', args)
  dialog.showOpenDialog({properties: ['openDirectory']}).then(res => {
    if(!res.canceled){
      projectPath = res.filePaths[0]
      event.reply("reply-project-path",  res.filePaths[0]);
    }
  })
});

ipcMain.on("quit-application", () => {
  app.quit()
});
