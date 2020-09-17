const { DataTypes, Model } = require('sequelize');

class HDJPlaylists extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        playlist_name: DataTypes.STRING,
        link: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      { sequelize, tableName: 'hdj_playlists' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
    this.hasMany(models.HDJTracks, { foreignKey: 'id', as: 'tracks' });
  }
}

module.exports = HDJPlaylists;
