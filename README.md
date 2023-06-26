# Onedrive Sync Anywhere

This app allows the user to sync files outside the OneDrive folder by creating a Directory Junction, allowing seamless synchronization and easy access to specific files with OneDrive.

## Goals

- [x] Use WinUI design (both light and dark theme)
- [x] Learn Rust
- [x] Learn Tauri
- [x] Make the app work
- [x] Add CLI support: use `onedrive-sync-anywhere.exe --help` for more info where `onedrive-sync-anywhere.exe` is the file name

## Things I wish I did

- [ ] Use Microsoft best supported language for Windows with prebuilt WinUI components (C#)
- [ ] Use winapi-rs instead of windows-rs, it's seems to be more easy to use

## To build it yourself

- Make sure you have Rust and Node.js installed
- Run `npm install` to install all required dependencies
- All scripts can be found in `package.json`
- Refer to [Tauri's documentation](https://tauri.app/v1/guides/) for more information
- Common commands: `npm run tauri dev` to run the app in development mode, `npm run tauri build` to build the app
