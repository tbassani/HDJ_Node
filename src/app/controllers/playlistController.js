const SpotifyWebApi = require('spotify-web-api-node');

const spotifyConfig = require('../../config/spotify');
const HDJPlaylists = require('../../models/HDJPlaylists');
const HDJTracks = require('../../models/HDJTracks');
const UserHistory = require('../../models/UserHistory');
const spotifyUtils = require('../spotifyUtils/spotifyAPI');

const { Op } = require('sequelize');

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
            console.log(element);
            await HDJTracks.create({
              user_id: req.user_id,
              playlist_id: hdjPlaylist.dataValues.id,
              external_track_id: element.track.id,
              score: 0,
              track_name: element.track.name,
              was_played: false,
              duration: element.track.duration_ms,
              deleted_at: null,
              album_name: element.track.album.name,
              album_art: element.track.album.images[0].url,
              artist_name: element.track.artists[0].name,
            });
          }
        }
      });
      res.status(200).json({ success: `Playlist ${hdjPlaylist.dataValues.id} created` });
    } catch (error) {
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async addToHDJPlaylist(req, res, nex) {
    try {
      const { playlists, hdj_playlist_id } = req.body;
      var token = await spotifyUtils.getAccessToken(req.user_id);

      console.log(token);
      playlists.items.forEach(async (playlist) => {
        console.log('PLAYLIST id:' + playlist.id);
        var spotifyRawTracks = await spotifyUtils.getPlaylistTrack(playlist.id, token);
        var tracks = spotifyRawTracks.tracks.items;
        for (const key in tracks) {
          if (tracks.hasOwnProperty(key)) {
            const element = tracks[key];
            console.log('KEY:' + key);
            const [hdjtrack, created] = await HDJTracks.findOrCreate({
              where: {
                playlist_id: hdj_playlist_id,
                external_track_id: element.track.id,
              },
              defaults: {
                user_id: req.user_id,
                playlist_id: hdj_playlist_id,
                external_track_id: element.track.id,
                score: 0,
                was_played: false,
                track_name: element.track.name,
                duration: element.track.duration_ms,
                deleted_at: null,
                album_name: element.track.album.name,
                album_art: element.track.album.images[0].url,
                artist_name: element.track.artists[0].name,
              },
            });
            if (!created) {
              console.log('NOT CREATED');
              var hdjUpTrack = await HDJTracks.findByPk(hdjtrack.id, { raw: true });
              console.log(req.user_id);
              if (req.user_id !== hdjUpTrack.user_id) {
                console.log('INCREMENT');
                await HDJTracks.increment('score', {
                  by: 1,
                  where: { id: hdjUpTrack.id },
                });
              }
            }
          }
        }
        res.status(200).json({ success: 'Playlist updated' });
      });
    } catch (error) {
      res.status(400).json({ error: 'Error updating playlist' });
    }
  },
  async upVoteTrack(req, res, next) {
    try {
      const { playlist_id, track_id } = req.body;
      await HDJTracks.increment('score', {
        by: 1,
        where: { id: track_id },
      });
      const [userHistory, created] = await UserHistory.findOrCreate({
        where: {
          hdj_playlist_id: playlist_id,
          hdj_track_id: track_id,
        },
        defaults: {
          user_id: req.user_id,
          hdj_track_id: track_id,
          hdj_playlist_id: playlist_id,
          up_vote: 1,
          down_vote: 0,
        },
      });
      if (!created) {
        await UserHistory.increment('up_vote', {
          by: 1,
          where: { id: userHistory.id },
        });
      }
      res.status(200).json({ success: `Track liked` });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error on upvote Track' });
    }
  },
  async downVoteTrack(req, res, next) {
    try {
      const { playlist_id, track_id } = req.body;
      await HDJTracks.increment('score', {
        by: -1,
        where: { id: track_id },
      });
      const [userHistory, created] = await UserHistory.findOrCreate({
        where: {
          hdj_playlist_id: playlist_id,
          hdj_track_id: track_id,
        },
        defaults: {
          user_id: req.user_id,
          hdj_track_id: track_id,
          hdj_playlist_id: playlist_id,
          up_vote: 0,
          down_vote: 1,
        },
      });
      if (!created) {
        await UserHistory.increment('down_vote', {
          by: -1,
          where: { id: userHistory.id },
        });
      }
      res.status(200).json({ success: `Track disliked` });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async getHDJPlaylists(req, res, next) {
    try {
      var playlists = await HDJPlaylists.findAll({ where: { user_id: req.user_id }, raw: true });
      res.status(200).json(playlists);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting playlists' });
    }
  },
  async getHDJPlaylistTracks(req, res, next) {
    try {
      const { playlist_id } = req.body;
      var tracks = await HDJTracks.findAll({
        where: { playlist_id: playlist_id },
        raw: true,
        order: [['score', 'DESC']],
      });
      res.status(200).json(tracks);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting tracks' });
    }
  },
  async getUnvotedHDJTracks(req, res, next) {
    try {
      const { playlist_id } = req.body;
      var userHistory = await UserHistory.findAll({
        attributes: ['hdj_track_id'],
        where: {
          user_id: req.user_id,
          hdj_playlist_id: playlist_id,
        },
        raw: true,
      });

      var array = [];
      var i = 0;
      userHistory.forEach((track) => {
        array[i++] = track.hdj_track_id;
      });
      console.log(array);
      var tracks = await HDJTracks.findAll({
        where: {
          playlist_id: playlist_id,
          id: { [Op.notIn]: array },
          was_played: false,
        },
        raw: true,
        order: [['score', 'DESC']],
      });
      if (tracks.length === 0) {
        tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
          },
          raw: true,
          order: [['score', 'DESC']],
        });
        await UserHistory.destroy({
          where: {
            user_id: req.user_id,
            hdj_playlist_id: playlist_id,
          },
        });
      }
      res.status(200).json(tracks);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting unvoted tracks' });
    }
  },
};
