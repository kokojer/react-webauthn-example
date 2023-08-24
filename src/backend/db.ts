import sqlite3 from "sqlite3";

let db: sqlite3.Database;

const connect = (path: string) => {
  return new Promise<void>((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error(err.message);
        reject();
      }
      console.log(`Connected to the webauthn database ${path}`);
      resolve();
    });
  });
};

const get = (sql: string, params: object, convert = (row: any) => row) => {
  return new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(convert(row));
      }
    });
  });
};

const all = (
  sql: string,
  params: object,
  convert = (rows?: unknown[]) => rows,
) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(convert(rows));
      }
    });
  });
};

const run = (sql: string, params: object) => {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const exec = (sql: string) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getDb = () => {
  return db;
};

export { connect, exec, get, all, run, getDb };
