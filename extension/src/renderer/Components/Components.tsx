import {Button} from '@heroui/react';
import {Fragment, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {CardElementProps} from '../../../../src/cross/plugin/ExtensionTypes_Renderer';
import NavButton from '../../../../src/renderer/src/App/Components/NavBar/NavButton';
import {useAppState} from '../../../../src/renderer/src/App/Redux/Reducer/AppReducer';
import {Reddit_Icon, XSite_Icon} from '../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {extensionActions, useExtensionState} from '../reducer';

// @ts-ignore
export function StatusBarEnd({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return <span className={darkMode ? 'text-danger' : 'text-success'}>Hello End</span>;
}

export function AddContentButton() {
  return (
    <NavButton badge={false} pageId="extContentPath" title="Ext Content Btn" key={'ext-content-btn'}>
      <Reddit_Icon className="size-full" />
    </NavButton>
  );
}

export function AddSettingsButton() {
  return (
    <NavButton badge={false} pageId="extSettingPath" title="Ext Setting Btn" key={'ext-setting-btn'}>
      <XSite_Icon className="size-full" />
    </NavButton>
  );
}

export function CustomHook() {
  const darkMode = useAppState('darkMode');

  useEffect(() => {
    console.log('dark?: ', darkMode);
  }, [darkMode]);

  return <Fragment />;
}

export function Background() {
  return <div className="absolute inset-0 bg-secondary" />;
}

export function HomePage_ReplaceCategories() {
  return (
    <div className="h-64 w-full content-center bg-secondary text-center">
      I&#39;m A category that contain something i don&#39;t know
    </div>
  );
}

export function HomePage_TopScroll() {
  return <div className="h-24 w-full shrink-0 bg-green-700" />;
}

export function HomePage_Top() {
  return <div className="h-24 w-full shrink-0 bg-blue-700" />;
}

export function ReducerTester() {
  const someNumber = useExtensionState('someNumber');
  const dispatch = useDispatch();

  const onPress = () => {
    dispatch(extensionActions.increaseNumber());
  };

  return (
    <div className="flex h-16 w-full flex-row items-center justify-center space-x-4">
      <Button onPress={onPress}>Increase</Button>
      <span>{someNumber}</span>
    </div>
  );
}

export function ReplaceCards({cards, ...props}: CardElementProps) {
  return cards.map((card, index) => (
    <div key={index} className="h-48 content-center rounded-xl bg-foreground-300 p-8 text-center" {...props}>
      {card.id}
    </div>
  ));
}
