import {Input, NumberInput, Select, Selection, SelectItem} from '@heroui/react';
import {CustomRunBehaviorData} from '@lynx_common/types/ipc';
import {useMemo} from 'react';

type UrlCatchType = CustomRunBehaviorData['urlCatch'];

export const initialUrlCatch: UrlCatchType = {
  type: 'module',
  moduleDelay: 0,
  delay: 5,
  customUrl: undefined,
  findLine: undefined,
};

type Props = {
  value?: UrlCatchType;
  onUpdate: (newValue: UrlCatchType) => void;
};

export function UrlCatch({value = initialUrlCatch, onUpdate}: Props) {
  const {type, findLine, customUrl, delay, moduleDelay} = useMemo(() => {
    return value;
  }, [value]);

  const onTypeChange = (selection: Selection) => {
    if (selection && selection !== 'all') {
      const result = selection.values().next().value as UrlCatchType['type'];
      onUpdate({...value, type: result});
    }
  };

  const onFindLineChange = (val: string) => {
    onUpdate({...value, findLine: val});
  };

  const onCustomUrlChange = (val: string) => {
    onUpdate({...value, customUrl: val});
  };

  const onDelayChange = (val: number) => {
    onUpdate({...value, delay: val});
  };

  const onModuleDelayChange = (val: number) => {
    onUpdate({...value, moduleDelay: val});
  };

  return (
    <>
      <Select
        selectedKeys={[type]}
        selectionMode="single"
        labelPlacement="outside"
        label="URL Detection Method"
        onSelectionChange={onTypeChange}
        classNames={{trigger: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack'}}
        description="Choose how the application will detect the user interface (UI) URL from the terminal output."
        disallowEmptySelection>
        <SelectItem key="module" description="Uses the default, built-in method provided by the module.">
          Module Default Detection
        </SelectItem>
        <SelectItem
          key="findLine"
          description="Scans the terminal output for a specific line of text to locate and extract the URL.">
          Scan for Specific Line
        </SelectItem>
        <SelectItem key="custom" description="Define a fixed URL to be opened instead of relying on terminal output.">
          Use Custom URL
        </SelectItem>
        <SelectItem key="nothing" description="No browser will be opened, as no UI URL is needed.">
          Do Not Open UI
        </SelectItem>
      </Select>
      {type === 'module' && (
        <NumberInput
          classNames={{
            mainWrapper: 'w-full',
            inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
          }}
          description={
            'Set a delay before opening the URL detected by the module. This only affects Module Default Detection.'
          }
          minValue={0}
          spellCheck="false"
          value={moduleDelay}
          label="Module URL Open Delay: "
          onValueChange={onModuleDelayChange}
          endContent={<span className="text-foreground-600 text-sm">Seconds</span>}
        />
      )}
      {type === 'findLine' && (
        <Input
          classNames={{
            mainWrapper: 'w-full',
            inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
          }}
          description={
            'Enter the unique text snippet the application should look for in the terminal output' +
            ' to identify the line containing the URL.'
          }
          variant="flat"
          value={findLine}
          spellCheck="false"
          label="Line Must Contain: "
          onValueChange={onFindLineChange}
        />
      )}
      {type === 'custom' && (
        <>
          <Input
            classNames={{
              mainWrapper: 'w-full',
              inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
            }}
            variant="flat"
            value={customUrl}
            spellCheck="false"
            label="Target URL: "
            onValueChange={onCustomUrlChange}
            description="Specify the exact web address (URL) to be automatically opened in the browser."
          />
          <NumberInput
            classNames={{
              mainWrapper: 'w-full',
              inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
            }}
            description={
              'Set a delay before opening the custom URL. This can be useful for waiting' +
              ' until the application is fully ready.'
            }
            value={delay}
            spellCheck="false"
            label="Open After Delay: "
            onValueChange={onDelayChange}
            endContent={<span className="text-foreground-600 text-sm">Seconds</span>}
          />
        </>
      )}
    </>
  );
}
