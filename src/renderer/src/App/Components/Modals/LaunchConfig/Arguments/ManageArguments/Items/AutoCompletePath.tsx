import {Autocomplete, AutocompleteItem} from '@heroui/react';
import {Key, useEffect, useState} from 'react';

import {FolderListData} from '../../../../../../../../../cross/CrossTypes';
import {File_Icon, Folder2_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons1';
import rendererIpc from '../../../../../../RendererIpc';
import {searchInStrings} from '../../../../../../Utils/UtilFunctions';

type Props = {
  baseDir: string;
  type?: 'folder' | 'file';
  onValueChange?: (value: string) => void;
  defaultValue?: string;
};

export default function AutoCompletePath({baseDir, onValueChange, defaultValue, type = 'file'}: Props) {
  const [inputValue, setInputValue] = useState<string>('./');

  const [data, setData] = useState<FolderListData[]>([]);
  const [searchData, setSearchData] = useState<FolderListData[]>([]);

  useEffect(() => {
    if (defaultValue?.startsWith('.') || defaultValue?.startsWith('/')) {
      setInputValue(defaultValue);
      const relatives = defaultValue?.split('/') || [];
      relatives.pop();
      rendererIpc.file
        .listDir(baseDir, relatives)
        .then((result: FolderListData[]) => {
          let filteredResult = result;
          if (type === 'folder') {
            filteredResult = result.filter(dir => dir.type === 'folder');
          }
          setData(filteredResult);
          setSearchData(filteredResult);
        })
        .catch(_e => {
          console.error(_e);
        });
    }
  }, [defaultValue, type]);

  useEffect(() => {
    if (inputValue.startsWith('.') || inputValue.startsWith('/')) {
      const relatives = inputValue ? inputValue.split('/') : [];
      rendererIpc.file
        .listDir(baseDir, relatives)
        .then((result: FolderListData[]) => {
          let filteredResult = result;
          if (type === 'folder') {
            filteredResult = result.filter(dir => dir.type === 'folder');
          }
          setData(filteredResult);
        })
        .catch(_e => {
          console.error(_e);
        });
      onValueChange?.(inputValue);
    }
  }, [inputValue, type]);

  const onInputChange = (value: string) => {
    if (value === '') {
      setSearchData([]);
    } else {
      const words = value.toLowerCase().split('/');
      const endValue = words[words.length - 1];
      setSearchData(data.filter(item => searchInStrings(endValue, [item.name])));
    }
    setInputValue(value);
  };

  const selectionChange = (key: Key | null) => {
    setInputValue(prevState => {
      const segments = prevState.split('/');
      if (key !== null) {
        segments[segments.length - 1] = key.toString();
        return segments.join('/');
      }
      return prevState;
    });
  };

  return (
    <Autocomplete
      size="sm"
      items={searchData}
      selectedKey={null}
      inputValue={inputValue}
      aria-label="relative path"
      onInputChange={onInputChange}
      onSelectionChange={selectionChange}
      selectorButtonProps={{className: 'hidden'}}
      allowsCustomValue>
      {item => (
        <AutocompleteItem
          key={item.name.toLowerCase()}
          startContent={item.type === 'folder' ? <Folder2_Icon /> : <File_Icon />}>
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
