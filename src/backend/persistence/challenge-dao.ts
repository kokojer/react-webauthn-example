import { get, run } from "../db.js";
import { makeSelect } from "../util/sql-util.js";
import { Challenge } from "../Еntities.ts";

const COLUMNS = [
  { name: "c_login", alias: "login" },
  { name: "c_id", alias: "id" },
  { name: "c_validuntil", alias: "validUntil" },
];

const deleteChallenge = ({ login }: { login: string }) => {
  return run("DELETE FROM t_challenge WHERE c_login = $login", {
    $login: login,
  });
};

const createChallenge = ({ login, id }: { login: string; id: string }) => {
  return run(
    "INSERT INTO t_challenge (c_login, c_id, c_validuntil) values($login, $id, DATETIME(CURRENT_TIMESTAMP, '+2 minutes', 'localtime'))",
    {
      $login: login,
      $id: id,
    },
  );
};

const getChallengeByLogin = ({
  login,
}: {
  login: string;
}): Promise<Challenge> => {
  return get(
    `SELECT ${makeSelect(COLUMNS)} FROM t_challenge WHERE c_login = $login`,
    { $login: login },
  );
};

const getChallengeById = ({ id }: { id: string }): Promise<Challenge> => {
  return get(
    `SELECT ${makeSelect(COLUMNS)} FROM t_challenge WHERE c_id = $id`,
    { $id: id },
  );
};

export {
  createChallenge,
  getChallengeByLogin,
  deleteChallenge,
  getChallengeById,
};
