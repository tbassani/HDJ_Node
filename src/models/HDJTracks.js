const { DataTypes, Model } = require('sequelize');

class HDJTracks extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        playlist_id: DataTypes.INTEGER,
        track_name: DataTypes.STRING,
        external_track_id: DataTypes.STRING,
        score: DataTypes.INTEGER,
        was_played: DataTypes.BOOLEAN,
        duration: DataTypes.INTEGER,
        album_name: DataTypes.STRING,
        album_art: DataTypes.STRING,
        artist_name: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'hdj_tracks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.HDJPlaylists, { foreignKey: 'playlist_id', as: 'hdj_playlist' });
    this.hasMany(models.UserHistory, { foreignKey: 'hdj_track_id', as: 'history' });
  }
}

module.exports = HDJTracks;
