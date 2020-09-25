const { DataTypes, Model } = require('sequelize');

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
  static associate(models) {
    this.hasMany(models.Profiles, { as: 'profiles' });
    this.hasMany(models.HDJPlaylists, { as: 'hdj_playlists' });
    this.hasMany(models.UserHistory, { as: 'user_history' });
    this.hasMany(models.HDJGroups, { as: 'user_history' });
  }
}

module.exports = Users;
