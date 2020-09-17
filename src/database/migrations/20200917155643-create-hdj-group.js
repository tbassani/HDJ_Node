'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { tableName: 'hdj_groups' },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        owner_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        member_user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        hdj_playlist_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'hdj_playlists', key: 'id' },
          onDelete: 'CASCADE',
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
    return queryInterface.dropTable({ tableName: 'hdj_groups' });
  },
};
