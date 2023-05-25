import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon } from '@fluentui/react/lib/Icon';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { useRef, useState } from 'react';

import './App.css';
import './Titlebar.css';

function App() {
	invoke('greet', { name: 'World' })
		.then((response) => console.log(response))
		.catch(() => null);

	initializeIcons();
	const Minimize = () => <Icon iconName="ChromeMinimize" />;
	const Stop = () => <Icon iconName="Stop" />;
	const Restore = () => <Icon iconName="ChromeRestore" />;
	const Close = () => <Icon iconName="ChromeClose" />;
	const [maximized, setMaximized] = useState(false);
	const titlebar = useRef<HTMLDivElement>(null);
	const lastButton = useRef<HTMLDivElement>(null);
	const content = useRef<HTMLDivElement>(null);

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

	return (
		<>
			<div data-tauri-drag-region className="titlebar" ref={titlebar}>
				<div className="titlebar-title">
					<img src="/onedrive-sync-anywhere.png" alt="OneDrive Sync Anywhere" width={20} />
					<p>OneDrive Sync Anywhere</p>
				</div>
				<div className="titlebar-buttons">
					<div className="titlebar-button" onClick={() => appWindow.minimize()}>
						<Minimize />
					</div>
					<div className="titlebar-button" onClick={() => appWindow.toggleMaximize()}>
						{maximized ? <Restore /> : <Stop />}
					</div>
					<div className="titlebar-button" ref={lastButton} onClick={() => appWindow.close()}>
						<Close />
					</div>
				</div>
			</div>
			<div className="content" ref={content}></div>
		</>
	);
}

export default App;
