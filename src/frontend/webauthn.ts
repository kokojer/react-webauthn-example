import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/typescript-types";

export const register = async (username: string) => {
  if (!username) return alert("Username can't be empty");

  const response = await fetch(`/api/register`, {
    method: "POST",
    body: JSON.stringify({ login: username }),
    headers: {
      "content-type": "application/json",
    },
  });

  if (response.status !== 200) {
    if (response.status === 409) {
      alert("Username already registered (409)");
    }
  }

  const attObj: PublicKeyCredentialCreationOptionsJSON = await response.json();
  let attResp;

  try {
    attResp = await startRegistration(attObj);
  } catch (error) {
    alert(error);
    return;
  }

  const result = await fetch(`/api/make-new-credential`, {
    method: "POST",
    body: JSON.stringify(Object.assign(attResp, { login: username })),
    headers: {
      "content-type": "application/json",
    },
  });
  alert(`Username registered ${(await result.json()).login}`);
};

export const login = async (username: string) => {
  const response = await fetch(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ login: username }),
    headers: {
      "content-type": "application/json",
    },
  });
  if (response.status !== 200) {
    if (response.status === 404) {
      throw new Error("Username not found (404)");
    }
  }

  const attObj = await response.json();

  let asseResp;
  try {
    asseResp = await startAuthentication(attObj);
  } catch (error) {
    alert(error);
    return;
  }

  const verificationResp = await fetch("/api/verify-assertion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asseResp),
  });

  // Wait for the results of verification
  const verificationJSON = await verificationResp.json();
  alert(`Login successful for "${verificationJSON.login}"`);
};
