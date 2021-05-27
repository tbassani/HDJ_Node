'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { tableName: 'top_tracks' },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        track_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        playlist_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'hdj_playlists', key: 'id' },
          onDelete: 'CASCADE',
        },
        external_track_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        score: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        was_played: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        album_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        album_art: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        artist_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        genre: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deleted_at: {
          type: Sequelize.DATE,
          // allowNull defaults to true
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable({ tableName: 'top_tracks' });
  },
};
