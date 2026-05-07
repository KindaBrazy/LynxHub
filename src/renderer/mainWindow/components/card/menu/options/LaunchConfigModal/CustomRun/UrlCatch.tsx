import {Description, Input, Key, Label, ListBox, NumberField, Select, Separator, TextField} from '@heroui/react';
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

  const onTypeChange = (key: Key | null) => {
    if (!key || typeof key === 'number') return;

    const result = key as UrlCatchType['type'];
    onUpdate({...value, type: result});
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
    <div className="flex flex-col gap-y-2 pt-2">
      <Select value={type} onChange={onTypeChange} fullWidth>
        <Label>URL Detection Method</Label>
        <Select.Trigger>
          <Select.Value>
            {({selectedText}) => {
              return <span>{selectedText}</span>;
            }}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="module" textValue="Module Default Detection">
              <div className="flex flex-col">
                <Label>Module Default Detection</Label>
                <Description>Uses the default, built-in method provided by the module.</Description>
              </div>
            </ListBox.Item>
            <ListBox.Item id="findLine" textValue="Scan for Specific Line">
              <div className="flex flex-col">
                <Label>Scan for Specific Line</Label>
                <Description>
                  Scans the terminal output for a specific line of text to locate and extract the URL.
                </Description>
              </div>
            </ListBox.Item>
            <ListBox.Item id="custom" textValue="Use Custom URL">
              <div className="flex flex-col">
                <Label>Use Custom URL</Label>
                <Description>Define a fixed URL to be opened instead of relying on terminal output.</Description>
              </div>
            </ListBox.Item>
            <ListBox.Item id="nothing" textValue="Do Not Open UI">
              <div className="flex flex-col">
                <Label>Do Not Open UI</Label>
                <Description>No browser will be opened, as no UI URL is needed.</Description>
              </div>
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
        <Description>
          Choose how the application will detect the user interface (UI) URL from the terminal output.
        </Description>
      </Select>

      {type === 'module' && (
        <NumberField minValue={0} value={moduleDelay} onChange={onModuleDelayChange} fullWidth>
          <Label>Module URL Open Delay: (Seconds)</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
          <Description>
            Set a delay before opening the URL detected by the module. This only affects Module Default Detection.
          </Description>
        </NumberField>
      )}

      {type === 'findLine' && (
        <TextField value={findLine} spellCheck="false" onChange={onFindLineChange} fullWidth>
          <Label>Line Must Contain:</Label>
          <Input placeholder="Enter text..." />
          <Description>
            Enter the unique text snippet the application should look for in the terminal output to identify the line
            containing the URL.
          </Description>
        </TextField>
      )}

      {type === 'custom' && (
        <>
          <TextField type="url" value={customUrl} onChange={onCustomUrlChange} fullWidth>
            <Label>Target URL:</Label>
            <Input placeholder="Enter url..." />
            <Description>Specify the exact web address (URL) to be automatically opened in the browser.</Description>
          </TextField>
          <NumberField minValue={0} value={delay} onChange={onDelayChange} fullWidth>
            <Label>Open After Delay: (Seconds)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>
              Set a delay before opening the custom URL. This can be useful for waiting until the application is fully
              ready.
            </Description>
          </NumberField>
        </>
      )}
    </div>
  );
}
