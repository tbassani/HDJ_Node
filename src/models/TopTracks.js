const { DataTypes, Model } = require('sequelize');

class TopTracks extends Model {
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
        genre: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'top_tracks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'owner_user' });
    this.belongsTo(models.HDJPlaylists, { foreignKey: 'playlist_id', as: 'hdj_playlist' });
  }
}

module.exports = TopTracks;
