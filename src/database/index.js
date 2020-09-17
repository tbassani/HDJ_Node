const Sequelize = require('sequelize');
const dbConfig = require('../../src/config/database');
const users = require('../models/User');
const confirmEmail = require('../models/ConfirmEmail');
const profiles = require('../models/Profiles');
const hdjPlaylists = require('../models/HDJPlaylists');
const hdjTracks = require('../models/HDJTracks');
const userHistory = require('../models/UserHistory');

const conn = new Sequelize(dbConfig);

users.init(conn);
confirmEmail.init(conn);
profiles.init(conn);
hdjPlaylists.init(conn);
hdjTracks.init(conn);
userHistory.init(conn);

module.exports = conn;
