import {Button} from '@heroui/react';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, useCallback, useState} from 'react';

import {CheckDuo_Icon, CopyDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';

type Props = {
  serializeAddon: SerializeAddon;
};

const CopyAll = memo(({serializeAddon}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = useCallback(() => {
    const contentToCopy = serializeAddon.serialize();
    if (!contentToCopy) return;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [serializeAddon]);

  return (
    <Button size="sm" variant="light" onPress={handleCopy} isIconOnly>
      {copied ? (
        <CheckDuo_Icon className="size-5 animate-appearance-in" />
      ) : (
        <CopyDuo_Icon className="size-4 animate-appearance-in" />
      )}
    </Button>
  );
});
export default CopyAll;
