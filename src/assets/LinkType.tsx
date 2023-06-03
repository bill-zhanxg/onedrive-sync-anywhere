import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Tab, TabList, Tooltip } from '@fluentui/react-components';
import { Icon } from '@fluentui/react/lib/Icon';

import './LinkType.css';

initializeIcons();
const AdminIcon = () => <Icon iconName="Admin" />;

function LinkType() {
	return (
		<div className="link-type">
			<TabList className="tablist" appearance="subtle" defaultSelectedValue="hard" size="small">
				<Tooltip
					content={
						"A hard link is a file system feature that allows multiple names to refer to the same file data on disk. It's like creating shortcuts to a file, but renaming or moving the original file does not affect the hard link. The hard link remains intact and still points to the correct file data, providing flexibility and convenience in managing files."
					}
					relationship="description"
				>
					<Tab value="hard">Hard Link</Tab>
				</Tooltip>
				<Tooltip
					content={
						'A soft link is a file system feature that creates a pointer to another file or directory. It acts as a symbolic reference, allowing you to access the target file or directory through the soft link. However, if the original file or directory is renamed or moved, the soft link may break and require updating. Administrator permission required.'
					}
					relationship="description"
				>
					<Tab icon={<AdminIcon />} value="soft">
						Soft Link
					</Tab>
				</Tooltip>
			</TabList>
		</div>
	);
}

export default LinkType;
