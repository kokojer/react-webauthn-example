import crypto from "crypto";

const newChallenge = () => {
  return crypto.randomBytes(32);
};

const encodeBase64 = (arrayBuffer: ArrayBufferLike) => {
  return Buffer.from(arrayBuffer).toString("base64url");
};

export { newChallenge, encodeBase64 };
