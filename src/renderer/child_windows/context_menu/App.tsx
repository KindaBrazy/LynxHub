import {useRef, useState} from 'react';

import {MenuTypes} from './consts';
import BrowserScale from './layouts/BrowserScale';
import CloseApp from './layouts/confirm_warn/CloseApp';
import TerminateProcess from './layouts/confirm_warn/TerminateProcess';
import TerminateTab from './layouts/confirm_warn/TerminateTab';
import DownloadMenu from './layouts/downloads';
import FindInPage from './layouts/FindInPage';
import RightClick from './layouts/right_click';
import VolumeMenu from './layouts/Volume';
import PromptWindow from './layouts/window_dialogs/Prompt';
import {useResize} from './useResize';

export default function ContextMenu() {
  const [widthSize, setWidthSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [selectedLayout, setSelectedLayout] = useState<MenuTypes>(MenuTypes.RightClick);

  const divRef = useRef<HTMLDivElement | null>(null);

  useResize(divRef);

  return (
    <div
      className={
        `size-fit flex flex-col dark:bg-LynxRaisinBlack bg-white ` +
        `${widthSize === 'sm' ? 'w-44' : widthSize === 'md' ? 'w-72' : 'w-96'}`
      }
      ref={divRef}>
      <BrowserScale
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.BrowserScale}
      />
      <FindInPage
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.FindInPage}
      />
      <RightClick
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.RightClick}
      />
      <CloseApp
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.CloseAppConfirm}
      />
      <TerminateProcess
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.TerminateProcessConfirm}
      />
      <TerminateTab
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.TerminateTabConfirm}
      />
      <VolumeMenu
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.Volume}
      />
      <DownloadMenu
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.Downloads}
      />
      <PromptWindow
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.Prompt}
      />
    </div>
  );
}
