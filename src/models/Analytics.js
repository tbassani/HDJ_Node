const { DataTypes, Model } = require('sequelize');

class Analytics extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: DataTypes.INTEGER,
        action: DataTypes.STRING,
        deleted_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'analytics',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

module.exports = Analytics;
