import {DropdownItem} from '@nextui-org/react';
import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {HomeSmile_Icon, Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {OpenFolder_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export const MenuInfo = () => {
  const {id, extensionsDir, repoUrl, setMenuIsOpen, title} = useCardData();
  const webUI = useInstalledCard(id);
  const {name} = useDevInfo(repoUrl);

  const dispatch = useDispatch<AppDispatch>();

  const [ctrlPressed, setCtrlPressed] = useState<boolean>(false);
  const showOpenFolder = useMemo(() => {
    return !!webUI?.dir && ctrlPressed;
  }, [webUI, ctrlPressed]);

  useHotkeys(
    'ctrl',
    () => {
      setCtrlPressed(true);
    },
    {
      keydown: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );
  useHotkeys(
    'ctrl',
    () => {
      setCtrlPressed(false);
    },
    {
      keyup: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  const onPress = () => {
    if (showOpenFolder) {
      rendererIpc.file.openPath(webUI!.dir!);
      setCtrlPressed(false);
    } else {
      dispatch(modalActions.openCardInfo({cardId: id, devName: name, extensionsDir, title, url: repoUrl}));
      setMenuIsOpen(false);
    }
  };

  return (
    <DropdownItem
      key="information"
      onPress={onPress}
      className="cursor-default"
      title={showOpenFolder ? 'Open Folder' : 'Information'}
      startContent={showOpenFolder ? <OpenFolder_Icon /> : <Info_Icon />}
    />
  );
};

export const MenuHomePage = () => {
  const {repoUrl, title, setMenuIsOpen} = useCardData();

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openReadme({url: repoUrl, title}));
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, repoUrl, title]);

  return (
    <DropdownItem
      key="homepage"
      title="HomePage"
      onPress={onPress}
      className="cursor-default"
      startContent={<HomeSmile_Icon className="size-3.5" />}
    />
  );
};
