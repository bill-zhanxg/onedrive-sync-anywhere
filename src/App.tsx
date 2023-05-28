import { Combobox, FluentProvider, Option, Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { ChromeCloseIcon, ChromeMinimizeIcon, ChromeRestoreIcon, StopIcon } from '@fluentui/react-icons-mdl2';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useRef, useState } from 'react';

import './App.css';
import './Titlebar.css';

function App() {
	const lightTheme: Theme = {
		...webLightTheme,
		colorNeutralBackground1: '#00000000',
	};
	const darkTheme: Theme = {
		...webDarkTheme,
		colorNeutralBackground1: '#00000000',
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

		appWindow
			.theme()
			.then((theme) => {
				setLight(theme === 'dark' ? false : true);
			})
			.catch(() => null);

		appWindow.listen('tauri://theme-changed', (event) => {
			setLight(event.payload === 'dark' ? false : true);
			console.log(event);
		});

		appWindow.listen('tauri://resize', () => {
			appWindow
				.isMaximized()
				.then((maximized) => {
					setMaximized(maximized);
					[titlebar, content, lastButton].forEach((ref) => {
						if (ref.current) ref.current.style.borderRadius = maximized ? '0' : '';
					});
				})
				.catch(() => null);
		});

		appWindow.listen('tauri://focus', () => {
			titlebar.current?.classList.remove('unfocused');
		});
		appWindow.listen('tauri://blur', () => {
			titlebar.current?.classList.add('unfocused');
		});
	}, []);

	return (
		<>
			<div data-tauri-drag-region className="titlebar" ref={titlebar}>
				<div data-tauri-drag-region className="titlebar-title">
					<img data-tauri-drag-region src="/onedrive-sync-anywhere.png" alt="OneDrive Sync Anywhere" width={20} />
					<p data-tauri-drag-region>OneDrive Sync Anywhere</p>
				</div>
				<div className="titlebar-buttons">
					<div className="titlebar-button" onClick={() => appWindow.minimize()}>
						<ChromeMinimizeIcon />
					</div>
					<div className="titlebar-button" onClick={() => appWindow.toggleMaximize()}>
						{maximized ? <ChromeRestoreIcon /> : <StopIcon />}
					</div>
					<div className="titlebar-button" ref={lastButton} onClick={() => appWindow.close()}>
						<ChromeCloseIcon />
					</div>
				</div>
			</div>
			<div className="content" ref={content}>
				<FluentProvider theme={light ? lightTheme : darkTheme} className="fluent-provider">
					<div className="file-options">
						<label>Target Directory</label>
						<Combobox freeform placeholder="Select a Directory">
							{['hello', 'test'].map((option) => (
								<Option key={option}>{option}</Option>
							))}
						</Combobox>
					</div>
				</FluentProvider>
			</div>
		</>
	);
}

export default App;
