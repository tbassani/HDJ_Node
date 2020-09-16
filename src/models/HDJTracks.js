const { DataTypes, Model } = require('sequelize');

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        playlist_id: DataTypes.INTEGER,
        external_track_id: DataTypes.STRING,
        score: DataTypes.INTEGER,
        duration: DataTypes.INTEGER,
        album_name: DataTypes.STRING,
        album_art: DataTypes.STRING,
        artist_name: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      { sequelize, tableName: 'hdj_tracks' }
    );
  }
  static associate(models) {
    this.belongsTo(models.HDJPlaylists, { foreignKey: 'playlist_id', as: 'hdj_playlist' });
  }
}

module.exports = Users;
