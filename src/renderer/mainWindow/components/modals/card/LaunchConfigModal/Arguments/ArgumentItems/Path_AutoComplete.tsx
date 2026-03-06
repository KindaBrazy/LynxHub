import {Autocomplete, AutocompleteItem} from '@heroui/react';
import {FolderListData} from '@lynx_common/types';
import filesIpc from '@lynx_shared/ipc/files';
import {File, Folder} from '@solar-icons/react-perf/BoldDuotone';
import {Key, useEffect, useState} from 'react';

import {searchInStrings} from '../../../../../../utils';

type Props = {
  /** The base directory to start relative paths from */
  baseDir: string;
  /** Whether to look for files or folders */
  type?: 'folder' | 'file';
  /** Callback when the value changes */
  onValueChange?: (value: string) => void;
  /** Initial value */
  defaultValue?: string;
};

/**
 * Autocomplete component for file system paths.
 * Lists files and directories relative to a base directory.
 */
export default function PathAutoComplete({baseDir, onValueChange, defaultValue = './', type = 'file'}: Props) {
  const [inputValue, setInputValue] = useState<string>(defaultValue);
  const [data, setData] = useState<FolderListData[]>([]);
  const [searchData, setSearchData] = useState<FolderListData[]>([]);

  // Fetch directory contents based on current input path
  useEffect(() => {
    if (inputValue.startsWith('.') || inputValue.startsWith('/')) {
      const relatives = inputValue.split('/');
      // Remove the last segment to get the directory to list
      relatives.pop();

      filesIpc
        .listDir(baseDir, relatives)
        .then((result: FolderListData[]) => {
          let filteredResult = result;
          if (type === 'folder') {
            filteredResult = result.filter(dir => dir.type === 'folder');
          }
          setData(filteredResult);

          // Also update search data immediately if we just loaded a new dir
          // This logic might need refinement to filter based on the current last segment
          const lastSegment = inputValue.split('/').pop() || '';
          if (lastSegment) {
            const lowerLast = lastSegment.toLowerCase();
            setSearchData(filteredResult.filter(item => searchInStrings(lowerLast, [item.name])));
          } else {
            setSearchData(filteredResult);
          }
        })
        .catch(error => {
          console.error('Failed to list directory:', error);
        });
    }
  }, [inputValue, baseDir, type]);

  // Sync state with prop if it changes
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== inputValue) {
      setInputValue(defaultValue.replaceAll('\\', '/'));
    }
  }, [defaultValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value.replaceAll('\\', '/'));
    onValueChange?.(value);
    if (value === '') {
      setSearchData([]);
      return;
    }

    // Filter existing data for immediate feedback
    const segments = value.toLowerCase().split('/');
    const lastSegment = segments[segments.length - 1];

    // We filter the *current* data. If the user moved to a new dir (e.g. typed '/'),
    // the useEffect will kick in and fetch new data eventually.
    setSearchData(data.filter(item => searchInStrings(lastSegment, [item.name])));
  };

  const onSelectionChange = (key: Key | null) => {
    if (key !== null) {
      let currentSelection = key.toString();
      if (!currentSelection.includes('.') && !currentSelection.endsWith('/')) currentSelection = currentSelection + '/';
      setInputValue(prev => {
        const segments = prev.split('/');
        segments[segments.length - 1] = currentSelection;
        const newValue = segments.join('/');

        // Defer the callback to avoid side effects in render/state update cycle
        setTimeout(() => onValueChange?.(newValue), 0);
        return newValue;
      });
    }
  };

  return (
    <Autocomplete
      inputProps={{
        classNames: {
          input: 'text-xs',
          inputWrapper: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird',
        },
      }}
      items={searchData}
      selectedKey={null}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSelectionChange={onSelectionChange}
      aria-label="Relative Path Autocomplete"
      selectorButtonProps={{className: 'hidden'}}
      classNames={{selectorButton: 'bg-red-500!'}}
      allowsCustomValue>
      {item => (
        <AutocompleteItem
          key={item.name}
          textValue={item.name}
          startContent={item.type === 'folder' ? <Folder className="size-4" /> : <File className="size-4" />}>
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
