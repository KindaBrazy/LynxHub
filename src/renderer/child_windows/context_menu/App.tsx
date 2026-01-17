import {useRef, useState} from 'react';

import {MenuTypes} from './consts';
import {BrowserScale} from './layouts/BrowserScale';
import {CloseAppConfirm} from './layouts/CloseAppConfirm';
import {FindInPage} from './layouts/FindInPage';
import RightClick from './layouts/RightClick';
import {TerminateProcessConfirm} from './layouts/TerminateProcessConfirm';
import {TerminateTabConfirm} from './layouts/TerminateTabConfirm';
import {VolumeMenu} from './layouts/Volume';
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
      <CloseAppConfirm
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.CloseAppConfirm}
      />
      <TerminateProcessConfirm
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.TerminateProcessConfirm}
      />
      <TerminateTabConfirm
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.TerminateTabConfirm}
      />
      <VolumeMenu
        setWidthSize={setWidthSize}
        setSelectedLayout={setSelectedLayout}
        show={selectedLayout === MenuTypes.Volume}
      />
    </div>
  );
}
