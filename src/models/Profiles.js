const { DataTypes, Model } = require('sequelize');

class Profiles extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        user_external_id: DataTypes.STRING,
        service: DataTypes.STRING,
        access_token: DataTypes.STRING,
        refresh_token: DataTypes.STRING,
        token_expiration: DataTypes.BIGINT,
        active: DataTypes.BOOLEAN,
        deleted_at: DataTypes.DATE,
      },
      { sequelize, tableName: 'profiles' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
  }
}

module.exports = Profiles;
