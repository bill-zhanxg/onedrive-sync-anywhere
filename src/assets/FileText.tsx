import { Tooltip } from '@fluentui/react-components';

function FileText({ id, children }: { id: 'targetDir' | 'oneDriveDir'; children?: React.ReactNode }) {
	return (
		<div style={{ width: 'max-content' }}>
			<Tooltip
				content={
					id === 'targetDir'
						? 'This is the file or directory that you want to sync with OneDrive'
						: 'This is the destination directory in OneDrive where you want to synchronize your selected files or folders'
				}
				relationship="description"
			>
				<label style={{ fontSize: '1rem' }} id={id}>
					{children}
				</label>
			</Tooltip>
		</div>
	);
}

export default FileText;
