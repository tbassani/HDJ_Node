const SpotifyWebApi = require('spotify-web-api-node');
const spotifyConfig = require('../../config/spotify');
const Profiles = require('../../models/Profiles');
const axios = require('axios');
const { response } = require('express');
const spotifyUtils = require('../../app/spotifyUtils/spotifyAPI');
const HDJTracks = require('../../models/HDJTracks');
const HDJPlaylists = require('../../models/HDJPlaylists');
const TopTracks = require('../../models/TopTracks');

function generateAuthURL(user_id) {
  return `https://accounts.spotify.com/authorize?client_id=${
    spotifyConfig.clientId
  }&response_type=code&redirect_uri=${encodeURI(
    spotifyConfig.redirectUri
  )}&scope=user-read-private%20user-read-email%20streaming%20app-remote-control%20user-library-modify%20user-read-currently-playing%20user-read-playback-state%20user-modify-playback-state&state=${user_id}&show_dialog=true`;
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

      res.status(200).send('Bem vindo ao Hang the DJ! Você já pode fechar esta janela.');
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
      if (track_id) {
        console.log(req.body);

        const headers = {
          Authorization: 'Bearer ' + token,
        };
        const body = {
          uris: [`spotify:track:${track_id}`],
        };
        await axios({
          method: 'PUT',
          url: 'https://api.spotify.com/v1/me/player/play',
          headers: headers,
          data: body,
        })
          .then((response) => {
            console.log('Success playing track');
            res.status(200).json({ success: `Playing Track ${track_id}` });

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
            console.log('THIS IS A ERROR');
            console.log(error.response);
            res.status(error.response.status).json({ error: 'Error playing Track' });
          });
      } else {
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        await axios({
          method: 'PUT',
          url: 'https://api.spotify.com/v1/me/player/play',
          headers: headers,
        })
          .then((response) => {
            res.status(200).json({ success: `Playing Track` });
          })
          .catch((error) => {
            res.status(error.response.status).json({ error: 'Error playing Track' });
          });
      }
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
      const { playlist_id } = req.params;
      const response = await HDJPlaylists.findByPk(playlist_id);
      //console.log(response);
      if (!response || response.length <= 0) {
        res.status(400).json({ error: 'Error getting Track' });
      } else {
        const token = await spotifyUtils.getAccessToken(response.dataValues.user_id);
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        var track = {};
        try {
          let response = await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: headers,
          });
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
        } catch (error) {
          console.log(error);
          res.status(400).json({ error: 'Error getting Track' });
        }
        console.log('GOT TRACK');
      }
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

  async addTracksToQueue(req, res, nex) {
    try {
      //Inicialização de variáveis
      console.log('ADD TRACKS TO QUEUE');
      const { playlist_id, tracks } = req.body;
      const token = await spotifyUtils.getAccessToken(req.user_id);
      console.log(tracks);
      var i = 0;
      const headers = {
        Authorization: 'Bearer ' + token,
      };

      for (const trackId of tracks) {
        console.log('TRACKID: ' + trackId);
        var uri_data = {
          uri: `spotify:track:${trackId}`,
        };
        try {
          await axios({
            method: 'POST',
            url: 'https://api.spotify.com/v1/me/player/queue',
            headers: headers,
            params: uri_data,
          });
        } catch (error) {
          console.log('ADD TO TRACK ERROR');
          //console.log(error);
        }

        await HDJTracks.update(
          { was_played: true },
          {
            where: {
              playlist_id: playlist_id,
              external_track_id: trackId,
            },
          }
        );
      }

      res.status(200).json({ success: 'track added' });
      //}
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error adding Track' });
    }
  },

  async addTopTracksToQueue(req, res, nex) {
    try {
      //Inicialização de variáveis
      console.log('ADD TOP TRACKS TO QUEUE');
      const { playlist_id, tracks } = req.body;
      const token = await spotifyUtils.getAccessToken(req.user_id);
      var i = 0;
      const headers = {
        Authorization: 'Bearer ' + token,
      };

      for (const track of tracks) {
        var uri_data = {
          uri: `spotify:track:${track.externalId}`,
        };
        await axios({
          method: 'POST',
          url: 'https://api.spotify.com/v1/me/player/queue',
          headers: headers,
          params: uri_data,
        });
      }
      for (const track of tracks) {
        await HDJTracks.update(
          { was_played: true },
          {
            where: {
              playlist_id: playlist_id,
              external_track_id: track.externalId,
            },
          }
        );
      }
      res.status(200).json({ success: 'track added to queue' });
      //}
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error adding Track to queue' });
    }
  },

  async setTopTracks(req, res, nex) {
    try {
      //Inicialização de variáveis
      console.log('SET TOP TRACKS');
      const { playlist_id, tracks } = req.body;
      await TopTracks.destroy({
        where: {
          playlist_id: playlist_id,
        },
      });
      for (const track of tracks) {
        await TopTracks.create({
          user_id: req.user_id,
          playlist_id: playlist_id,
          external_track_id: track.externalId,
          score: track.score,
          track_name: track.title,
          was_played: false,
          duration: track.duration,
          deleted_at: null,
          album_name: track.albumName,
          album_art: track.artURL,
          artist_name: track.artists,
          genre: track.genre,
        });
      }

      res.status(200).json({ success: 'top tracks set' });
      //}
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error setting top tracks' });
    }
  },

  async getTopTracks(req, res, nex) {
    try {
      //Inicialização de variáveis
      console.log('GET TOP TRACKS TO QUEUE');
      const { playlist_id } = req.body;

      const topTracks = await TopTracks.findAll(
        { was_played: true },
        {
          where: {
            playlist_id: playlist_id,
          },
          raw: true,
        }
      );

      res.status(200).json(topTracks);
      //}
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting Top Tracks' });
    }
  },

  async removeTracksFromQueue(req, res, nex) {
    console.log('DELETE TRACKS FROM QUEUE');
    const { owner_id } = req.body;
    const token = await spotifyUtils.getAccessToken(req.user_id);
    var i = 0;
    const headers = {
      Authorization: 'Bearer ' + token,
      contenttype: 'application/json;',
    };
    var tracks = [];
    try {
      tracks = await TopTracks.findAll({
        where: {
          user_id: owner_id,
        },
        raw: true,
      });
    } catch (error) {
      console.log('REMOVE TRACK FROM QUEUE ERROR');
      console.log(error);
      res.status(400).json({ error: 'Error removing Top Track' });
    }

    for (const track of tracks) {
      try {
        await axios({
          method: 'POST',
          url: 'https://api.spotify.com/v1/me/player/next',
          headers: headers,
        });
      } catch (error) {
        console.log(error);
      }
    }

    try {
      await TopTracks.destroy({
        where: {
          user_id: owner_id,
        },
      });
    } catch (error) {
      console.log('REMOVE TRACK FROM QUEUE ERROR');
      console.log(error);
      res.status(400).json({ error: 'Error removing Top Track' });
    }

    res.status(200).json({ success: 'top track removed' });
  },

  async searchPlaylistsAndTracks(req, res, nex) {
    const { query } = req.query;
    if (query && query !== '') {
      var ret = {};
      const q = query;
      var tracks = [];
      var playlists = [];
      try {
        const token = await spotifyUtils.getAccessToken(req.user_id);
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        const response = await axios({
          method: 'GET',
          url: 'https://api.spotify.com/v1/search',
          headers: headers,
          params: {
            q,
            type: 'playlist,track',
          },
        });
        if (response.data.tracks.items) {
          response.data.tracks.items.forEach((element) => {
            tracks.push({
              artists: element.artists[1]
                ? element.artists[0].name + ', ' + element.artists[1].name
                : element.artists[0].name,
              duration: element.duration_ms,
              track_name: element.name,
              album_art: element.album.images[0].url,
              external_track_id: element.id,
              type: 'track',
              selectedClass: null,
              isSelected: false,
            });
          });
        }

        if (response.data.playlists.items) {
          let duration = 0;
          for (const element of response.data.playlists.items) {
            playlists.push({
              playlist_name: element.name,
              playlist_art: element.images[0] ? element.images[0].url : '',
              external_playlist_id: element.id,
              tracks: element.tracks.href,
              type: 'playlist',
              selectedClass: null,
              isSelected: false,
            });
            duration = 0;
          }
        }
        console.log('FIM-------------------------------------------');
        ret = [
          {
            title: 'Músicas',
            data: tracks,
          },
          {
            title: 'Playlists',
            data: playlists,
          },
        ];
        console.log(ret);
        res.status(200).json(ret);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error on Search' });
      }
    } else {
      console.log('Sem query');
      try {
        /*const token = await spotifyUtils.getAccessToken(req.user_id);
        console.log(token);
        const headers = {
          Authorization: 'Bearer ' + token,
        };
        var playlists = [];
        var display_name;
        await axios({
          method: 'GET',
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: headers,
        })
          .then((response) => {
            console.log(response.data);
            const { items } = response.data;
            for (const key in items) {
              if (items.hasOwnProperty(key)) {
                const element = items[key];
                playlists.push({
                  playlist_name: element.name,
                  playlist_art: element.images[0].url,
                  external_playlist_id: element.id,
                  tracks: element.tracks.href,
                  type: 'playlist',
                  selectedClass: false,
                });
              }
            }
            var ret = [];
            ret.push({ title: 'Playlists', data: playlists });
            res.status(200).json(ret);
            display_name = response.data.display_name;
          })
          .catch((error) => {
            console.log(error.response.status);
          });*/
        var ret = [
          {
            title: 'Músicas',
            data: [],
          },
          {
            title: 'Playlists',
            data: [],
          },
        ];
        res.status(200).json(ret);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error forming authorization URL' });
      }
    }
  },
};
