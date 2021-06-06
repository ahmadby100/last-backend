/* eslint-disable max-len */
import mysql = require("mysql");
import {dbConfig} from "./dotenv";

const conn = mysql.createConnection({
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASS,
  host: dbConfig.DB_HOST,
  port: dbConfig.DB_PORT,
  database: dbConfig.DB_DBSE,
});

conn.connect();

export const queryF = (query: string, callback: (resd: mysql.Query) => void, errorCallback: (err: Error) => unknown): void => {
  conn.query(query, (err: Error, resd: mysql.Query) => {
    if (err) return errorCallback(err);
    callback(resd);
    return;
  });
};
