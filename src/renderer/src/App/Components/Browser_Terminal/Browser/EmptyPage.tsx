import {Button, Image, Spinner} from '@heroui/react';
import {useState} from 'react';

import {Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';

export default function EmptyPage() {
  const [recentAddress] = useState([
    'Google',
    'ReactJS',
    'ElectronJS',
    'dev.to',
    'reddit',
    'X',
    'youtube',
    'discord',
    'IGN',
  ]);

  return (
    <div className="size-full flex items-center justify-center overflow-scroll scrollbar-hide">
      <div className="max-w-2xl w-full px-6 flex flex-col items-center">
        <div className="mb-10 flex flex-col items-center mt-16">
          <Spinner size="lg" variant="wave" color="secondary" classNames={{label: 'mt-2 text-xl font-bold'}}>
            Waiting for terminal to catch webui address...
          </Spinner>
        </div>

        <Button variant="flat" color="primary" className="size-full h-24 transition duration-500 flex-col shadow-lg">
          <Terminal_Icon className="size-6" />
          Switch to Terminal
        </Button>

        {recentAddress.length > 0 && (
          <div className="w-full mt-4">
            <h2 className="text-lg font-medium mb-3 mt-8">Recent Addresses</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {recentAddress.slice(0, 8).map((site, index) => (
                <Button key={index} variant="flat" color="default" className="flex-col size-full p-4 shadow-md">
                  <Image radius="full" className="size-8" src="https://picsum.photos/128/?blur" />
                  <span className="truncate text-wrap line-clamp-1">{site}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
