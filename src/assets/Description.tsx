import './Description.css';

function Description() {
	return (
		<div className="main-description">
			<div className="title">
				<img src="/onedrive-sync-anywhere.png" alt="OneDrive Sync Anywhere" width={50} />
				<p>OneDrive Sync Anywhere</p>
			</div>
			<p>
				This app syncs files outside the OneDrive folder using a Directory Junction, allowing seamless synchronization
				and easy access to specific files with OneDrive.
			</p>
		</div>
	);
}

export default Description;
