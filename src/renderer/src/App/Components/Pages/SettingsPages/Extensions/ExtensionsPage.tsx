import Page from '../../Page';
import ExtensionList from './ExtensionList';
import ExtensionPreview from './ExtensionPreview';

export const extensionsRoutePath: string = '/extensionPage';

export default function ExtensionsPage() {
  return (
    <Page className="flex flex-row gap-x-6 relative">
      <ExtensionList />
      <ExtensionPreview />
    </Page>
  );
}
