const { DataTypes, Model } = require('sequelize');

class HDJGroups extends Model {
  static init(sequelize) {
    super.init(
      {
        owner_user_id: DataTypes.INTEGER,
        member_user_id: DataTypes.INTEGER,
        hdj_playlist_id: DataTypes.INTEGER,
        deleted_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'hdj_groups',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'owner_user_id', as: 'owner_user' });
    this.hasMany(models.HDJPlaylists, { foreignKey: 'hdj_playlist_id', as: 'hdj_playlist' });
  }
}

module.exports = HDJGroups;
