const { DataTypes, Model } = require('sequelize');

class ConfirmEmail extends Model {
  static init(sequelize) {
    super.init(
      {
        email: DataTypes.STRING,
        code: DataTypes.INTEGER,
        deleted_at: DataTypes.DATE,
      },
      { sequelize, tableName: 'confirm_email' }
    );
  }
}

module.exports = ConfirmEmail;
