import { get, all, run } from "../db.ts";
import { makeSelect } from "../util/sql-util.ts";
import { User } from "../Еntities.ts";

const COLUMNS = [
  { name: "c_uid", alias: "uid" },
  { name: "c_login", alias: "login" },
  { name: "c_credentialid", alias: "credentialId" },
  { name: "c_publickey", alias: "publicKey" },
  { name: "c_signcount", alias: "signCount" },
];

const convertRow = (row: any) => {
  return {
    ...row,
    publicKey: JSON.parse(row.publicKey),
  };
};

const createUser = ({
  login,
  credentialId,
  publicKey,
  signCount,
}: {
  login: string;
  credentialId: string;
  publicKey: string;
  signCount: number;
}) => {
  return run(
    "INSERT INTO t_user (c_login, c_credentialid, c_publickey, c_signcount) values($login, $credentialId, $publicKey, $signCount)",
    {
      $login: login,
      $credentialId: credentialId,
      $publicKey: JSON.stringify(publicKey),
      $signCount: signCount,
    }
  );
};

const getUserByLogin = ({ login }: { login: string }): Promise<User> => {
  return get(
    `SELECT ${makeSelect(COLUMNS)} FROM t_user WHERE c_login = $login`,
    { $login: login },
    (row) => {
      if (!row) return;
      return convertRow(row);
    }
  );
};

const getUserByCredentialId = ({ credentialId }: { credentialId: string }) => {
  return get(
    `SELECT ${makeSelect(
      COLUMNS
    )} FROM t_user WHERE c_credentialid = $credentialId`,
    { $credentialId: credentialId },
    (row) => {
      if (!row) return;
      return convertRow(row);
    }
  );
};

const updateSignCount = ({
  credentialId,
  oldSignCount,
  newSignCount,
}: {
  credentialId: string;
  oldSignCount: number;
  newSignCount: number;
}) => {
  return run(
    "UPDATE t_user SET c_signcount = $newSignCount WHERE c_credentialid = $credentialId and c_signcount = $oldSignCount",
    {
      $credentialId: credentialId,
      $oldSignCount: oldSignCount,
      $newSignCount: newSignCount,
    }
  );
};

const getAllUsers = () => {
  return all(`SELECT ${makeSelect(COLUMNS)} FROM t_user`, {}, (rows) => {
    if (!rows) return;
    return rows.map((row) => convertRow(row));
  });
};

export {
  createUser,
  getUserByLogin,
  getAllUsers,
  getUserByCredentialId,
  updateSignCount,
};
