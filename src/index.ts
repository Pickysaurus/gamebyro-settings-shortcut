import { app as appIn, remote } from 'electron';
import { fs, util, selectors, log, types } from 'vortex-api';
import * as path from 'path';

const app = appIn || remote.app;

const gameSupport = {
  skyrim: {
    iniFiles: [
      path.join('{mygames}', 'Skyrim', 'Skyrim.ini'),
      path.join('{mygames}', 'Skyrim', 'SkyrimPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  enderal: {
    iniFiles: [
      path.join('{mygames}', 'Enderal', 'Enderal.ini'),
      path.join('{mygames}', 'Enderal', 'EnderalPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  skyrimse: {
    iniFiles: [
      path.join('{mygames}', 'Skyrim Special Edition', 'Skyrim.ini'),
      path.join('{mygames}', 'Skyrim Special Edition', 'SkyrimPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  skyrimvr: {
    iniFiles: [
      path.join('{mygames}', 'Skyrim VR', 'Skyrim.ini'),
      path.join('{mygames}', 'Skyrim VR', 'SkyrimVR.ini'),
      path.join('{mygames}', 'Skyrim VR', 'SkyrimPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  fallout3: {
    iniFiles: [
      path.join('{mygames}', 'Fallout3', 'Fallout.ini'),
      path.join('{mygames}', 'Fallout3', 'FalloutPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  fallout4: {
    iniFiles: [
      path.join('{mygames}', 'Fallout4', 'Fallout4.ini'),
      path.join('{mygames}', 'Fallout4', 'Fallout4Prefs.ini'),
      path.join('{mygames}', 'Fallout4', 'Fallout4Custom.ini'),
    ],
    iniFormat: 'winapi',
  },
  fallout4vr: {
    iniFiles: [
      path.join('{mygames}', 'Fallout4VR', 'Fallout4Custom.ini'),
      path.join('{mygames}', 'Fallout4VR', 'Fallout4Prefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  falloutnv: {
    iniFiles: [
      path.join('{mygames}', 'FalloutNV', 'Fallout.ini'),
      path.join('{mygames}', 'FalloutNV', 'FalloutPrefs.ini'),
    ],
    iniFormat: 'winapi',
  },
  oblivion: {
    iniFiles: [
      path.join('{mygames}', 'Oblivion', 'Oblivion.ini'),
    ],
    iniFormat: 'winapi',
  },
  morrowind: {
    iniFiles: [
      path.join('{game}', 'Morrowind.ini'),
    ],
    iniFormat: 'winapi',
  },
};

function main(context: types.IExtensionContext) {
  // Convert our placeholder path to the real thing. 
  const truePath = (iniPath: string, gamePath: string, myGames: string) => {
    if (iniPath.indexOf('{game}') !== -1) return iniPath.replace('{game}', gamePath);
    if (iniPath.indexOf('{mygames}') !== -1) return iniPath.replace('{mygames}', myGames);
  }
  
  // Get the "My Games" folder in the user's documents.
  const mygames = path.join(app.getPath('documents'), 'My Games');

  // Register a button for each INI. 
  const keys = Object.keys(gameSupport);
  keys.forEach((gameId) => {
    const iniFiles = gameSupport[gameId].iniFiles;
    iniFiles.forEach(ini => {
      context.registerAction('mod-icons', 200, 'changelog', {}, `View INI ${path.basename(ini)}`,
      () => {
        const state = context.api.store.getState();
        const gamePath = selectors.discoveryByGame(state, gameId).path;
        const iniPath : string = truePath(ini, gamePath, mygames);
        fs.statAsync(iniPath)
        .then(() => util.opn(iniPath).catch(() => undefined))
        .catch(() =>
          // INI file is missing.
          context.api.sendNotification({
            type: 'warning',
            id: 'ini-not-found',
            title: `${path.basename(ini)} does not exist`,
            message: 'Try running the game to create it.'
          })
        );
      },
      () => {
        // Only show the button for the relevant game. 
        const state = context.api.store.getState();
        const gameMode = selectors.activeGameId(state);
        return (gameMode === gameId);
      });
    });
  });
  return true;
}

export default main;
