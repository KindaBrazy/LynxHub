import {Card, CardBody, CardHeader, Image} from '@heroui/react';
import {ScreenShareSources} from '@lynx_common/types/shareScreen';
import {Record} from '@solar-icons/react-perf/BoldDuotone';

type SourceCardProps = {
  /** The screen or window source item to display. */
  item: ScreenShareSources;
  /** Whether this source is currently selected. */
  isSelected: boolean;
  /** Callback when the card is pressed. */
  onSelect: () => void;
  /** Whether the source is a screen (affects width styling). */
  isScreen: boolean;
};

/**
 * Component to display a single screen share source thumbnail.
 */
export function SourceCard({item, isSelected, onSelect, isScreen}: SourceCardProps) {
  return (
    <Card
      className={
        `shadow-md border border-foreground-200 animate-appearance-in ` +
        `${isScreen ? 'max-w-full' : 'max-w-64'} h-fit`
      }
      onPress={onSelect}
      isPressable>
      <CardHeader className="p-0 relative overflow-hidden">
        {/*
          Using regular img for thumbnail as it's a data URL usually and we want strict control.
          HeroUI Image component adds wrappers that might interfere with exact layout here if not careful,
          but we can use it if we want. Original code used `img`.
        */}
        <img alt={item.name} src={item.thumbnail} className="size-full object-cover aspect-video" />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/70 animate-appearance-in z-10">
            <Record className="size-8 text-white animate-appearance-in" />
          </div>
        )}
      </CardHeader>

      <CardBody
        className={
          'overflow-hidden px-3 text-center max-h-12 border-t border-foreground-100' +
          ' bg-foreground-50 flex flex-row gap-x-2 items-center'
        }>
        {item.icon && (
          <Image radius="sm" src={item.icon} alt="Source Icon" className="size-6" classNames={{wrapper: 'shrink-0'}} />
        )}
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
      </CardBody>
    </Card>
  );
}
