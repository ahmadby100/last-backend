import mysql = require("mysql");

const DB_CONFIG = {
  user: "admin",
  password: "ahmadby001",
  host: "media-server.czamrtxcp9c9.ap-southeast-1.rds.amazonaws.com",
  port: 3306,
  database: "music",
};

const conn = mysql.createConnection({
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  database: DB_CONFIG.database,
});

conn.connect();

export const queryF = (
    query: string,
    callback: (resd: mysql.Query) => void
): void => {
  conn.query(query, (err: Error, resd: mysql.Query) => {
    if (err) return err;
    callback(resd);
    return;
  });
};
