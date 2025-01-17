import {Spacer} from '@heroui/react';

import {Terminal_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons3';
import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsTerminalBlinkCursor from './SettingsTerminal-BlinkCursor';
import SettingsTerminalConpty from './SettingsTerminal-Conpty';
import SettingsTerminalCursorInactiveStyle from './SettingsTerminal-CursorInactiveStyle';
import SettingsTerminalCursorStyle from './SettingsTerminal-CursorStyle';
import SettingsTerminalFontSize from './SettingsTerminal-FontSize';
import SettingsTerminalOutputColor from './SettingsTerminal-OutputColor';
import SettingsTerminalReset from './SettingsTerminal-Reset';
import SettingsTerminalResizeDelay from './SettingsTerminal-ResizeDelay';
import SettingsTerminalScrollBack from './SettingsTerminal-ScrollBack';

export const SettingsTerminalId = 'settings_terminal_elem';

export default function SettingsTerminal() {
  return (
    <SettingsSection title="Terminal" id={SettingsTerminalId} icon={<Terminal_Icon className="size-5" />}>
      <SettingsTerminalConpty />
      <SettingsTerminalScrollBack />
      <SettingsTerminalResizeDelay />
      <SettingsTerminalFontSize />
      <SettingsTerminalCursorStyle />
      <SettingsTerminalCursorInactiveStyle />
      <SettingsTerminalBlinkCursor />
      <SettingsTerminalOutputColor />
      <Spacer />
      <SettingsTerminalReset />
    </SettingsSection>
  );
}
