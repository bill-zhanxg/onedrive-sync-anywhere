import { Button, Combobox, Option } from '@fluentui/react-components';
import { open } from '@tauri-apps/api/dialog';
import { useEffect, useState } from 'react';
import { Store } from 'tauri-plugin-store-api';

import './FileSelector.css';

function FileSelector({
	id,
	store,
	allowFile = false,
	path,
	setPath,
}: {
	id: 'targetDir' | 'oneDriveDir';
	store: Store;
	allowFile?: boolean;
	path: string;
	setPath: React.Dispatch<React.SetStateAction<string>>;
}) {
	const [history, setHistory] = useState<string[]>([]);

	useEffect(() => {
		store
			.get(id)
			.then((history) => {
				if (history && Array.isArray(history) && history.length > 0) setHistory(history as string[]);
			})
			.catch(() => null);
	}, [id, store]);

	async function onDialogSelectionClick(file: boolean) {
		const path = await open({
			directory: !file,
			title: file ? 'Select a File' : 'Select a Directory',
		});
		if (!path || Array.isArray(path)) return;
		setPath(path);
		if (!history.includes(path)) setHistory((history) => [...history, path].slice(-5));
		else
			setHistory((history) => {
				const index = history.indexOf(path);
				return [...history.slice(0, index), ...history.slice(index + 1), path];
			});
	}

	useEffect(() => {
		store
			.set(id, history)
			.then(() => store.save())
			.catch(() => null);
	}, [history, id, store]);

	return (
		<div className="dir-inputs">
			<Combobox
				freeform
				aria-labelledby={id}
				value={path}
				placeholder="Select an item"
				size="large"
				onChange={(event) => setPath(event.target.value)}
				onOptionSelect={(_, data) => {
					if (data.optionValue) setPath(data.optionValue);
				}}
			>
				{(history.length > 0 ? history.slice().reverse() : [{ label: 'Nothing here yet' }]).map((path) =>
					typeof path === 'string' ? (
						<Option key={path}>{path}</Option>
					) : (
						<Option key={path.label} disabled>
							{path.label}
						</Option>
					),
				)}
			</Combobox>
			{allowFile && (
				<Button size="large" onClick={() => onDialogSelectionClick(true)}>
					Select File
				</Button>
			)}
			<Button size="large" onClick={() => onDialogSelectionClick(false)}>
				Select Folder
			</Button>
		</div>
	);
}

export default FileSelector;
