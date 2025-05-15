import {Divider} from 'antd';

import {EditCard_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../SettingsPage-ContentSection';
import CheckUpdateInterval from './CustomizeBehavior/CheckUpdateInterval';
import CustomizeStyle from './CustomizeStyle/CustomizeStyle';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection id={SettingsCardId} title="Customize Card" icon={<EditCard_Icon className="size-5" />} itemsCenter>
      <Divider variant="dashed">Style</Divider>
      <CustomizeStyle />
      <Divider variant="dashed">Behavior</Divider>
      <CheckUpdateInterval />
    </SettingsSection>
  );
}
