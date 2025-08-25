import {Card} from '@heroui/react';
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
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 mb-4 opacity-30">
            <svg viewBox="0 0 64 64" className="size-full fill-current text-gray-400">
              <path
                d={
                  'M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 ' +
                  '32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'
                }
              />
              <path opacity="0.3" d="M28 20v8h-8v8h8v8h8v-8h8v-8h-8v-8z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No preview available to display</p>
        </div>
      ) : (
        <Card
          className={
            'relative rounded-lg border border-foreground-100 bg-white dark:bg-[#171717]' +
            ' shadow-sm hover:shadow-md transition-all duration-200 p-4'
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
