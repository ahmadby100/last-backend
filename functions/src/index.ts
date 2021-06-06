/* eslint-disable max-len */
import * as functions from "firebase-functions";
import express = require("express");
import moment = require("moment");

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

app.get("/tracksplayed/:time/:offset", (req: express.Request, res: express.Response) => {
  const sql1 = "SELECT track, album, artist, duration, day, FROM_UNIXTIME(date) AS date, tags FROM last";
  const sql2 = "";
  execute(req, res, sql1, sql2, "Tracks Played");
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
  if (!types.includes(type)) sendError("type", type, res);

  const sql1 = `SELECT COUNT(track) AS plays,${type} FROM last`;
  const sql2 = `GROUP BY ${type} ORDER BY plays DESC`;
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
  if (req.query.avg == "7" && req.params.time == "week") {
    avg = `, COUNT(track)/${req.query.avg} AS daily_avg_plays `;
    desc = " & Daily Average";
  } else if (req.query.avg == "54" && req.params.time == "year") {
    avg = `, COUNT(track)/${req.query.avg} AS weekly_avg_plays `;
    desc = " & Weekly Average (in a year)";
  } else if (req.query.avg == "4" && req.params.time == "month") {
    avg = `, COUNT(track)/${req.query.avg} AS weekly_avg_plays `;
    desc = " & Weekly Average (in a month)";
  } else if (req.query.avg == "12" && req.params.time == "year") {
    avg = `, COUNT(track)/${req.query.avg} AS monthly_avg_plays `;
    desc = " & Monthly Average";
  } else {
    avg = " ";
    desc = "";
  }
  const sql1 = `SELECT COUNT(track) AS plays${avg} FROM last`;
  const sql2 = "";
  execute(req, res, sql1, sql2, `Total Number of Plays${desc}`);
});

exports.app = functions.https.onRequest(app);
