const express = require('express');

const userController = require('../src/app/controllers/userController');
const mailController = require('../src/app/controllers/mailController');
const spotifyController = require('../src/app/controllers/spotifyController');
const playlistController = require('../src/app/controllers/playlistController');

const authMiddleware = require('../src/app/midleware/auth');

const appRoutes = express.Router();

appRoutes
  .get('/', (req, res) => {
    res.status(200).send('Bem vindo ao Hang the DJ API');
  })
  .post('/user/register', userController.create)
  .post('/user/signup', mailController.confirmation)
  .post('/user/login', userController.login)
  .get('/spotify/callback', spotifyController.callback)
  .post('/user/forgot_password', mailController.forgotPassword)
  .post('/user/reset_password', userController.resetPassword);

appRoutes.use(authMiddleware);
appRoutes
  .get('/spotify/login', spotifyController.login)
  .get('/spotify/playlists', spotifyController.getPlaylists)
  .get('/spotify/playing_track/:playlist_id', spotifyController.getPlayingTrack)
  .post('/spotify/track/play', spotifyController.playTrack)
  .post('/spotify/track/pause', spotifyController.pauseTrack)
  .get('/spotify/playback_state', spotifyController.getPlaybackState)
  .get('/spotify/search/:query', spotifyController.searchPlaylistsAndTracks)
  .get('/spotify/search/', spotifyController.searchPlaylistsAndTracks)
  .get('/user/profile', userController.getActiveProfile)
  .post('/playlist/create', playlistController.createHDJPlaylist)
  .post('/playlist/add', playlistController.addToHDJPlaylist)
  .post('/track/upvote', playlistController.upVoteTrack)
  .post('/track/downvote', playlistController.downVoteTrack)
  .get('/playlists', playlistController.getHDJPlaylists)
  .get('/playlists/tracks/:playlist_id', playlistController.getHDJPlaylistTracks)
  .delete('/playlists/tracks', playlistController.deleteHDJPlaylist)
  .get('/playlists/tracks/unvoted/:playlist_id', playlistController.getUnvotedHDJTracks)
  .get('/playlists/track/unvoted/:playlist_id', playlistController.getNextUnvotedHDJTrack)
  .get('/playlists/track/unplayed/:playlist_id', playlistController.getNextUnplayedHDJTrack)
  .post('/playlists/group/add', playlistController.addToHDJGroups)
  .post('/playlists/reset', playlistController.resetHDJPlaylist);
module.exports = appRoutes;
