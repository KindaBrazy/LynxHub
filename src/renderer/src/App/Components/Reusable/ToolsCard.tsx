import {Card, User} from '@heroui/react';
import {ReactNode} from 'react';

import {useAppState} from '../../Redux/Reducer/AppReducer';
import SpotlightCard from './SpotlightCard';

type Props = {title: string; description: string; icon: string; onPress: () => void; footer?: ReactNode};
export function ToolsCard({title, description, icon, onPress, footer}: Props) {
  const isDarkMode = useAppState('darkMode');

  return (
    <Card
      className={
        `w-75 ${footer ? 'h-52.5' : 'h-45'} relative group transform border border-foreground/5 ` +
        'transition-all duration-500 hover:-translate-y-0.5 shadow-small hover:shadow-medium ' +
        'bg-white dark:bg-stone-900 pt-3 pb-2 rounded-3xl hover:border-foreground/15'
      }
      onPress={onPress}
      isPressable>
      <SpotlightCard className="size-full" spotlightColor={isDarkMode ? '#353535' : '#dadada'}>
        <div
          className={
            'absolute top-0 left-1/2 transform -translate-x-1/2 h-px bg-linear-to-r from-transparent' +
            ' via-LynxOrange to-transparent rounded-t-full opacity-0 group-hover:opacity-100 transition-all' +
            ' duration-700 w-0 group-hover:w-[90%]'
          }
        />

        {/* Content container */}
        <div className={`relative h-full flex flex-col ${footer ? 'gap-y-5' : 'gap-y-7'} px-5 pt-4`}>
          {/* Icon section */}
          <div className="flex">
            <User
              name={title}
              className="scale-120 ml-4 font-semibold"
              avatarProps={{src: icon, className: '!bg-transparent', radius: 'none', showFallback: true, name: title}}
            />
          </div>

          {/* Title and Description */}
          <p className="text-foreground-500 text-sm line-clamp-3 text-start">{description}</p>

          {footer}
        </div>
      </SpotlightCard>

      <div
        className={
          'absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-linear-to-r from-secondary/0' +
          ' via-secondary to-secondary/0 rounded-t-full group-active:via-foreground transition-colors duration-100'
        }
      />
    </Card>
  );
}
