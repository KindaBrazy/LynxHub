import {Button} from '@heroui/react';
import {Card, Empty, Typography} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback} from 'react';

import {Copy_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import LynxTooltip from '../../../Reusable/LynxTooltip';
import LaunchConfigSection from '../LaunchConfig-Section';

const {Paragraph} = Typography;

type Props = {text: string};

/** Show arguments as text for preview and clipboard copying */
export default function PreviewArguments({text}: Props) {
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      lynxTopToast.success('Copied to clipboard successfully.');
    } catch (_) {
      lynxTopToast.error('Error: Unable to copy to clipboard.');
    }
  }, [text]);

  return (
    <LaunchConfigSection
      customButton={
        <LynxTooltip content="Copy Preview to Clipboard" isEssential>
          <Button size="sm" variant="light" onPress={onCopy} className="cursor-default" isIconOnly>
            <Copy_Icon className="size-3.5" />
          </Button>
        </LynxTooltip>
      }
      title="Preview"
      description="Preview of the final result to be saved">
      {isEmpty(text) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No preview available to display" />
      ) : (
        <>
          <Card variant="borderless" className={`cursor-default dark:bg-black/40`} hoverable>
            <Paragraph
              ellipsis={{expandable: 'collapsible', rows: 2}}
              className="size-full whitespace-pre-line !font-JetBrainsMono">
              {text}
            </Paragraph>
          </Card>
        </>
      )}
    </LaunchConfigSection>
  );
}
