const SpotifyWebApi = require('spotify-web-api-node');

const spotifyConfig = require('../../config/spotify');
const HDJPlaylists = require('../../models/HDJPlaylists');
const HDJTracks = require('../../models/HDJTracks');
const UserHistory = require('../../models/UserHistory');
const HDJGroups = require('../../models/HDJGroups');
const TopTracks = require('../../models/TopTracks');
const axios = require('axios');

const spotifyUtils = require('../spotifyUtils/spotifyAPI');
const analytics = require('../analyticsUtils/analytics');

const { Op } = require('sequelize');
const Sequelize = require('sequelize');

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
      var hdjGroup = await HDJGroups.create({
        owner_user_id: req.user_id,
        member_user_id: null,
        hdj_playlist_id: hdjPlaylist.dataValues.id,
        deleted_at: null,
      });
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
              artist_name: element.track.artists[1]
                ? element.track.artists[0].name + ', ' + element.track.artists[1].name
                : element.track.artists[0].name,
            });
          }
        }
      });
      analytics.logAction('Criar Playlist', req.user_id);
      res.status(200).json({
        success: `Playlist ${hdjPlaylist.dataValues.id} created`,
        id: hdjPlaylist.dataValues.id,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async mixHDJPlaylist(req, res, nex) {
    try {
      console.log('MIX HDJ PLAYLIST');
      const { playlists, tracks, name } = req.body;
      console.log(req.body);
      var hdjPlaylist = await HDJPlaylists.create({
        user_id: req.user_id,
        playlist_name: name,
        link: null,
        deleted_at: null,
      });
      var hdjGroup = await HDJGroups.create({
        owner_user_id: req.user_id,
        member_user_id: null,
        hdj_playlist_id: hdjPlaylist.dataValues.id,
        deleted_at: null,
      });
      var token = await spotifyUtils.getAccessToken(req.user_id);
      console.log('NEW TOKEN');
      console.log(token);
      tracks.items.forEach(async (track) => {
        console.log('TRACK id:' + track.id);
        var spotifyRawTrack = await spotifyUtils.getTrack(track.id, token);
        var spotifyRawArtist = await spotifyUtils.getArtist(spotifyRawTrack.artists[0].id, token);
        console.log('GENRE');
        console.log(spotifyRawArtist.genres.join(', '));
        await HDJTracks.create({
          user_id: req.user_id,
          playlist_id: hdjPlaylist.dataValues.id,
          external_track_id: spotifyRawTrack.id,
          score: 0,
          track_name: spotifyRawTrack.name,
          was_played: false,
          duration: spotifyRawTrack.duration_ms,
          deleted_at: null,
          album_name: spotifyRawTrack.album.name,
          album_art: spotifyRawTrack.album.images[0].url,
          artist_name: spotifyRawTrack.artists[1]
            ? spotifyRawTrack.artists[0].name + ', ' + spotifyRawTrack.artists[1].name
            : spotifyRawTrack.artists[0].name,
          genre: spotifyRawArtist.genres.join(', '),
        });
      });
      playlists.items.forEach(async (playlist) => {
        console.log('PLAYLIST id:' + playlist.id);
        var spotifyRawTracks = await spotifyUtils.getPlaylistTrack(playlist.id, token);
        var tracks = spotifyRawTracks.tracks.items;
        for (const key in tracks) {
          if (tracks.hasOwnProperty(key)) {
            const element = tracks[key];
            console.log('ARTISTIS FROM PLALIST');
            var spotifyRawArtist = await spotifyUtils.getArtist(element.track.artists[0].id, token);

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
              artist_name: element.track.artists[1]
                ? element.track.artists[0].name + ', ' + element.track.artists[1].name
                : element.track.artists[0].name,
              genre: spotifyRawArtist.genres.join(', '),
            });
          }
        }
      });
      analytics.logAction('Criar Playlist', req.user_id);
      res.status(200).json({
        success: `Playlist ${hdjPlaylist.dataValues.id} created`,
        id: hdjPlaylist.dataValues.id,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async addToHDJPlaylist(req, res, nex) {
    try {
      console.log('ADD TO PLAYLIST');
      const { playlists, tracks, hdj_playlist_id } = req.body;
      var hdjGroup = await HDJGroups.findAll({
        where: {
          [Op.or]: [{ owner_user_id: req.user_id }, { member_user_id: req.user_id }],
          [Op.and]: [{ hdj_playlist_id: hdj_playlist_id }],
        },
        raw: true,
      });
      console.log(hdjGroup);
      if (hdjGroup.length > 0) {
        var token = await spotifyUtils.getAccessToken(req.user_id);
        tracks.items.forEach(async (track) => {
          console.log('TRACK id:' + track.id);
          var spotifyRawTrack = await spotifyUtils.getTrack(track.id, token);
          var spotifyRawArtist = await spotifyUtils.getArtist(spotifyRawTrack.artists[0].id, token);
          const [hdjtrack, created] = await HDJTracks.findOrCreate({
            where: {
              playlist_id: hdj_playlist_id,
              track_name: spotifyRawTrack.name,
              artist_name: spotifyRawTrack.artists[1]
                ? spotifyRawTrack.artists[0].name + ', ' + spotifyRawTrack.artists[1].name
                : spotifyRawTrack.artists[0].name,
            },
            defaults: {
              user_id: req.user_id,
              playlist_id: hdj_playlist_id,
              external_track_id: spotifyRawTrack.id,
              score: 0,
              track_name: spotifyRawTrack.name,
              was_played: false,
              duration: spotifyRawTrack.duration_ms,
              deleted_at: null,
              album_name: spotifyRawTrack.album.name,
              album_art: spotifyRawTrack.album.images[0].url,
              artist_name: spotifyRawTrack.artists[1]
                ? spotifyRawTrack.artists[0].name + ', ' + spotifyRawTrack.artists[1].name
                : spotifyRawTrack.artists[0].name,
              genre: spotifyRawArtist.genres.join(', '),
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
        });
        console.log(token);
        playlists.items.forEach(async (playlist) => {
          console.log('PLAYLIST id:' + playlist.id);
          var spotifyRawTracks = await spotifyUtils.getPlaylistTrack(playlist.id, token);
          var tracks = spotifyRawTracks.tracks.items;
          console.log('HAS TRACKS');
          console.log(tracks);
          for (const key in tracks) {
            if (tracks.hasOwnProperty(key)) {
              const element = tracks[key];
              var spotifyRawArtist = await spotifyUtils.getArtist(
                element.artists ? element.artists[0].id : '',
                token
              );
              const [hdjtrack, created] = await HDJTracks.findOrCreate({
                where: {
                  playlist_id: hdj_playlist_id,
                  track_name: element.track.name,
                  artist_name: element.track.artists[1]
                    ? element.track.artists[0].name + ', ' + element.track.artists[1].name
                    : element.track.artists[0].name,
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
                  artist_name: element.track.artists[1]
                    ? element.track.artists[0].name + ', ' + element.track.artists[1].name
                    : element.track.artists[0].name,
                  genre: spotifyRawArtist ? spotifyRawArtist.genres.join(', ') : '',
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
        });
        analytics.logAction('Adiconar à Playlist', req.user_id);
        res.status(200).json({ success: 'Playlist updated' });
      } else {
        res.status(400).json({ error: 'User not permited' });
      }
    } catch (error) {
      console.log9(error);
      res.status(400).json({ error: 'Error updating playlist' });
    }
  },
  async updateQueue(req, res, nex) {
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    const setNewTopTracks = (tracks, oldTopTracks, beginDuration, currentTrack) => {
      let newTopTracks = [...oldTopTracks];
      let duration = beginDuration;
      let i = 0;
      while (i < tracks.length && duration < 1800000) {
        if (tracks[i].external_track_id !== currentTrack.external_track_id) {
          duration = duration + tracks[i].duration;
          console.log('ADD TO QUEUE: ' + i);
          newTopTracks.push(tracks[i]);
        }
        i++;
      }
      return {
        newTopTracks,
        duration,
      };
    };

    //Inicialização de variáveis
    console.log('UPDATE QUEUE');
    const { playlist_id } = req.body;
    const token = await spotifyUtils.getAccessToken(req.user_id);
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    var playingTrack = {};

    try {
      let response = await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: headers,
      })
        .then((resp) => {
          console.log('Got playing track');
        })
        .catch(async (error) => {
          timer(2000);
          response = await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: headers,
          })
            .then((resp) => {
              console.log('Got playing track');
            })
            .catch(async (error) => {
              timer(2000);
              response = await axios({
                method: 'GET',
                url: 'https://api.spotify.com/v1/me/player/currently-playing',
                headers: headers,
              });
            });
        });

      if (response.data.item) {
        playingTrack = {
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

      const topTracks = await TopTracks.findAll(
        { was_played: true },
        {
          where: {
            playlist_id: playlist_id,
          },
          raw: true,
        }
      );
      console.log('FILTER TOP TRACKS');
      const topTracksCheck = topTracks.filter((track) => {
        return track.external_track_id === playingTrack.external_track_id;
      });
      const index = topTracks.indexOf(topTracksCheck[0]);
      console.log('TOP TRACK INDEX: ' + index);
      if (index > 0 || topTracks.length === 0) {
        let minDuration = 0;
        let oldTracks = [];
        console.log('OLD TRACK INDEX: ' + index);
        for (let n = index + 1; n < topTracks.length; n++) {
          minDuration = minDuration + topTracks[n].duration;
          oldTracks.push(topTracks[n]);
        }
        var updatedTracks = await HDJTracks.findAll({
          where: { playlist_id: playlist_id, was_played: false },
          raw: true,
          order: [['score', 'DESC']],
        });
        console.log(updatedTracks);
        let updatedTopTracks = setNewTopTracks(updatedTracks, [], minDuration, playingTrack);

        if (updatedTopTracks.duration < 1800000) {
          console.log('NOT ENOUGH TRACKS');
          //reset playlist
          await resetHDJPlaylist(playlist_id);
          //get ranking
          var newTracks = await HDJTracks.findAll({
            where: { playlist_id: playlist_id, was_played: false },
            raw: true,
            order: [['score', 'DESC']],
          });
          updatedTopTracks = setNewTopTracks(
            newTracks,
            updatedTopTracks.newTopTracks,
            updatedTopTracks.duration,
            playingTrack
          );
        }

        const addedTopTracks = updatedTopTracks.newTopTracks;
        await TopTracks.destroy({
          where: {
            playlist_id: playlist_id,
          },
        });
        addedTopTracks.unshift(playingTrack);
        for (const track of addedTopTracks) {
          await TopTracks.create({
            user_id: req.user_id,
            playlist_id: playlist_id,
            external_track_id: track.external_track_id,
            score: track.score,
            track_name: track.track_name,
            was_played: false,
            duration: track.duration,
            deleted_at: null,
            album_name: track.album_name,
            album_art: track.album_art,
            artist_name: track.artist_name,
            genre: track.genre,
          });
        }

        for (const track of addedTopTracks) {
          var uri_data = {
            uri: `spotify:track:${track.external_track_id}`,
          };
          await axios({
            method: 'POST',
            url: 'https://api.spotify.com/v1/me/player/queue',
            headers: headers,
            params: uri_data,
          })
            .then((resp) => {
              console.log('Track added to queue');
            })
            .catch(async (error) => {
              console.log(error);
              await timer(2000);
              await axios({
                method: 'POST',
                url: 'https://api.spotify.com/v1/me/player/queue',
                headers: headers,
                params: uri_data,
              })
                .then((resp) => {
                  console.log('Track added to queue');
                })
                .catch(async (error) => {
                  console.log(error);
                  await timer(2000);
                  await axios({
                    method: 'POST',
                    url: 'https://api.spotify.com/v1/me/player/queue',
                    headers: headers,
                    params: uri_data,
                  })
                    .then((resp) => {
                      console.log('Track added to queue');
                    })
                    .catch(async (error) => {
                      console.log(error);
                      res.status(400).json({ error: 'track not added to queue' });
                    });
                });
            });
          await timer(2000);
          await HDJTracks.update(
            { was_played: true },
            {
              where: {
                playlist_id: playlist_id,
                external_track_id: track.external_track_id,
              },
            }
          );
        }
      }
      res.status(200).json({ success: 'track added to queue' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error adding track to queue' });
    }
    //}
  },
  async upVoteTrack(req, res, next) {
    try {
      const { playlist_id, track_id } = req.body;
      var hdjGroup = await HDJGroups.findAll({
        where: {
          [Op.or]: [{ owner_user_id: req.user_id }, { member_user_id: req.user_id }],
          [Op.and]: [{ hdj_playlist_id: playlist_id }],
        },
        raw: true,
      });
      if (hdjGroup.length > 0) {
        await HDJTracks.increment('score', {
          by: 1,
          where: { id: track_id },
        });
        const [userHistory, created] = await UserHistory.findOrCreate({
          where: {
            user_id: req.user_id,
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
        analytics.logAction('Votar', req.user_id);
        res.status(200).json({ success: `Track liked` });
      } else {
        res.status(400).json({ error: 'User not permited' });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error on upvote Track' });
    }
  },
  async downVoteTrack(req, res, next) {
    try {
      const { playlist_id, track_id } = req.body;
      var hdjGroup = await HDJGroups.findAll({
        where: {
          [Op.or]: [{ owner_user_id: req.user_id }, { member_user_id: req.user_id }],
          [Op.and]: [{ hdj_playlist_id: playlist_id }],
        },
        raw: true,
      });
      if (hdjGroup.length > 0) {
        await HDJTracks.increment('score', {
          by: -1,
          where: { id: track_id },
        });
        const [userHistory, created] = await UserHistory.findOrCreate({
          where: {
            user_id: req.user_id,
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
        analytics.logAction('Votar', req.user_id);
        res.status(200).json({ success: `Track disliked` });
      } else {
        res.status(400).json({ error: 'User not permited' });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error creating playlist' });
    }
  },
  async getHDJPlaylists(req, res, next) {
    try {
      var hdjGroup = await HDJGroups.findAll({
        where: {
          [Op.or]: [{ owner_user_id: req.user_id }, { member_user_id: req.user_id }],
        },
        raw: true,
      });

      var array = [];
      var i = 0;
      hdjGroup.forEach((ids) => {
        array[i++] = ids.hdj_playlist_id;
      });
      console.log(array);
      var playlists = await HDJPlaylists.findAll({
        where: {
          [Op.or]: [{ user_id: req.user_id }, { id: { [Op.in]: array } }],
        },
        raw: true,
      });
      res.status(200).json(playlists);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting playlists' });
    }
  },
  async getHDJPlaylistTracks(req, res, next) {
    try {
      const { playlist_id } = req.params;
      var tracks = await HDJTracks.findAll({
        where: { playlist_id: playlist_id, was_played: false },
        raw: true,
        order: [['score', 'DESC']],
      });
      if (!tracks || tracks.length <= 0) {
        tracks = await HDJTracks.findAll({
          where: { playlist_id: playlist_id },
          raw: true,
          order: [['score', 'DESC']],
        });
        await HDJTracks.update(
          { was_played: false },
          {
            where: { playlist_id: playlist_id, was_played: true },
            raw: true,
            order: [['score', 'DESC']],
          }
        );
      }
      res.status(200).json(tracks);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting tracks' });
    }
  },
  async getUnvotedHDJTracks(req, res, next) {
    try {
      const { playlist_id } = req.params;
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
      if (!tracks || tracks.length === 0) {
        console.log('NO MORE TRACKS');
        await UserHistory.destroy({
          where: {
            user_id: req.user_id,
            hdj_playlist_id: playlist_id,
          },
        });
        tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
          },
          raw: true,
          order: [['score', 'DESC']],
        });
      }
      res.status(200).json(tracks);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting unvoted tracks' });
    }
  },
  async getNextUnvotedHDJTrack(req, res, next) {
    try {
      console.log('GET UNVOTED');
      const { playlist_id } = req.params;
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
      if (userHistory && userHistory.length > 0) {
        userHistory.forEach((track) => {
          array[i++] = track.hdj_track_id;
        });
      }
      console.log(array);
      var tracks = await HDJTracks.findAll({
        where: {
          playlist_id: playlist_id,
          id: { [Op.notIn]: array },
          was_played: false,
        },
        raw: true,
        order: [[Sequelize.fn('RANDOM')]],
      });
      console.log(tracks.length);
      if (!tracks || tracks.length <= 0) {
        console.log('Fim das músicas');
        tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
            was_played: false,
          },
          raw: true,
          order: [[Sequelize.fn('RANDOM')]],
        });
        console.log(tracks.length);
        await UserHistory.destroy({
          where: {
            user_id: req.user_id,
            hdj_playlist_id: playlist_id,
          },
        });
      }
      res.status(200).json(tracks[0]);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting unvoted tracks' });
    }
  },

  async getNextUnplayedHDJTrack(req, res, next) {
    try {
      const { playlist_id } = req.params;
      var tracks = await HDJTracks.findAll({
        where: {
          playlist_id: playlist_id,
          was_played: false,
        },
        raw: true,
        order: [['score', 'DESC']],
      });
      if (!tracks || tracks.length <= 0) {
        console.log('Fim das músicas');
        tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
          },
          raw: true,
          order: [['score', 'DESC']],
        });
        await HDJTracks.update(
          { was_played: false },
          {
            where: {
              playlist_id: playlist_id,
              was_played: true,
            },
            raw: true,
          }
        );
        await UserHistory.destroy({
          where: {
            user_id: req.user_id,
            hdj_playlist_id: playlist_id,
          },
        });
      }
      res.status(200).json(tracks[0]);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting unvoted tracks' });
    }
  },

  async deleteHDJPlaylist(req, res, next) {
    try {
      const { playlist_id } = req.body;
      await HDJPlaylists.destroy({
        where: {
          id: playlist_id,
        },
      });
      await HDJTracks.destroy({
        where: {
          playlist_id: playlist_id,
        },
        raw: true,
      });
      analytics.logAction('Deletar Playlist', req.user_id);
      res.status(200).json(success, 'Playlist deleted');
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error deleting playlist' });
    }
  },
  async addToHDJGroups(req, res, next) {
    try {
      const { playlist_id } = req.body;
      const playlist = await HDJPlaylists.findByPk(playlist_id);
      if (!playlist || playlist.length <= 0) {
        res.status(400).json({ error: 'Playlist does not exist' });
      } else {
        await HDJGroups.findOrCreate({
          where: {
            hdj_playlist_id: playlist_id,
            member_user_id: req.user_id,
          },
          defaults: {
            owner_user_id: playlist.user_id,
            member_user_id: req.user_id,
            hdj_playlist_id: playlist_id,
            deleted_at: null,
          },
        });
        analytics.logAction('Adicionar ao Grupo', req.user_id);
        res.status(200).json(playlist);
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error adding user' });
    }
  },

  async resetHDJPlaylist(req, res, nex) {
    try {
      const { hdj_playlist_id } = req.body;
      const hdjPlaylist = HDJPlaylists.findAll({
        where: {
          user_id: req.user_id,
          id: hdj_playlist_id,
        },
        raw: true,
      });
      if (!hdjPlaylist || hdjPlaylist.length <= 0) {
        console.log('Essa playlist não existe ou não pertence ao usuário');
        res.status(400).json({ error: 'Error updating playlist' });
      } else {
        console.log('Resetar playlist');
        const tracks = HDJTracks.update(
          { score: 0, was_played: false },
          {
            where: {
              playlist_id: hdj_playlist_id,
            },
          }
        );
        analytics.logAction('Resetar Playlist', req.user_id);
        res.status(200).json(success, 'Playlist Updated');
      }
    } catch (error) {
      res.status(400).json({ error: 'Error updating playlist' });
    }
  },

  async getIfTrackVoted(req, res, next) {
    try {
      console.log('CHECK TRACK');
      const { track_id, playlist_id } = req.query;
      var userHistory = await UserHistory.findAll({
        attributes: ['hdj_track_id'],
        where: {
          user_id: req.user_id,
          hdj_playlist_id: playlist_id,
          hdj_track_id: track_id,
        },
        raw: true,
      });
      var tracks;
      if (userHistory[0] && userHistory.length > 0) {
        res.status(200).json('');
      } else {
        tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
            id: track_id,
          },
          raw: true,
        });
        res.status(200).json(tracks);
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Error getting unvoted tracks' });
    }
  },
  async searchVotingTracks(req, res, nex) {
    console.log('SEARCH TRACKS');
    const { query } = req.query;
    if (query && query !== '') {
      console.log(query);
      try {
        const { playlist_id } = req.params;
        var tracks = await HDJTracks.findAll({
          where: {
            playlist_id: playlist_id,
            was_played: false,
            [Op.or]: [
              {
                track_name: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('track_name')),
                  'LIKE',
                  '%' + query.toLowerCase() + '%'
                ),
              },
              {
                artist_name: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('artist_name')),
                  'LIKE',
                  '%' + query.toLowerCase() + '%'
                ),
              },
            ],
          },
          raw: true,
          order: [['score', 'DESC']],
        });
        console.log(tracks.length);
        res.status(200).json(tracks);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error getting tracks' });
      }
    } else {
      console.log('Sem query');
      try {
        const { playlist_id } = req.params;
        var tracks = await HDJTracks.findAll({
          where: { playlist_id: playlist_id, was_played: false },
          raw: true,
          order: [['score', 'DESC']],
        });
        if (!tracks || tracks.length <= 0) {
          tracks = await HDJTracks.findAll({
            where: { playlist_id: playlist_id },
            raw: true,
            order: [['score', 'DESC']],
          });
          await HDJTracks.update(
            { was_played: false },
            {
              where: { playlist_id: playlist_id, was_played: true },
              raw: true,
              order: [['score', 'DESC']],
            }
          );
        }
        res.status(200).json(tracks);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error getting tracks' });
      }
    }
  },
};
