/* eslint-disable max-len */
import * as functions from "firebase-functions";
import express = require("express");
import moment = require("moment");
import cors = require("cors");


import {queryF} from "./db";


// Error Function
const sendError = (param: string, errType: string, res: express.Response) => {
  res.status(404).json({
    error: `Invalid ${param} '${errType}'`,
  });
};

// Response Function
const execute = (req: express.Request, res: express.Response, sql1: string, sql2: string, desc: string) => {
  const timeParam = req.params.time;
  const n = parseInt(req.params.offset);
  const type = req.params.type || "None";

  let sql;

  // Error Checking
  if (!(timeParam in timePeriods)) sendError("period", timeParam, res);

  let from: string;
  let to: string;

  if (timeParam == "all") {
    sql = sql1 + sql2;
    from = "Beginning";
    to = moment().format("YYYY-MM-DD HH:mm:ss");
  } else {
    const time = setTime(timeParam);
    sql = `${sql1} WHERE date BETWEEN UNIX_TIMESTAMP() - (${n}) * (${time}) AND UNIX_TIMESTAMP() - (${n}-1) * (${time}) ${sql2}`;
    const fromUnix = n * time;
    const toUnix = (n - 1) * time;
    from = moment().subtract(fromUnix, "seconds").format("YYYY-MM-DD HH:mm:ss");
    to = moment().subtract(toUnix, "seconds").format("YYYY-MM-DD HH:mm:ss");
  }

  queryF(sql, (resd) => {
    if (Array.isArray(resd)) {
      res.send({
        requestParams: {
          period: {
            length: timeParam,
            from: from,
            to: to,
          },
          offset: n,
          type: type,
          query: desc,
        },
        results: resd,
      });
    }
  }, (err) => {
    res.status(500).send({error: err});
  });
};


// Time Periods Allowed
const timePeriods = {
  week: 604800,
  month: 2628000,
  year: 31540000,
  all: 0,
};
// Types Allowed
const types = ["track", "artist", "album"];

// Setting Default Values for time period and offset
let time = timePeriods.week;

const setTime = (period: string) => {
  if (period == "week") time = timePeriods.week;
  if (period == "month") time = timePeriods.month;
  if (period == "year") time = timePeriods.year;
  return time;
};

// Creating Express App
const app = express();

app.use(cors({origin: true}));

app.get("/tracksplayed/:time/:offset", (req: express.Request, res: express.Response) => {
  const sql1 = "SELECT track, album, artist, duration, DAYNAME(FROM_UNIXTIME(date)) AS weekday, FROM_UNIXTIME(date) AS date, tags FROM last";
  const sql2 = "";
  execute(req, res, sql1, sql2, "All Tracks Played");
});

app.get("/unique/:type/:time/:offset", (req: express.Request, res: express.Response) => {
  const type = req.params.type;
  if (!types.includes(type)) sendError("type", type, res);

  let dur;
  if (type == "track") {
    dur = ", duration";
  } else {
    dur = "";
  }

  const sql1 = `SELECT ${type}${dur} FROM last`;
  const sql2 = "GROUP BY track";
  execute(req, res, sql1, sql2, `Unique Number of ${type}s Played`);
});

app.get("/top/:type/:time/:offset", (req: express.Request, res: express.Response) => {
  const type = req.params.type;
  let imgType;
  if (!types.includes(type)) sendError("type", type, res);
  (type == "album" || type == "track") ? imgType = "album_image" : imgType = "artist_image";
  const sql1 = `SELECT COUNT(track) AS plays,${type}, artist,${imgType}  FROM last`;
  const sql2 = ` GROUP BY ${type} ORDER BY plays DESC`;
  execute(req, res, sql1, sql2, `Top ${type}s`);
});

app.get("/duration/:time/:offset", (req: express.Request, res: express.Response) => {
  const sql1 = "SELECT SEC_TO_TIME(SUM(duration)) AS time_played FROM last";
  const sql2 = "";
  execute(req, res, sql1, sql2, "Total Time Played");
});

app.get("/plays/:time/:offset", (req: express.Request, res: express.Response) => {
  let avg;
  let desc;
  if (req.params.time == "week") {
    avg = ", COUNT(track)/7 AS avg_plays ";
    desc = " & Daily Average";
  } else if (req.params.time == "month") {
    avg = ", COUNT(track)/30 AS avg_plays ";
    desc = " & Weekly Average (in a month)";
  } else if (req.params.time == "year") {
    avg = ", COUNT(track)/12 AS avg_plays ";
    desc = " & Monthly Average";
  } else {
    avg = ", COUNT(track)/7 AS avg_plays ";
    desc = " & All Time Daily Average";
  }
  const sql1 = `SELECT COUNT(track) AS plays${avg} FROM last`;
  const sql2 = "";
  execute(req, res, sql1, sql2, `Total Number of Plays${desc}`);
});

app.get("/activehour/:time/:offset", (req: express.Request, res: express.Response) => {
  const sql1 = "SELECT COUNT(*) AS plays, HOUR(FROM_UNIXTIME(date)) AS hour FROM last ";
  const sql2 = "GROUP BY hour ORDER BY plays DESC";
  execute(req, res, sql1, sql2, "Plays By Hour");
});

app.get("/totalnew/:type/:time/:offset", (req: express.Request, res: express.Response) => {
  const type = req.params.type;
  const sql1 = `SELECT count(${type}) plays FROM last`;
  const sql2 = `AND date IN (SELECT min(date) FROM last GROUP BY ${type})`;
  execute(req, res, sql1, sql2, `New ${type}s discovered`);
});

app.get("/new/:type/:time/:offset", (req: express.Request, res: express.Response) => {
  const type = req.params.type;
  const stype = (type == "track") ? "album" : type;

  const sql1 = `SELECT ${type} as rtype, artist, ${stype}_image as img FROM last`;
  const sql2 = `AND date IN (SELECT min(date) FROM last GROUP BY ${type})`;
  execute(req, res, sql1, sql2, `New ${type}s discovered`);
});

exports.app = functions.https.onRequest(app);
