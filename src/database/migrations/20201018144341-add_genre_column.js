'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'hdj_tracks',
      'genre',
      {
        type: Sequelize.STRING
      },
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'hdj_tracks',
      'genre',
      {
        type: Sequelize.STRING
      },
    )
  }
};
