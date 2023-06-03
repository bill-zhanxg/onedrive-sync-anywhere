import { Button, Combobox, Option } from '@fluentui/react-components';
import { open } from '@tauri-apps/api/dialog';

import './FileSelector.css';

function FileSelector({ id, allowFile = false }: { id: 'targetDir' | 'oneDriveDir'; allowFile?: boolean }) {
	return (
		<div className="dir-inputs">
			<Combobox freeform aria-labelledby={id} placeholder="Select a Directory" size="large">
				{['hello', 'test'].map((option) => (
					<Option key={option}>{option}</Option>
				))}
			</Combobox>
			{allowFile && (
				<Button
					size="large"
					onClick={() =>
						open({
							title: 'Select a File',
						})
					}
				>
					Select File
				</Button>
			)}
			<Button
				size="large"
				onClick={() =>
					open({
						directory: true,
						title: 'Select a Directory',
					})
				}
			>
				{allowFile ? 'or': 'Select'} Folder
			</Button>
		</div>
	);
}

export default FileSelector;
