import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [encryptCiphertext, setEncryptCiphertext] = useState("");
  const [encryptPlaintext, setEncryptPlaintext] = useState("");
  const [decryptCiphertext, setDecryptCiphertext] = useState("");
  const [decryptPlaintext, setDecryptPlaintext] = useState("");

  useEffect(() => {
    encrypt();
  }, [encryptPlaintext, secretKey]);

  useEffect(() => {
    decrypt();
  }, [decryptCiphertext, secretKey]);

  async function encrypt() {
    setEncryptCiphertext(encodeBinary(await invoke("encrypt", { key: decodeBinary(secretKey), plaintext: encryptPlaintext })));
  }

  async function decrypt() {
    setDecryptPlaintext(await invoke("decrypt", { key: decodeBinary(secretKey), ciphertext: decodeBinary(decryptCiphertext) }));
  }

  async function generateKey() {
    setSecretKey(encodeBinary(await invoke("generate_key", { password })));
  }

  return (
    <div>
      <div className="password-container">
        <div>
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            type="text"
            autoCorrect="off"
            autoCapitalize="none"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Enter password"
          />
        </div>

        <div>
          <button onClick={() => generateKey()}>Generate Key</button>
        </div>

        <div>
          <label htmlFor="key-input">Secret Key</label>
          <input
            id="key-input"
            type="text"
            autoCorrect="off"
            autoCapitalize="none"
            value={secretKey}
            onChange={(e) => setSecretKey(e.currentTarget.value)}
            placeholder="Secret Key"
            style={{ width: "300px" }}
          />
        </div>
      </div>
      <div className="container">
        <div>
          <div>
            <label htmlFor="encryption-plaintext-input">Encryption Plaintext</label>
            <textarea
              id="encryption-plaintext-input"
              autoCorrect="off"
              autoCapitalize="none"
              value={encryptPlaintext}
              onChange={(e) => setEncryptPlaintext(e.currentTarget.value)}
              placeholder="Enter plaintext to encrypt"
            />
          </div>
          <div>
            <label htmlFor="encryption-ciphertext-output">Encryption Ciphertext</label>
            <textarea id="encryption-ciphertext-output" value={encryptCiphertext} onChange={(e) => setEncryptCiphertext(e.currentTarget.value)} readOnly></textarea>
          </div>
        </div>
        <div>
          <div>
            <label htmlFor="decryption-ciphertext-input">Decryption Ciphertext</label>
            <textarea
              id="decryption-ciphertext-input"
              autoCorrect="off"
              autoCapitalize="none"
              value={decryptCiphertext}
              onChange={(e) => setDecryptCiphertext(e.currentTarget.value)}
              placeholder="Enter ciphertext to decrypt"
            ></textarea>
          </div>
          <div>
            <label htmlFor="decryption-plaintext-output">Decryption Plaintext</label>
            <textarea
              id="decryption-plaintext-output"
              value={decryptPlaintext}
              onChange={(e) => setDecryptPlaintext(e.currentTarget.value)}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const test = [];

for (let i = 0; i < 256; i++) {
  test[i] = i;
}

const dc = decodeBinary(encodeBinary(test));
for (let i = 0; i < 256; i++) {
  if (test[i] !== dc[i]) {
    console.log(`Not equil: ${test[i]} ${dc[i]}`)
  }
}


function encodeBinary(value: number[]): string {
  return value.map((x) => {
    if (x <= 93) {
      return x + 33;
    } else if (x <= 105) {
      return x + 67;
    } else {
      return x + 68;
    }
  }).map((x) => String.fromCodePoint(x)).join('');
}

function decodeBinary(value: string): number[] {
  return value.split('').map((x) => x.codePointAt(0)!).map((x) => {
    if (x > 173) {
      return x - 68;
    } else if (x > 127) {
      return x - 67;
    } else {
      return x - 33;
    }
  });
}


export default App;
