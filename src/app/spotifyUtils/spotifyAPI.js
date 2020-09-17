const SpotifyWebApi = require('spotify-web-api-node');
const spotifyConfig = require('../../config/spotify');
const Profiles = require('../../models/Profiles');
const axios = require('axios');
const qs = require('qs');
const { response } = require('express');
const Users = require('../../models/User');

function generateAuthURL(user_id) {
  return `https://accounts.spotify.com/authorize?client_id=${
    spotifyConfig.clientId
  }&response_type=code&redirect_uri=${encodeURI(
    spotifyConfig.redirectUri
  )}&scope=user-read-private%20user-read-email&state=${user_id}&show_dialog=true`;
}
module.exports = {
  async getAuthURL(user_id) {
    try {
      var scopes = 'user-read-private user-read-email';
      var authorizeURL = generateAuthURL(user_id);
      return authorizeURL;
    } catch (error) {
      return 'ERROR';
    }
  },
  async getAccessToken(user_id) {
    try {
      console.log('GET ACCESS TOKEN');
      //Pegar refresh_token do perfil
      var profile = await Profiles.findAll({
        where: {
          user_id: user_id,
          active: true,
        },
      });
      var Users = profile[0];
      if (Date.now() / 1000 > Users.dataValues.token_expiration) {
        //fazer chamada de refresh
        const headers = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: spotifyConfig.clientId,
            password: spotifyConfig.clientSecret,
          },
        };
        console.log('AXIOS CALL');

        const body = {
          grant_type: 'refresh_token',
          refresh_token: Users.dataValues.refresh_token,
        };

        var resp;
        try {
          await axios({
            method: 'POST',
            url: `https://accounts.spotify.com/api/token`,
            data: qs.stringify(body),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization:
                'Basic ' +
                new Buffer.from(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`).toString(
                  'base64'
                ),
            },
          })
            .then((response) => {
              resp = response;
            })
            .catch((error) => {
              console.log(error);
            });
          await Profiles.update(
            {
              access_token: resp.data.access_token,
              token_expiration: Math.floor(3600 + Date.now() / 1000),
            },
            {
              where: {
                user_id: user_id,
                active: true,
              },
            }
          );
          return resp.data.access_token;
        } catch (error) {
          console.log(error);
        }
      } else {
        return Users.dataValues.access_token;
      }
    } catch (error) {
      console.log(error);
      return 'ERROR';
    }
  },
  async getPlaylistTrack(playlist_id, access_token) {
    try {
      var resp;
      console.log('GET TRACKS');
      const headers = {
        Authorization: 'Bearer ' + access_token,
      };
      await axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/playlists/${playlist_id}`,
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
      return resp;
    } catch (error) {
      return 'ERROR';
    }
  },
};
