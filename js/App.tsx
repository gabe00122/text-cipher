import { useEffect, useState } from "react";
import { generate_key, encrypt, decrypt } from "../pkg/index";

function App() {
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [encryptCiphertext, setEncryptCiphertext] = useState("");
  const [encryptPlaintext, setEncryptPlaintext] = useState("");
  const [decryptCiphertext, setDecryptCiphertext] = useState("");
  const [decryptPlaintext, setDecryptPlaintext] = useState("");

  useEffect(() => {
    jsEncrypt();
  }, [encryptPlaintext, secretKey]);

  useEffect(() => {
    jsDecrypt();
  }, [decryptCiphertext, secretKey]);

  function jsEncrypt() {
    const binaryKey = textAsBinary(secretKey);
    const binaryCiphertext = encrypt(binaryKey, encryptPlaintext);

    setEncryptCiphertext(binaryAsText(binaryCiphertext));
  }

  function jsDecrypt() {
    const binaryKey = textAsBinary(secretKey);
    const binaryCiphertext = textAsBinary(decryptCiphertext);
    const plaintext = decrypt(binaryKey, binaryCiphertext);

    setDecryptPlaintext(plaintext);
  }

  function jsGenerateKey() {
    setSecretKey(binaryAsText(generate_key(password)));
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
          <button onClick={() => jsGenerateKey()}>Generate Key</button>
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

const test = new Uint8Array(256);

for (let i = 0; i < 256; i++) {
  test[i] = i;
}

const dc = textAsBinary(binaryAsText(test));
for (let i = 0; i < 256; i++) {
  if (test[i] !== dc[i]) {
    console.log(`Not equil: ${test[i]} ${dc[i]}`)
  }
}


function binaryAsText(value: Uint8Array | undefined): string {
  if (value === undefined) {
    return '';
  }

  return Array.from(value).map((x) => {
    if (x <= 93) {
      return x + 33;
    } else if (x <= 105) {
      return x + 67;
    } else {
      return x + 68;
    }
  }).map((x) => String.fromCodePoint(x)).join('');
}

function textAsBinary(value: string): Uint8Array {
  return new Uint8Array(value.split('').map((x) => x.codePointAt(0)!).map((x) => {
    if (x > 173) {
      return x - 68;
    } else if (x > 127) {
      return x - 67;
    } else {
      return x - 33;
    }
  }));
}


export default App;
