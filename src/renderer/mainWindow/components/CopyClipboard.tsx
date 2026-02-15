import {Button, Tooltip} from '@heroui/react';
import {Copy} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {memo, useCallback, useEffect, useRef, useState} from 'react';

type Props = {
  tooltipTitle?: string;
  showTooltip?: boolean;
  contentToCopy?: string;
  className?: string;
  onCopy?: () => void;
};

const CopyClipboard = memo(({showTooltip = true, tooltipTitle, contentToCopy, className, onCopy}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (onCopy) {
      onCopy();
    } else {
      if (contentToCopy) navigator.clipboard.writeText(contentToCopy);
    }

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
          <CheckRead className="size-5 animate-appearance-in" />
        ) : (
          <Copy className="size-4 animate-appearance-in" />
        )}
      </Button>
    </Tooltip>
  );
});

export default CopyClipboard;
