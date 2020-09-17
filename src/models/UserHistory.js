const { DataTypes, Model } = require('sequelize');

class UserHistory extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        hdj_playlist_id: DataTypes.STRING,
        hdj_track_id: DataTypes.STRING,
        up_vote: DataTypes.INTEGER,
        down_vote: DataTypes.INTEGER,
      },
      { sequelize, tableName: 'user_history' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.HDJTracks, { foreignKey: 'hdj_track_id', as: 'track' });
  }
}

module.exports = UserHistory;
