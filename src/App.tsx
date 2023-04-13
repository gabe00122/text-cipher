import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [plaintext, setPlaintext] = useState("");

  const [ciphertext2, setCiphertext2] = useState("");
  const [plaintext2, setPlaintext2] = useState("");

  useEffect(() => {
    encrypt();
  }, [plaintext, password]);

  useEffect(() => {
    decrypt();
  }, [ciphertext2, password]);

  async function encrypt() {
    setCiphertext(await invoke("encrypt", { password, plaintext }));
  }

  async function decrypt() {
    setPlaintext2(await invoke("decrypt", { password, ciphertext: ciphertext2 }));
  }

  return (
    <div>
      <div>
        <input
          type="text"
          autoCorrect="off"
          autoCapitalize="none"
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password"
        />
      </div>
      <div>
        <textarea
          value={plaintext}
          onChange={(e) => setPlaintext(e.currentTarget.value)}
          placeholder="Enter plaintext"
        />
      </div>
      <div>
        <textarea value={ciphertext} onChange={(e) => setCiphertext(e.currentTarget.value)}></textarea>
      </div>
      <div>
        <textarea value={ciphertext2} onChange={(e) => setCiphertext2(e.currentTarget.value)}></textarea>
      </div>
      <div>
        <textarea
          value={plaintext2}
          onChange={(e) => setPlaintext2(e.currentTarget.value)}
          placeholder="Enter plaintext"
        />
      </div>
    </div>
  );
}

export default App;
