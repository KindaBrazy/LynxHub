import {Input} from '@heroui/react';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {fetchFavIconUrl, formatWebAddress} from '../../../../../../cross/CrossUtils';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';

type Props = {runningCard: RunningCard};

export default function AddressInput({runningCard}: Props) {
  const activeTab = useTabsState('activeTab');

  const [value, setValue] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;

      input.onfocus = () => input.select();

      input.onkeydown = e => {
        const target = formatWebAddress(input.value || '');
        if (e.key === 'Enter') {
          dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: target}));

          fetchFavIconUrl(target)
            .then(fav => {
              rendererIpc.storageUtils.addBrowserRecent({url: target, favIcon: fav});
            })
            .catch(() => {
              rendererIpc.storageUtils.addBrowserRecent({url: target});
            });

          input.blur();
        }
      };
    }
  }, [inputRef]);

  useEffect(() => {
    const {webUIAddress, customAddress, currentAddress} = runningCard;
    const address = currentAddress || customAddress || webUIAddress;

    const prefixRegex = /^(?:https?:\/\/)?(?:www\.)?/i;

    const match = address.match(prefixRegex);
    const prefix_value = match ? match[0] : '';
    const target = address.replace(prefixRegex, '');

    setPrefix(prefix_value);
    setValue(target);
  }, [runningCard]);

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
      placeholder="Type here to start browsing..."
      startContent={<span className="text-small text-default-400">{prefix}</span>}
    />
  );
}
