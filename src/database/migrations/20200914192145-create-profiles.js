'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { tableName: 'profiles' },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        user_external_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        service: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        access_token: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        refresh_token: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        token_expiration: {
          type: Sequelize.BIGINT(13),
          allowNull: false,
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
    return queryInterface.dropTable({ tableName: 'profiles' });
  },
};
