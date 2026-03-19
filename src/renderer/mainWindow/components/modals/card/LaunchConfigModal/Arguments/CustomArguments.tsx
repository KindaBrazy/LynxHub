import {Button} from '@heroui/react';
import {Inbox} from '@solar-icons/react-perf/BoldDuotone';
import {Plus} from 'lucide-react';
import {useState} from 'react';

import EmptyStateCard from '../../../../EmptyStateCard';

export default function CustomArguments() {
  const [customList] = useState([]);

  return (
    <div className="bg-foreground-100 rounded-xl flex flex-col size-full items-center p-4">
      <div className="size-full flex justify-between mb-4">
        <div />
        <span className="font-bold text-LynxOrange">Custom Arguments List</span>
        <Button size="sm" variant="light" isIconOnly>
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="w-full">
        {customList.length === 0 && (
          <EmptyStateCard
            description={
              <span className="flex items-center gap-x-1 text-sm text-foreground-500">
                Use <Plus className="size-3 text-foreground" /> Button to add new item.
              </span>
            }
            icon={<Inbox size={40} />}
            className="bg-foreground-50"
            title="No custom argument available to display"
          />
        )}
      </div>
    </div>
  );
}
