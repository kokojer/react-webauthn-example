import reactLogo from "/react.svg";
import webauthnLogo from "/webauthn.svg";
import "./App.css";
import { login, register } from "./webauthn.ts";
import { useState } from "react";

function App() {
  const [userName, setUserName] = useState("");
  return (
    <>
      <div>
        <a href="https://webauthn.io/" target="_blank">
          <img src={webauthnLogo} className="logo" alt="WebAuthn logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WebAuthn + React example</h1>
      <input
        placeholder="Login"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <div className="buttonContainer">
        <button onClick={() => register(userName)}>Registration</button>
        <button onClick={() => login(userName)}>Login</button>
      </div>
    </>
  );
}

export default App;
