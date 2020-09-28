const SpotifyWebApi = require('spotify-web-api-node');
const spotifyConfig = require('../../config/spotify');
const Profiles = require('../../models/Profiles');
const axios = require('axios');
const { response } = require('express');
const Users = require('../../models/User');
const spotifyUtils = require('../../app/spotifyUtils/spotifyAPI');
const HDJTracks = require('../../models/HDJTracks');

function generateAuthURL(user_id) {
  return `https://accounts.spotify.com/authorize?client_id=${
    spotifyConfig.clientId
  }&response_type=code&redirect_uri=${encodeURI(
    spotifyConfig.redirectUri
  )}&scope=user-read-private%20user-read-email%20streaming%20app-remote-control%20user-read-currently-playing%20user-read-playback-state%20user-modify-playback-state&state=${user_id}&show_dialog=true`;
}

async function refreshAccessToken(user_id, refresh_token, profile_id) {
  console.log(await spotifyApi.getAccessToken());
  const token = await spotifyApi.refreshAccessToken();
  await Profiles.update(
    { access_token: spotifyApi.getAccessToken() },
    {
      where: {
        lastName: null,
      },
    }
  );
  return token;
}

async function checkAccessToken() {}

module.exports = {
  async login(req, res, nex) {
    try {
      var authorizeURL = generateAuthURL(req.user_id);
      res.Authorization = req.headers.authorization;
      res.send(authorizeURL);
    } catch (error) {
      res.status(400).json({ error: 'Error forming authorization URL' });
    }
  },
  async callback(req, res, next) {
    const { code, state } = req.query;
    try {
      var credentials = {
        clientId: spotifyConfig.clientId,
        clientSecret: spotifyConfig.clientSecret,
        redirectUri: spotifyConfig.redirectUri,
      };
      var spotifyApi = new SpotifyWebApi(credentials);
      var data = await spotifyApi.authorizationCodeGrant(code);
      const headers = {
        Authorization: 'Bearer ' + data.body['access_token'],
      };
      var display_name;
      await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me',
        headers: headers,
      })
        .then((response) => {
          display_name = response.data.display_name;
        })
        .catch((error) => {
          console.log(error);
        });

      console.log(display_name);
      await Profiles.update(
        { active: false },
        {
          where: {
            user_id: state,
          },
        }
      );
      await Profiles.create({
        user_id: state,
        user_external_id: display_name,
        service: 'Spotify',
        access_token: data.body['access_token'],
        refresh_token: data.body['refresh_token'],
        token_expiration: Math.floor(3600 + Date.now() / 1000),
        active: true,
        deleted_at: null,
      });

      res.status(200).send('Welcome!');
    } catch (err) {
      console.log(err);
      res.redirect('/#/error/invalid token');
    }
  },

  async getPlaylists(req, res, nex) {
    try {
      const token = await spotifyUtils.getAccessToken(req.user_id);
      console.log(token);
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      var display_name;
      await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: headers,
      })
        .then((response) => {
          const { items } = response.data;
          res.status(200).json(items);
          display_name = response.data.display_name;
        })
        .catch((error) => {
          console.log(error.response.status);
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error forming authorization URL' });
    }
  },
  async playTrack(req, res, nex) {
    try {
      console.log('PLAY TRACK');
      const token = await spotifyUtils.getAccessToken(req.user_id);
      console.log(token);
      const { track_id, playlist_id } = req.body;
      console.log(req.body);
      var track = await HDJTracks.findAll({
        where: {
          playlist_id: playlist_id,
          external_track_id: track_id,
        },
        raw: true,
      });
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      const body = {
        uris: [`spotify:track:${track[0].external_track_id}`],
      };
      await axios({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: headers,
        data: body,
      })
        .then((response) => {
          res.status(200).json({ success: `Playing Track ${track[0].track_name}` });

          HDJTracks.update(
            { was_played: true },
            {
              where: {
                playlist_id: playlist_id,
                external_track_id: track_id,
              },
            }
          );
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({ error: 'Error playing Track' });
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error playing Track' });
    }
  },
  async pauseTrack(req, res, nex) {
    try {
      console.log('PAUSE TRACK');
      const token = await spotifyUtils.getAccessToken(req.user_id);
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      await axios({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/player/pause',
        headers: headers,
      })
        .then((response) => {
          res.status(200).json({ success: 'Track paused' });
        })
        .catch((error) => {
          console.log('ERROR FROM PAUSE');
          console.log(error);
          res.status(400).json({ error: 'Error pausing Track' });
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error pausing Track' });
    }
  },
  async getPlayingTrack(req, res, nex) {
    try {
      const token = await spotifyUtils.getAccessToken(req.user_id);
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      var track = {};
      await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: headers,
      })
        .then((response) => {
          if (response.data.item) {
            track = {
              artist_name: response.data.item.artists[1]
                ? response.data.item.artists[0].name + ', ' + response.data.item.artists[1].name
                : response.data.item.artists[0].name,
              album_name: response.data.item.album.name,
              duration: response.data.item.duration_ms,
              track_name: response.data.item.name,
              album_art: response.data.item.album.images[0].url,
              external_track_id: response.data.item.id,
              is_playing: response.data.is_playing,
              progress_ms: response.data.progress_ms,
            };
          }
          res.status(200).json(track);
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({ error: 'Error getting Track' });
        });
      console.log('GOT TRACK');
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting Track' });
    }
  },
  async getPlaybackState(req, res, next) {
    try {
      var resp;
      const token = await spotifyUtils.getAccessToken(req.user_id);
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/player',
        headers: headers,
      })
        .then((response) => {
          data = response.data;
          resp = data;
        })
        .catch((error) => {
          console.log('ERROR');
          console.log(error);
        });
      res.status(200).json(resp);
    } catch (error) {
      res.status(400).json({ error: 'Error pausing Track' });
    }
  },
};
