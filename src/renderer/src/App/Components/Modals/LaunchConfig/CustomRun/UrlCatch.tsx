import {Input, NumberInput, Select, Selection, SelectItem} from '@heroui/react';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {CustomRunBehaviorData} from '../../../../../../../cross/IpcChannelAndTypes';
import rendererIpc from '../../../../RendererIpc';

type UrlCatchType = CustomRunBehaviorData['urlCatch'];

const initialUrlCatch: UrlCatchType = {
  type: 'module',
  delay: 5,
  customUrl: undefined,
  findLine: undefined,
};

type Props = {id: string};
export function UrlCatch({id}: Props) {
  const [urlCatchValue, setUrlCatchValue] = useState<UrlCatchType>(initialUrlCatch);

  const {type, findLine, customUrl, delay} = useMemo(() => {
    return urlCatchValue;
  }, [urlCatchValue]);

  const onTypeChange = (value: Selection) => {
    if (value && value !== 'all') {
      const result = value.values().next().value as UrlCatchType['type'];
      setUrlCatchValue(prev => ({...prev, type: result}));
      rendererIpc.storageUtils.updateCustomRunBehavior({
        cardID: id,
        urlCatch: {...urlCatchValue, type: result},
      });
    }
  };

  const onFindLineChange = (value: string) => {
    setUrlCatchValue(prev => ({...prev, findLine: value}));
    rendererIpc.storageUtils.updateCustomRunBehavior({
      cardID: id,
      urlCatch: {...urlCatchValue, findLine: value},
    });
  };

  const onCustomUrlChange = (value: string) => {
    setUrlCatchValue(prev => ({...prev, customUrl: value}));
    rendererIpc.storageUtils.updateCustomRunBehavior({
      cardID: id,
      urlCatch: {...urlCatchValue, customUrl: value},
    });
  };

  const onDelayChange = (value: number) => {
    setUrlCatchValue(prev => ({...prev, delay: value}));
    rendererIpc.storageUtils.updateCustomRunBehavior({
      cardID: id,
      urlCatch: {...urlCatchValue, delay: value},
    });
  };

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
      if (!isEmpty(result.customRunBehavior)) {
        const data = result.customRunBehavior.find(customRun => customRun.cardID === id);
        if (data) setUrlCatchValue(data.urlCatch);
      }
    });
  }, [id]);

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
          labelPlacement="outside-left"
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
            labelPlacement="outside-left"
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
            labelPlacement="outside-left"
            endContent={<span className="text-foreground-600 text-sm">Seconds</span>}
          />
        </>
      )}
    </>
  );
}
