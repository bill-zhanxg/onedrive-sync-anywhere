// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![feature(windows_by_handle)]

use clap::Parser;
use colored::Colorize;
use std::{env, fs, os::windows::fs::MetadataExt, path::PathBuf, process::Command};
use windows::{
    core::PCWSTR,
    Win32::Foundation::HWND,
    Win32::System::Console::{AttachConsole, ATTACH_PARENT_PROCESS},
    Win32::UI::Shell::ShellExecuteW,
    Win32::UI::WindowsAndMessaging::SHOW_WINDOW_CMD,
};

/// Allows the user to sync files outside the OneDrive folder by creating a shortcut
#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Create a soft link (default hard link)
    #[arg(short, long)]
    soft: bool,

    /// This is the file or directory that you want to sync with OneDrive
    target: Option<String>,

    /// This is the destination directory in OneDrive where you want to synchronize your selected files or folders
    onedrive: Option<String>,
}

fn main() {
    let args = Args::try_parse();
    match args {
        Ok(args) => {
            if args.soft || args.target.is_some() || args.onedrive.is_some() {
                unsafe {
                    AttachConsole(ATTACH_PARENT_PROCESS);
                }

                let target = match &args.target {
                    Some(val) => val,
                    None => {
                        print_error("TARGET");
                        std::process::exit(1);
                    }
                };
                let onedrive = match &args.onedrive {
                    Some(val) => val,
                    None => {
                        print_error("ONEDRIVE");
                        std::process::exit(1);
                    }
                };

                println!("{}\n{}", target, onedrive);
                match create_shortcut(PathBuf::from(target), PathBuf::from(onedrive), !args.soft) {
                    Ok(val) => {
                        println!("{}", val.bright_green());
                        std::process::exit(0);
                    }
                    Err(err) => {
                        println!("{}", err.bright_red());
                        std::process::exit(1);
                    }
                }

                fn print_error(arg_name: &str) {
                    println!(
                        "{} a value is required for '{}' but none was supplied\n\nFor more information, try '{}'.",
                        "error:".bright_red(),
                        format!("[{arg_name}]").yellow(),
                        "--help".bright_white(),
                    );
                }
            }
        }
        Err(err) => {
            unsafe {
                AttachConsole(ATTACH_PARENT_PROCESS);
            }
            let _ = err.print();
            std::process::exit(1);
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![create_shortcut])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_shortcut(
    target_path: PathBuf,
    one_drive_path: PathBuf,
    hard_link: bool,
) -> Result<String, String> {
    if !target_path.exists() {
        return Err("Target location does not exist".to_string());
    }
    if !one_drive_path.exists() {
        return Err("OneDrive location does not exist".to_string());
    }
    if one_drive_path.is_file() {
        return Err("OneDrive location can not be a file".to_string());
    }

    let target_name = match target_path.file_name() {
        Some(val) => val,
        None => return Err("Can not get file name of target location".to_string()),
    };

    let one_drive_new_path = one_drive_path.join(target_name);

    if one_drive_new_path.exists() {
        return Err(format!(
            "Path already exists: {}",
            one_drive_new_path.display().to_string()
        ));
    }

    let target_metadata = match target_path.metadata() {
        Ok(val) => val,
        Err(_) => return Err("Can not get metadata of target location".to_string()),
    };
    let one_drive_metadata = match one_drive_path.metadata() {
        Ok(val) => val,
        Err(_) => return Err("Can not get metadata of OneDrive location".to_string()),
    };

    if hard_link {
        if target_path.is_file() {
            // Check if both path is in the same drive if the target is a file
            if match target_metadata.volume_serial_number() {
                Some(val) => val,
                None => {
                    return Err("Can not get volume serial number of target location".to_string())
                }
            } != match one_drive_metadata.volume_serial_number() {
                Some(val) => val,
                None => {
                    return Err("Can not get volume serial number of OneDrive location".to_string())
                }
            } {
                return Err(
                    "You chose hard link but Target and OneDrive location is not in the same drive"
                        .to_string(),
                );
            }

            if let Err(err) = fs::hard_link(&target_path, &one_drive_new_path) {
                return Err(format!("Failed to create hard link: {}", err.to_string()));
            }
        } else {
            // Rust does not support directory junction, run a command instead
            let output = match Command::new("cmd")
                .args([
                    "/C",
                    "mklink",
                    "/J",
                    &one_drive_new_path.display().to_string(),
                    &target_path.display().to_string(),
                ])
                .output()
            {
                Ok(val) => val,
                Err(err) => return Err(format!("The command prompt failed to start {:?}", err)),
            };
            if !output.status.success() {
                return Err(String::from_utf8(output.stderr)
                    .unwrap_or_else(|_| "Failed to create hard link".to_string()));
            }
        }
    } else {
        // This is a privileged operation, so we need to run as admin
        // https://learn.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shellexecutew
        let r = unsafe {
            ShellExecuteW(
                HWND(std::ptr::null_mut::<u8>() as isize), // hwnd
                str_to_pcwstr("runas"),                    // lpOperation
                str_to_pcwstr("cmd.exe"),                  // lpFile
                str_to_pcwstr(&format!(
                    "/C mklink{} \"{}\" \"{}\"",
                    if target_path.is_file() { "" } else { " /D" },
                    (match one_drive_path.canonicalize() {
                        Ok(val) => val,
                        Err(_) => return Err("Can not resolve OneDrive location".to_string()),
                    })
                    .join(target_name)
                    .display(),
                    (match target_path.canonicalize() {
                        Ok(val) => val,
                        Err(_) => return Err("Can not resolve target location".to_string()),
                    })
                    .display()
                )), // lpParameters
                PCWSTR::null(),                            // lpDirectory
                SHOW_WINDOW_CMD(0),                        // nShowCmd
            )
        };
        if r.0 < 32 {
            return Err(format!("Error starting command prompt, code: {}", r.0));
        } else {
            // No Error will be thrown if it's just a command error
            // So tell the user the operation might be successful
            return Ok("Operation might be successful, suggest verify".to_string());
        }
    }

    return Ok("Operation successful".to_string());
}

fn str_to_pcwstr(s: &str) -> PCWSTR {
    let u16_vec: Vec<u16> = s.encode_utf16().chain(Some(0)).collect();
    PCWSTR(u16_vec.as_ptr())
}
