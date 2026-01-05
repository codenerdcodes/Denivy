use std::fs;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn scan_documents() -> Vec<String> {
    let mut files = Vec::new();

    if let Some(dir) = dirs::document_dir() {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                files.push(entry.path().display().to_string());
            }
        }
    }

    files
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![scan_documents])
    .run(tauri:generate_context!())
    .expect("error while runing tauri application");
}
