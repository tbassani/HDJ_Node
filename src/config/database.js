require('dotenv').config();

module.exports = {
  database: process.env.DATABASE,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  dialect: 'postgres',
  port: process.env.PORT,
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  },
};
