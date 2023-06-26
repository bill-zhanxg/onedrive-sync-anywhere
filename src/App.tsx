import { Button, Field, FluentProvider, Spinner, Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import type { Slot } from '@fluentui/react-utilities';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useRef, useState } from 'react';
import { Store } from 'tauri-plugin-store-api';
import { StateFlags, saveWindowState } from 'tauri-plugin-window-state-api';

import './App.css';
import Description from './assets/Description';
import FileSelector from './assets/FileSelector';
import FileText from './assets/FileText';
import LinkType from './assets/LinkType';
import Titlebar from './assets/Titlebar';

const store = new Store('.history.dat');
function App() {
	const newTheme: Partial<Theme> = {
		colorNeutralBackground1: 'var(--background-color)',
	};

	const lightTheme: Theme = {
		...webLightTheme,
		...newTheme,
	};
	const darkTheme: Theme = {
		...webDarkTheme,
		...newTheme,
	};

	const [maximized, setMaximized] = useState(false);
	const titlebar = useRef<HTMLDivElement>(null);
	const lastButton = useRef<HTMLDivElement>(null);
	const content = useRef<HTMLDivElement>(null);
	const [light, setLight] = useState(true);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [validation, setValidation] = useState<{
		status?: 'success' | 'error' | 'warning' | 'none';
		message?: Slot<'div'>;
	}>({ status: undefined, message: undefined });

	const [targetPath, setTargetPath] = useState('');
	const [oneDrivePath, setOneDrivePath] = useState('');
	const [hardLink, setHardLink] = useState(true);

	useEffect(() => {
		handleMaximize();
		appWindow
			.theme()
			.then((theme) => setLight(theme === 'dark' ? false : true))
			.catch(() => null);

		const unlisten = Promise.all([
			appWindow.listen('tauri://theme-changed', (event) => setLight(event.payload === 'dark' ? false : true)),
			appWindow.listen('tauri://resize', handleMaximize),
			appWindow.listen('tauri://move', handleResize),
			appWindow.listen('tauri://focus', () => titlebar.current?.classList.remove('unfocused')),
			appWindow.listen('tauri://blur', () => titlebar.current?.classList.add('unfocused')),
		]);

		function handleMaximize() {
			handleResize();
			appWindow
				.isMaximized()
				.then((maximized) => {
					setMaximized(maximized);
					[titlebar, content, lastButton].forEach((ref) => {
						if (ref.current) ref.current.style.borderRadius = maximized ? '0' : '';
					});
				})
				.catch(() => null);
		}

		function handleResize() {
			saveWindowState(StateFlags.ALL);
		}

		return () => {
			unlisten.then((unlisten) => unlisten.forEach((unlisten) => unlisten())).catch(() => null);
		};
	}, []);

	function createShortcut() {
		setButtonLoading(true);
		setValidation({ status: undefined, message: undefined });

		invoke<string>('create_shortcut', { targetPath, oneDrivePath, hardLink })
			.then((result: string) => {
				setValidation({ status: 'success', message: result });
				setButtonLoading(false);
			})
			.catch((err: string | unknown) => {
				if (typeof err === 'string') setValidation({ status: 'error', message: err });
				else setValidation({ status: 'error', message: 'An unknown error occurred' });
				setButtonLoading(false);
			});
	}

	const targetDirId = 'targetDir';
	const oneDriveDirId = 'oneDriveDir';

	return (
		<>
			<Titlebar titlebar={titlebar} maximized={maximized} lastButton={lastButton} />
			<FluentProvider id="fluent-provider" ref={content} theme={light ? lightTheme : darkTheme}>
				<Description />
				<div className="file-options">
					<FileText id={targetDirId}>Target Location</FileText>
					<FileSelector id={targetDirId} store={store} allowFile path={targetPath} setPath={setTargetPath} />
					<FileText id={oneDriveDirId}>OneDrive Location</FileText>
					<FileSelector id={oneDriveDirId} store={store} path={oneDrivePath} setPath={setOneDrivePath} />
					<LinkType setHardLink={setHardLink} />
					<Field className="create" validationState={validation.status} validationMessage={validation.message}>
						<Button
							className="create-btn"
							appearance="primary"
							size="large"
							icon={buttonLoading ? <Spinner size="tiny" /> : <></>}
							onClick={createShortcut}
							disabled={buttonLoading}
						>
							Create Shortcut
						</Button>
					</Field>
				</div>
			</FluentProvider>
		</>
	);
}

export default App;
