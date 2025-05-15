import {Button, Tooltip} from '@heroui/react';
import {useCallback, useState} from 'react';

import {CheckDuo_Icon, CopyDuo_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';

type Props = {tooltipTitle?: string; showTooltip?: boolean; contentToCopy: string; className?: string};

export default function CopyClipboard({showTooltip = true, tooltipTitle, contentToCopy, className}: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [contentToCopy]);

  return (
    <Tooltip
      radius="sm"
      delay={500}
      isDisabled={!showTooltip}
      content={copied ? 'Copied!' : tooltipTitle || 'Copy to clipboard'}
      showArrow>
      <Button size="sm" variant="light" onPress={handleCopy} className={`cursor-default ${className}`} isIconOnly>
        {copied ? (
          <CheckDuo_Icon className="size-5 animate-appearance-in" />
        ) : (
          <CopyDuo_Icon className="size-4 animate-appearance-in" />
        )}
      </Button>
    </Tooltip>
  );
}
