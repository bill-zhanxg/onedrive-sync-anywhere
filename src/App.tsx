import { Button, FluentProvider, Theme, useId, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useRef, useState } from 'react';

import './App.css';
import Description from './assets/Description';
import FileSelector from './assets/FileSelector';
import FileText from './assets/FileText';
import Titlebar from './assets/Titlebar';

// import { Store } from "tauri-plugin-store-api";
import LinkType from './assets/LinkType';

// const store = new Store(".settings.dat");

// await store.set("some-key", { value: 5 });

// const val = await store.get("some-key");
// assert(val, { value: 5 });

// await store.save(); // this manually saves the store, otherwise the store is only saved when your app is closed

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

	useEffect(() => {
		invoke('greet', { name: 'World' })
			.then((response) => console.log(response))
			.catch(() => null);

		handleMaximize();
		appWindow
			.theme()
			.then((theme) => {
				setLight(theme === 'dark' ? false : true);
			})
			.catch(() => null);

		appWindow.listen('tauri://theme-changed', (event) => setLight(event.payload === 'dark' ? false : true));

		appWindow.listen('tauri://resize', handleMaximize);

		appWindow.listen('tauri://focus', () => titlebar.current?.classList.remove('unfocused'));
		appWindow.listen('tauri://blur', () => titlebar.current?.classList.add('unfocused'));

		function handleMaximize() {
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
	}, []);

	const targetDirId = 'targetDir';
	const oneDriveDirId = 'oneDriveDir';

	return (
		<>
			<Titlebar titlebar={titlebar} maximized={maximized} lastButton={lastButton} />
			<FluentProvider ref={content} theme={light ? lightTheme : darkTheme} className="fluent-provider">
				<Description />
				<div className="file-options">
					<FileText id={targetDirId}>Target Location</FileText>
					<FileSelector id={targetDirId} allowFile />
					<FileText id={oneDriveDirId}>OneDrive Location</FileText>
					<FileSelector id={oneDriveDirId} />
					<LinkType />
					<Button className="create-btn" appearance="primary" size="large">
						Create Shortcut
					</Button>
				</div>
			</FluentProvider>
		</>
	);
}

export default App;
