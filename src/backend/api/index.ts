import express from "express";
import * as Persistence from "../persistence/index.ts";
import { encodeBase64 } from "../util/common-util.ts";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import Cbor from "cbor";

interface ExtendedRegistrationResponseJSON extends RegistrationResponseJSON {
  login: string;
}

const router = express.Router();

const WEBAUTHN_DOMAIN = process.env.WEBAUTHN_DOMAIN;

const rpID = "localhost";

const origin = `http://localhost:5000`;
router.post("/register", async (req, res) => {
  try {
    const { login } = req.body;
    console.log(`Call /api/register with login: ${login}`);

    if (!login) {
      console.error("login can't be empty");
      res.sendStatus(400);
      return;
    }

    const user = await Persistence.UserDAO.getUserByLogin({ login });

    if (user) {
      console.warn("login already exists");
      res.sendStatus(409);
      return;
    }

    const options = await generateRegistrationOptions({
      rpName: "webauthn demo server",
      rpID,
      userID: login,
      userName: login,
      attestationType: "none",
    });

    await Persistence.ChallengeDAO.createChallenge({
      login,
      id: options.challenge,
    });

    res.json(options);
  } catch (e) {
    console.log("Error on /api/register", e);
    res.sendStatus(500);
  }
});

router.post("/make-new-credential", async (req, res) => {
  try {
    const attestation: ExtendedRegistrationResponseJSON = req.body;
    //Костыль - проверяю наличие ожидаемого челенджа ручками, т.к verifyRegistrationResponse не принимает async функцию
    const challenge = JSON.parse(
      atob(attestation?.response?.clientDataJSON),
    ).challenge;

    const expectedChallenge = await Persistence.ChallengeDAO.getChallengeById({
      id: challenge,
    });

    if (!expectedChallenge) return res.status(400);

    let verification;

    try {
      verification = await verifyRegistrationResponse({
        response: attestation,
        expectedChallenge: expectedChallenge?.id,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }
    console.log(verification);
    if (verification.verified && verification.registrationInfo) {
      await Persistence.UserDAO.createUser({
        login: attestation.login,
        credentialId: encodeBase64(verification.registrationInfo.credentialID),
        publicKey: encodeBase64(
          verification.registrationInfo.credentialPublicKey,
        ),
        signCount: verification.registrationInfo?.counter,
      });
    }
    // Load user by credentialId
    const user = await Persistence.UserDAO.getUserByCredentialId({
      credentialId: encodeBase64(verification.registrationInfo?.credentialID),
    });
    res.json({ login: user.login });
  } catch (e) {
    console.log("Error on /api/make-new-credential", e);
    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login } = req.body;

    const user = await Persistence.UserDAO.getUserByLogin({ login });

    const options = await generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: [
        {
          id: Buffer.from(user.credentialId, "base64url"),
          type: "public-key",
          transports: [],
        },
      ],
    });

    await Persistence.ChallengeDAO.createChallenge({
      login,
      id: options.challenge,
    });

    res.json(options);
  } catch (e) {
    console.log("Error on /api/login", e);
    res.sendStatus(500);
  }
});

router.post("/verify-assertion", async (req, res) => {
  try {
    const assertion = req.body;
    console.log("Verfiy assertion", assertion);

    const user = await Persistence.UserDAO.getUserByCredentialId({
      credentialId: assertion.id,
    });

    const challenge = JSON.parse(
      atob(assertion?.response?.clientDataJSON),
    ).challenge;

    const expectedChallenge = (
      await Persistence.ChallengeDAO.getChallengeById({
        id: challenge,
      })
    )?.id;

    if (!expectedChallenge) return res.status(400);

    if (!user) {
      console.error("User not found");
      res.sendStatus(404);
      return;
    }

    try {
      await verifyAuthenticationResponse({
        response: assertion,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          counter: user.signCount,
          credentialPublicKey: Buffer.from(user.publicKey, "base64url"),
          credentialID: Buffer.from(user.credentialId, "base64url"),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    res.json({ login: user.login });
  } catch (e) {
    console.log("Error on /api/verify-assertion", e);
    res.sendStatus(500);
  }
});

export default router;
