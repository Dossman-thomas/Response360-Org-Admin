import { Sequelize } from "sequelize";
import { env } from "./env.config.js";  // Assuming you have an env.config.js file for environment variables

const dbConfig = {
  database: env.db.database,
  username: env.db.username,
  password: env.db.password,
  host: env.db.host,
  port: env.db.port,
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "postgres",
    dialectOptions: {
      useUTC: true,
      timezone: "UTC",
    },
    logging: true,  // Optional: Set to true if you want Sequelize logs
  }
);

export { sequelize };

