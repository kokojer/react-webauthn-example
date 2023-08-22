import reactLogo from "/react.svg";
import webauthnLogo from "/webauthn.svg";
import "./App.css";

function App() {
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
      <input placeholder="Login" />
      <div className="buttonContainer">
        <button>Registration</button>
        <button>Login</button>
      </div>
    </>
  );
}

export default App;
