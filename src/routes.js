const express = require('express');

const userController = require('../src/app/controllers/userController');
const mailController = require('../src/app/controllers/mailController');
const spotifyController = require('../src/app/controllers/spotifyController');
const playlistController = require('../src/app/controllers/playlistController');

const authMiddleware = require('../src/app/midleware/auth');

const appRoutes = express.Router();

appRoutes
  .post('/user/register', userController.create)
  .post('/user/signup', mailController.confirmation)
  .post('/user/login', userController.login)
  .get('/spotify/callback', spotifyController.callback);

appRoutes.use(authMiddleware);
appRoutes
  .get('/spotify/login', spotifyController.login)
  .get('/spotify/playlists', spotifyController.getPlaylists)
  .post('/playlist/create', playlistController.createHDJPlaylist);
module.exports = appRoutes;
