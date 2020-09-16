'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { tableName: 'confirm_email' },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.INTEGER,
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
    return queryInterface.dropTable({ tableName: 'confirm_email' });
  },
};
