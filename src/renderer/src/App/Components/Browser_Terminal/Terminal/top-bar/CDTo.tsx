import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip} from '@heroui/react';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {FolderDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../RendererIpc';
import {useLynxToast} from '../../../../Utils/UtilHooks';

type Props = {id: string};
const CDTo = memo(({id}: Props) => {
  const [history, setHistory] = useState<string[]>([]);
  const toast = useLynxToast();

  const cdTo = useCallback(
    (dir: string) => {
      if (!history.includes(dir)) {
        rendererIpc.storage.update('terminal', {cdHistory: [dir, ...history]});
        setHistory(prevState => [dir, ...prevState]);
      }

      const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';
      rendererIpc.pty.write(id, `cd "${dir}"${LINE_ENDING}`);
    },
    [history],
  );

  const selectDir = useCallback(() => {
    rendererIpc.file
      .openDlg({properties: ['openDirectory']})
      .then(dir => {
        if (dir) {
          cdTo(dir);
        } else {
          toast.warning('No directory selected');
        }
      })
      .catch(e => {
        console.error(e);
        toast.error('Error opening directory');
      });
  }, [id, cdTo]);

  useEffect(() => {
    rendererIpc.storage.get('terminal').then(({cdHistory}) => {
      if (!isEmpty(cdHistory)) setHistory(cdHistory);
    });
  }, []);

  const items = useMemo(() => {
    return [
      <DropdownItem key="select folder" onPress={selectDir}>
        Select Folder
      </DropdownItem>,
      ...history.map(item => (
        <DropdownItem key={item} onPress={() => cdTo(item)}>
          {item}
        </DropdownItem>
      )),
    ];
  }, [history]);

  return (
    <Dropdown>
      <Tooltip delay={500} content="CD to...">
        <div className="max-w-fit">
          <DropdownTrigger>
            <Button size="sm" variant="light" isIconOnly>
              <FolderDuo_Icon className="size-3.5" />
            </Button>
          </DropdownTrigger>
        </div>
      </Tooltip>
      <DropdownMenu aria-label="cd history">{items}</DropdownMenu>
    </Dropdown>
  );
});

export default CDTo;
