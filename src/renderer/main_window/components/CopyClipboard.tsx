import {Button, Tooltip} from '@heroui/react';
import {CheckDuo_Icon, CopyDuo_Icon} from '@lynx_assets/icons';
import {memo, useCallback, useEffect, useRef, useState} from 'react';

type Props = {tooltipTitle?: string; showTooltip?: boolean; contentToCopy: string; className?: string};

const CopyClipboard = memo(({showTooltip = true, tooltipTitle, contentToCopy, className}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
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
      <Button size="sm" variant="light" onPress={handleCopy} className={className} isIconOnly>
        {copied ? (
          <CheckDuo_Icon className="size-5 animate-appearance-in" />
        ) : (
          <CopyDuo_Icon className="size-4 animate-appearance-in" />
        )}
      </Button>
    </Tooltip>
  );
});

export default CopyClipboard;
