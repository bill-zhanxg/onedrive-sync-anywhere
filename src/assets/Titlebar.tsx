import { ChromeCloseIcon, ChromeMinimizeIcon, ChromeRestoreIcon, StopIcon } from '@fluentui/react-icons-mdl2';
import { appWindow } from '@tauri-apps/api/window';

import './Titlebar.css';

function Titlebar({
	titlebar,
	maximized,
	lastButton,
}: {
	titlebar: React.RefObject<HTMLDivElement>;
	maximized: boolean;
	lastButton: React.RefObject<HTMLDivElement>;
}) {
	return (
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
	);
}

export default Titlebar;
