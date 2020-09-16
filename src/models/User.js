const { DataTypes, Model } = require('sequelize');

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      { sequelize, tableName: 'users' }
    );
  }
  static associate(models) {
    this.hasMany(models.Profiles, { as: 'profiles' });
    this.hasMany(models.HDJPlaylists, { as: 'hdj_playlists' });
  }
}

module.exports = Users;
