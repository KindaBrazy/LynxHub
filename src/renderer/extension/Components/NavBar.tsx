import {Fragment} from 'react';

import {NavBarComponent} from '../../../cross/ExtensionTypes';
import NavButton from '../../src/App/Components/NavBar/NavButton';
import {getIconByName} from '../../src/assets/icons/SvgIconsContainer';

const NavBar: NavBarComponent = {};

function NavigationBar() {
  return <Fragment />;
}

function ContentButtons() {
  return <Fragment />;
}

function SettingsButtons() {
  return <Fragment />;
}

function AddContentButton() {
  return (
    <NavButton badge={false} pageId="extContentPath" title="Ext Content Btn" key={'ext-content-btn'}>
      {getIconByName('Reddit', {className: 'size-full'})}
    </NavButton>
  );
}

function AddSettingsButton() {
  return (
    <NavButton badge={false} pageId="extSettingPath" title="Ext Setting Btn" key={'ext-setting-btn'}>
      {getIconByName('XSite', {className: 'size-full'})}
    </NavButton>
  );
}

// !Important → Remove any unused Component from the below object

NavBar.NavBar = NavigationBar;
NavBar.ContentButtons = ContentButtons;
NavBar.SettingsButtons = SettingsButtons;
NavBar.AddContentButton = AddContentButton;
NavBar.AddSettingsButton = AddSettingsButton;

export default NavBar;
