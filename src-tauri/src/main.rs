// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chacha20poly1305::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    ChaCha20Poly1305, Nonce, Key
};

use hex_literal::hex;
use pbkdf2::{pbkdf2_hmac, pbkdf2_hmac_array};
use sha2::Sha256;
use base64::{Engine as _, engine::general_purpose};
use pbkdf2::hmac::digest::generic_array::GenericArray;


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn encrypt(password: &str, plaintext: &str) -> String {
    let salt = b"salt";

    let key = pbkdf2_hmac_array::<Sha256, 32>(password.as_bytes(), salt, 1_000);
    let key = Key::from_slice(&key);

    let cipher = ChaCha20Poly1305::new(&key);
    let nonce = ChaCha20Poly1305::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, plaintext.as_bytes()).unwrap();

    general_purpose::STANDARD_NO_PAD.encode([nonce.as_slice(), &ciphertext[..]].concat())
}

#[tauri::command]
fn decrypt(password: &str, ciphertext: &str) -> String {
    let salt = b"salt";

    if let Ok(ciphertext) = general_purpose::STANDARD_NO_PAD.decode(ciphertext) {
        if ciphertext.len() < 12 {
            return String::from("Invalided ciphertext")
        }

        let nonce = Nonce::from_slice(&ciphertext[..12]);
        let ciphertext = &ciphertext[12..];

        let key = pbkdf2_hmac_array::<Sha256, 32>(password.as_bytes(), salt, 1_000);
        let key = Key::from_slice(&key);

        let cipher = ChaCha20Poly1305::new(&key);

        if let Ok(plaintext) = cipher.decrypt(nonce, ciphertext) {
            String::from_utf8(plaintext).unwrap_or(String::from("Non-UTF8"))
        } else {
            String::from("Invalid ciphertext")
        }
    } else {
        String::from("Invalid base64")
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, encrypt, decrypt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
