import {Input} from '@heroui/react';
import {useEffect, useMemo, useRef, useState} from 'react';

type Props = {address: string};

export default function AddressInput({address}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('focus', () => inputRef.current?.select());
    }
  }, [inputRef]);

  const {prefix, target} = useMemo(() => {
    const prefixRegex = /^(?:https?:\/\/)?(?:www\.)?/i;

    const match = address.match(prefixRegex);
    const prefix = match ? match[0] : '';
    const target = address.replace(prefixRegex, '');

    return {prefix, target};
  }, [address]);

  const [value, setValue] = useState<string>('');

  useEffect(() => setValue(target), [target]);

  return (
    <Input
      classNames={{
        inputWrapper: 'dark:bg-[#181818] dark:data-[hover=true]:bg-[#151515] dark:group-data-[focus=true]:bg-[#121212]',
      }}
      size="sm"
      radius="full"
      value={value}
      ref={inputRef}
      className="mx-2"
      spellCheck="false"
      onValueChange={setValue}
      startContent={<span className="text-small text-default-400">{prefix}</span>}
    />
  );
}
