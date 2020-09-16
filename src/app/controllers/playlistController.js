const SpotifyWebApi = require('spotify-web-api-node');

const spotifyConfig = require('../../config/spotify');
const HDJPlaylists = require('../../models/HDJPlaylists');
const HDJTracks = require('../../models/HDJTracks');
const Profiles = require('../../models/Profiles');
const spotifyUtils = require('../spotifyUtils/spotifyAPI');

module.exports = {
  async createHDJPlaylist(req, res, nex) {
    try {
      console.log('CREATE HDJ PLAYLIST');
      const { playlists, name } = req.body;
      var hdjPlaylist = await HDJPlaylists.create({
        user_id: req.user_id,
        playlist_name: name,
        link: null,
        deleted_at: null,
      });
      console.log(hdjPlaylist);
      var token = await spotifyUtils.getAccessToken(req.user_id);
      console.log('NEW TOKEN');
      console.log(token);
      playlists.items.forEach(async (playlist) => {
        console.log('PLAYLIST id:' + playlist.id);
        var spotifyRawTracks = await spotifyUtils.getPlaylistTrack(playlist.id, token);
        var tracks = spotifyRawTracks.tracks.items;
        for (const key in tracks) {
          if (tracks.hasOwnProperty(key)) {
            const element = tracks[key];
            await HDJTracks.create({
              user_id: req.user_id,
              playlist_id: hdjPlaylist.dataValues.id,
              external_track_id: element.track.id,
              score: 0,
              duration: element.track.duration_ms,
              deleted_at: null,
              album_name: element.track.album.name,
              album_art: element.track.album.images[0].url,
              artist_name: element.track.artists[0].name,
            });
          }
        }
      });
    } catch (error) {
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async addToHDJPlaylist(req, res, nex) {
    try {
      const { playlists, hdj_playlist_id } = req.body;
      console.log(playlists);
      res.status(200).json({ success: 'Playlist created' });
    } catch (error) {
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
};
