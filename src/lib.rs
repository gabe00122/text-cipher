use wasm_bindgen::prelude::*;


// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


use chacha20poly1305::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    ChaCha20Poly1305, Nonce, Key
};

use pbkdf2::pbkdf2_hmac_array;
use sha2::Sha256;

const SALT: [u8; 16] = [64, 140, 125, 35, 226, 180, 39, 81, 248, 178, 119, 236, 9, 70, 3, 171];

#[wasm_bindgen]
pub fn generate_key(password: &str) -> Vec<u8> {
    Vec::from(pbkdf2_hmac_array::<Sha256, 32>(password.as_bytes(), &SALT[..], 600_000))
}

#[wasm_bindgen]
pub fn encrypt(key: &[u8], plaintext: &str) -> Option<Vec<u8>> {
    if key.len() != 32 {
        return None
    }

    let key = Key::from_slice(key);

    let cipher = ChaCha20Poly1305::new(key);
    let nonce = ChaCha20Poly1305::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, plaintext.as_bytes()).unwrap();

    Some([nonce.as_slice(), &ciphertext[..]].concat())
}

#[wasm_bindgen]
pub fn decrypt(key: &[u8], ciphertext: &[u8]) -> String {
    if key.len() != 32 {
        return String::from("invaild")
    }

    let key = Key::from_slice(key);

    if ciphertext.len() < 12 {
        return String::from("invaild")
    }

    let nonce = Nonce::from_slice(&ciphertext[..12]);
    let ciphertext = &ciphertext[12..];

    let cipher = ChaCha20Poly1305::new(&key);

    if let Ok(plaintext) = cipher.decrypt(nonce, ciphertext) {
        String::from_utf8(plaintext).unwrap_or(String::from("invaild"))
    } else {
        String::from("invaild")
    }
}
