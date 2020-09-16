const SpotifyWebApi = require('spotify-web-api-node');
const spotifyConfig = require('../../config/spotify');
const Profiles = require('../../models/Profiles');
const axios = require('axios');
const { response } = require('express');
const Users = require('../../models/User');
const spotifyUtils = require('../../app/spotifyUtils/spotifyAPI');

function generateAuthURL(user_id) {
  return `https://accounts.spotify.com/authorize?client_id=${
    spotifyConfig.clientId
  }&response_type=code&redirect_uri=${encodeURI(
    spotifyConfig.redirectUri
  )}&scope=user-read-private%20user-read-email&state=${user_id}&show_dialog=true`;
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
      var scopes = 'user-read-private user-read-email';
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
      console.log('BODY------------------------------');
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
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error forming authorization URL' });
    }
  },
};
