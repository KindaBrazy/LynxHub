import {Card, Empty, Typography} from 'antd';
import {isEmpty} from 'lodash';

import CopyClipboard from '../../../Reusable/CopyClipboard';
import LaunchConfigSection from '../LaunchConfig-Section';

const {Paragraph} = Typography;

type Props = {text: string};

/** Show arguments as text for preview and clipboard copying */
export default function PreviewArguments({text}: Props) {
  return (
    <LaunchConfigSection
      title="Preview"
      description="Preview of the final result to be saved"
      customButton={<CopyClipboard contentToCopy={text} tooltipTitle="Copy Preview to Clipboard" showTooltip />}>
      {isEmpty(text) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No preview available to display" />
      ) : (
        <Card variant="borderless" className={`cursor-default dark:bg-black/40`} hoverable>
          <Paragraph
            ellipsis={{expandable: 'collapsible', rows: 2}}
            className="size-full whitespace-pre-line !font-JetBrainsMono">
            {text}
          </Paragraph>
        </Card>
      )}
    </LaunchConfigSection>
  );
}
