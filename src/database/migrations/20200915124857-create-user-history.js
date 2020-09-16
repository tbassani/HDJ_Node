'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { tableName: 'user_history' },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        hdj_track_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hdj_playlist_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        up_vote: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        down_vote: {
          type: Sequelize.INTEGER,
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
    return queryInterface.dropTable({ tableName: 'user_history' });
  },
};
