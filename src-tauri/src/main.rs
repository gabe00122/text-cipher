// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chacha20poly1305::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    ChaCha20Poly1305, Nonce, Key
};

use pbkdf2::pbkdf2_hmac_array;
use sha2::Sha256;

const SALT: [u8; 16] = [64, 140, 125, 35, 226, 180, 39, 81, 248, 178, 119, 236, 9, 70, 3, 171];

#[tauri::command]
fn generate_key(password: &str) -> [u8; 32] {
    pbkdf2_hmac_array::<Sha256, 32>(password.as_bytes(), &SALT[..], 600_000)
}

#[tauri::command]
fn encrypt(key: Vec<u8>, plaintext: &str) -> Option<Vec<u8>> {
    if key.len() != 32 {
        return None
    }

    let key = Key::from_slice(&key);

    let cipher = ChaCha20Poly1305::new(key);
    let nonce = ChaCha20Poly1305::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, plaintext.as_bytes()).unwrap();

    Some([nonce.as_slice(), &ciphertext[..]].concat())
}

#[tauri::command]
fn decrypt(key: Vec<u8>, ciphertext: Vec<u8>) -> String {
    if key.len() != 32 {
        return String::from("invaild")
    }

    let key = Key::from_slice(&key);

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![generate_key, encrypt, decrypt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
