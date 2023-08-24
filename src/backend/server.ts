import dotenv from "dotenv";
import express from "express";
import http from "http";
import * as db from "./db.ts";
import { initDatabase } from "./initdb.ts";
import bodyParser from "body-parser";
import api from "./api/index.ts";

dotenv.config();

const app = express();

const init = async () => {
  // Init sqlite database
  if (!process.env.SQLITE_DATABASE_PATH) return;
  await db.connect(process.env.SQLITE_DATABASE_PATH);
  await initDatabase();

  app.use(express.static("public"));
  app.use(bodyParser.json({ limit: "1mb" }));

  app.use("/api", api);

  const server = http.createServer(app);
  server.listen(
    Number(process.env.SERVER_LISTEN_PORT),
    process.env.SERVER_LISTEN_ADDRESS,
    () => {
      console.log(
        `Server listening on ${process.env.SERVER_LISTEN_ADDRESS}:${process.env.SERVER_LISTEN_PORT}!`,
      );
    },
  );
};

init();
