/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import mysql = require("mysql");
import {dbConfig} from "./dotenv";


const configDb = {
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASS,
  host: dbConfig.DB_HOST,
  port: dbConfig.DB_PORT,
  database: dbConfig.DB_DBSE,
};
const conn = mysql.createConnection(configDb);
conn.connect();

// - Reconnection function
function reconnect(oldconn: mysql.Connection): void {
  console.log("\n New connection tentative...");
  // - Destroy the current connection variable
  if (oldconn) oldconn.destroy();
  // - Create a new one
  const conn = mysql.createConnection(configDb);
  // - Try to reconnect
  conn.connect(function(err): mysql.Connection {
    if (err) {
      // - Try to connect every 2 seconds.
      setTimeout(reconnect, 2000);
    }
    console.log("\n\t *** New connection established with the database. ***");
    return conn;
  });
}

// - Error listener
conn.on("error", function errLis(err) {
  // - The server close the connection.
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    reconnect(conn);
  } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT") {
    // - Connection in closing
    console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    reconnect(conn);
  } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    // - Fatal error : connection variable must be recreated
    console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    reconnect(conn);
  } else if (err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE") {
    // - Error because a connection is already being established
    console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
  } else {
    console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    reconnect(conn);
  }
});

export const queryF = (query: string, callback: (resd: mysql.Query) => void, errorCallback: (err: Error) => unknown): void => {
  conn.query(query, (err: Error, resd: mysql.Query) => {
    if (err) {
      return errorCallback(err);
    }
    return callback(resd);
  });
};
