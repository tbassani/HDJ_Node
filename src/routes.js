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
  .get('/spotify/playing_track', spotifyController.getPlayingTrack)
  .put('/spotify/track/play', spotifyController.playTrack)
  .put('/spotify/track/pause', spotifyController.playTrack)
  .post('/playlist/create', playlistController.createHDJPlaylist)
  .post('/playlist/add', playlistController.addToHDJPlaylist)
  .post('/track/upvote', playlistController.upVoteTrack)
  .post('/track/downvote', playlistController.downVoteTrack)
  .get('/playlists', playlistController.getHDJPlaylists)
  .get('/playlists/tracks', playlistController.getHDJPlaylistTracks)
  .delete('/playlists/tracks', playlistController.deleteHDJPlaylist)
  .get('/playlists/tracks/unvoted', playlistController.getUnvotedHDJTracks);
module.exports = appRoutes;
