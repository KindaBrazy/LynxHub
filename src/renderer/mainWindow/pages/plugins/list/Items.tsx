import {PluginInstalledItem, PluginItem} from '@lynx_common/types/plugins';

import {PluginListItemCompact} from './PluginListItemCompact';
import {PluginListItemDefault} from './PluginListItemDefault';
import {usePluginItemState} from './usePluginItemState';

/** Props for the PluginListItem component. */
interface PluginListItemProps {
  /** The plugin item details to display. */
  item: PluginItem;
  /** The list of currently installed plugins used to check the installation state. */
  installed: PluginInstalledItem[];
  /** Layout mode setting for layout customization. */
  layoutMode?: 'default' | 'compact';
}

/**
 * Renders an individual card representing a plugin (extension or module).
 * Handles standard (card) and compact (list) representations with smooth sizing.
 */
export function PluginListItem({item, installed, layoutMode = 'default'}: PluginListItemProps) {
  const pluginState = usePluginItemState(item, installed);

  if (layoutMode === 'compact') {
    return <PluginListItemCompact item={item} {...pluginState} />;
  }

  return <PluginListItemDefault item={item} {...pluginState} />;
}
