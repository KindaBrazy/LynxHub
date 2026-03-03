import {Card, CardBody} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {InboxLine} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {useMemo, useState} from 'react';

import CopyClipboard from '../../../../CopyClipboard';
import LaunchConfigSection from '../LaunchConfigSection';

type Props = {text: string};

/**
 * Show arguments as text for preview and clipboard copying.
 */
export default function ArgumentsPreview({text}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {shouldTruncate, displayText} = useMemo(() => {
    if (isEmpty(text)) return {shouldTruncate: false, displayText: ''};

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
        <EmptyStateCard
          className="m-0"
          bodyClassName="py-8"
          icon={<InboxLine size={40} />}
          description="No preview available to display"
        />
      ) : (
        <Card
          className={
            'relative border border-foreground-100 bg-white dark:bg-[#171717] shadow hover:shadow-md' +
            ' transition-all duration-200'
          }
          shadow="none">
          <CardBody className="p-4 gap-y-2">
            <pre
              className={
                'whitespace-pre-wrap font-JetBrainsMono text-sm leading-relaxed text-foreground-800 wrap-break-word'
              }>
              {displayText}
              {shouldTruncate && !isExpanded && <span className="text-foreground-400">...</span>}
            </pre>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-foreground-500 hover:text-primary-500 transition-colors self-start">
                {isExpanded ? '... Collapse' : '... Expand'}
              </button>
            )}
          </CardBody>
        </Card>
      )}
    </LaunchConfigSection>
  );
}
