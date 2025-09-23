import {Card} from '@heroui/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {useMemo, useState} from 'react';

import CopyClipboard from '../../../Reusable/CopyClipboard';
import LaunchConfigSection from '../LaunchConfig-Section';

type Props = {text: string};
/** Show arguments as text for preview and clipboard copying */
export default function PreviewArguments({text}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {shouldTruncate, displayText} = useMemo(() => {
    const lines = text.split('\n');
    const shouldTruncate = lines.length > 3;
    const displayText = shouldTruncate && !isExpanded ? lines.slice(0, 3).join('\n') : text;

    return {shouldTruncate, displayText};
  }, [text, isExpanded]);

  return (
    <LaunchConfigSection
      title="Preview"
      description="Preview of the final result to be saved"
      customButton={<CopyClipboard contentToCopy={text} tooltipTitle="Copy Preview to Clipboard" showTooltip />}>
      {isEmpty(text) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_DEFAULT} description="No preview available to display" />
      ) : (
        <Card
          className={
            'relative border border-foreground-100 bg-white dark:bg-[#171717]' +
            ' shadow hover:shadow-md transition-all duration-200 p-4'
          }
          as="div">
          <div className="gap-y-2">
            <pre
              className={
                'whitespace-pre-wrap font-JetBrainsMono text-sm leading-relaxed text-foreground-800 break-words'
              }>
              {displayText}
              {shouldTruncate && !isExpanded && <span className="text-foreground-400">...</span>}
            </pre>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={'text-xs text-foreground-500 hover:text-primary-500 transition-colors'}>
                {isExpanded ? '... Collapse' : '... Expand'}
              </button>
            )}
          </div>
        </Card>
      )}
    </LaunchConfigSection>
  );
}
