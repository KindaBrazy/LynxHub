import {Card, Description} from '@heroui/react';
import SettingsSearchHighlight from '@lynx/pages/settings/SettingsSearchHighlight';
import {useRegisterSectionSearch} from '@lynx/pages/settings/SettingsSearchRegistry';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';

type Props = {
  /** The title of the settings section */
  title: string;
  /** The description of the settings section */
  description?: ReactNode;
  /** Unique identifier for the section, used for search and navigation */
  id?: string;
  /** Optional icon to display next to the title */
  icon?: ReactNode;
  /** Content of the section */
  children?: ReactNode;
  /** Optional title color class. Defaults to inherit */
  titleColor?: 'text-warning' | 'text-danger' | string;
  /** Whether to center the items in the card body. Defaults to false */
  itemsCenter?: boolean;
};

/**
 * Renders a card for a specific settings section with search registration and animation.
 */
export default function SettingsSection({
  children,
  id,
  title,
  description,
  titleColor = '',
  itemsCenter = false,
  icon,
}: Props) {
  useRegisterSectionSearch(id, title);

  return (
    <motion.div
      transition={{duration: 0.2}}
      animate={{translateX: 0, opacity: 1}}
      initial={{translateX: -50, opacity: 0}}>
      <Card id={id} variant="secondary">
        <Card.Header className={`flex flex-col gap-y-0.5 text-center ${titleColor}`}>
          <div className="flex flex-row items-center justify-center gap-x-2">
            {icon}
            <SettingsSearchHighlight text={title} />
          </div>
          <Description>{description}</Description>
        </Card.Header>
        <Card.Content className={`${itemsCenter && 'justify-center'} flex flex-col gap-y-3`}>{children}</Card.Content>
      </Card>
    </motion.div>
  );
}
