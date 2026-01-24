import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip} from '@heroui/react';
import {lynxTopToast} from '@lynx/hooks/utils';
import {AppDispatch} from '@lynx/redux/store';
import {CloseSimple_Icon, FolderDuo_Icon, OpenFolder_Icon, Trash_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import ptyIpc from '@lynx_shared/ipc/pty';
import storageIpc from '@lynx_shared/ipc/storage';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

type Props = {id: string};
const CDTo = memo(({id}: Props) => {
  const [history, setHistory] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const cdTo = useCallback(
    (dir: string) => {
      const newHistory = [dir, ...history.filter(item => item !== dir)];

      storageIpc.update('terminal', {cdHistory: newHistory});
      setHistory(newHistory);

      const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';
      ptyIpc.write(id, `cd "${dir}"${LINE_ENDING}`);
    },
    [history],
  );

  const removeFromHistory = useCallback(
    (dir: string) => {
      const newHistory = history.filter(item => item !== dir);

      storageIpc.update('terminal', {cdHistory: newHistory});
      setHistory(newHistory);
    },
    [history],
  );

  const clearHistory = useCallback(() => {
    storageIpc.update('terminal', {cdHistory: []});
    setHistory([]);
  }, []);

  const selectDir = useCallback(() => {
    filesIpc
      .openDlg({properties: ['openDirectory']})
      .then(dir => {
        if (dir) {
          cdTo(dir);
        } else {
          lynxTopToast(dispatch).warning('No directory selected');
        }
      })
      .catch(e => {
        console.error(e);
        lynxTopToast(dispatch).error('Error opening directory');
      });
  }, [id, cdTo]);

  useEffect(() => {
    storageIpc.get('terminal').then(({cdHistory}) => {
      if (!isEmpty(cdHistory)) setHistory(cdHistory);
    });
  }, []);

  const items = useMemo(() => {
    const baseItems = [
      <DropdownItem key="select folder" onPress={selectDir} endContent={<OpenFolder_Icon />}>
        Choose folder…
      </DropdownItem>,
    ];

    baseItems.push(
      ...history.map(item => (
        <DropdownItem
          endContent={
            <Button
              onPress={() => {
                removeFromHistory(item);
              }}
              size="sm"
              color="danger"
              variant="light"
              isIconOnly>
              <Trash_Icon className="size-3" />
            </Button>
          }
          key={item}
          onPress={() => cdTo(item)}>
          {item}
        </DropdownItem>
      )),
    );

    if (!isEmpty(history)) {
      baseItems.push(
        <DropdownItem
          color="danger"
          key="clear_history"
          onPress={clearHistory}
          className="text-danger"
          endContent={<CloseSimple_Icon />}>
          Clear folder history
        </DropdownItem>,
      );
    }

    return baseItems;
  }, [history, selectDir, clearHistory, cdTo, removeFromHistory]);

  return (
    <Dropdown
      closeOnSelect={false}
      className="bg-foreground-100"
      classNames={{base: 'before:bg-foreground-100'}}
      showArrow>
      <Tooltip delay={500} content="Change terminal directory (cd)">
        <div className="max-w-fit">
          <DropdownTrigger>
            <Button size="sm" variant="light" isIconOnly>
              <FolderDuo_Icon className="size-3.5" />
            </Button>
          </DropdownTrigger>
        </div>
      </Tooltip>
      <DropdownMenu aria-label="Change directory history">{items}</DropdownMenu>
    </Dropdown>
  );
});

export default CDTo;
