export interface User {
  uid: number;
  login: string;
  credentialId: string;
  publicKey: string;
  signCount: number;
}

export interface Challenge {
  login: string;
  id: string;
  validUntil: string;
}
