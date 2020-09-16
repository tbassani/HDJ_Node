const { DataTypes, Model } = require('sequelize');

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        hdj_track_id: DataTypes.STRING,
        hdj_playlist_id: DataTypes.STRING,
        up_vote: DataTypes.INTEGER,
        down_vote: DataTypes.INTEGER,
      },
      { sequelize, tableName: 'user_history' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
  }
}

module.exports = Users;
