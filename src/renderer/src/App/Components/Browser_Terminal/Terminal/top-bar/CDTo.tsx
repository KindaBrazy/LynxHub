import {Button, Tooltip} from '@heroui/react';
import {memo, useCallback} from 'react';

import {FolderDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../RendererIpc';
import {useLynxToast} from '../../../../Utils/UtilHooks';

type Props = {id: string};
const CDTo = memo(({id}: Props) => {
  const toast = useLynxToast();

  const onButtonPress = useCallback(() => {
    rendererIpc.file
      .openDlg({properties: ['openDirectory']})
      .then(dir => {
        if (dir) {
          const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';
          rendererIpc.pty.write(id, `cd "${dir}"${LINE_ENDING}`);
        } else {
          toast.warning('No directory selected');
        }
      })
      .catch(e => {
        console.error(e);
        toast.error('Error opening directory');
      });
  }, [id]);

  return (
    <Tooltip delay={500} content="CD to...">
      <Button size="sm" variant="light" onPress={onButtonPress} isIconOnly>
        <FolderDuo_Icon className="size-3.5" />
      </Button>
    </Tooltip>
  );
});

export default CDTo;
