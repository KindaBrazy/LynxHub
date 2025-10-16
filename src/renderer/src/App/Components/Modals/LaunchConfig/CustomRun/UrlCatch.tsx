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
        label="Url Catch"
        selectedKeys={[type]}
        selectionMode="single"
        labelPlacement="outside"
        onSelectionChange={onTypeChange}
        description="Define how app detect the ui url from terminal."
        classNames={{trigger: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack'}}
        disallowEmptySelection>
        <SelectItem key="module" description="the default module implementation.">
          Module Default
        </SelectItem>
        <SelectItem key="findLine" description="find line include text and extract url.">
          Find Line
        </SelectItem>
        <SelectItem key="custom" description="your custom url.">
          Custom Url
        </SelectItem>
        <SelectItem key="nothing" description="No ui needed.">
          Do Nothing
        </SelectItem>
      </Select>
      {type === 'findLine' && (
        <Input
          classNames={{
            mainWrapper: 'w-full',
            inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
          }}
          variant="flat"
          value={findLine}
          spellCheck="false"
          label="Line that includes: "
          labelPlacement="outside-left"
          onValueChange={onFindLineChange}
          description="Find the line printed in terminal that includes this text and extract url from it."
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
            label="Custom URL: "
            labelPlacement="outside-left"
            onValueChange={onCustomUrlChange}
            description="The target url to open in browser"
          />
          <NumberInput
            classNames={{
              mainWrapper: 'w-full',
              inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack',
            }}
            value={delay}
            spellCheck="false"
            label="Open after: "
            onValueChange={onDelayChange}
            labelPlacement="outside-left"
            description="Open the custom url after delay."
            endContent={<span className="text-foreground-600 text-sm">Seconds</span>}
          />
        </>
      )}
    </>
  );
}
