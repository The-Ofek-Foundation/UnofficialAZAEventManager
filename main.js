'use strict';
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const fs = require('fs');

var dev = false;
var browser_dimensions;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  getBrowserDimensions(function(dimensions) {
    browser_dimensions = dimensions;
    createMainWindow();
  });
});

function createMainWindow() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: browser_dimensions.width,
    height: browser_dimensions.height
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  if (dev)
    mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function getBrowserDimensions(callback) {
  loadFromFile("browser-dimensions.txt", function(err, data) {
    if (err || data.length === 0)
      callback([800, 800]);
    else callback(JSON.parse(data));
  });
}

function loadFromFile(relative_path, callback) {
  fs.readFile(__dirname + "/" + relative_path, "utf8", function(err, data) {
    callback(err, data);
  });
}