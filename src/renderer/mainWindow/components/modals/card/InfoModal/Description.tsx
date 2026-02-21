import {Button, Link, Spinner} from '@heroui/react';
import {CardInfoDescriptions, CardInfoDescriptions_Items} from '@lynx_common/types/plugins/modules';
import {isValidURL} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import {FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {Descriptions, DescriptionsProps, Divider} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {memo, useCallback} from 'react';

interface CardInfoDescriptionProps {
  folders: string[] | undefined;
  descriptions: CardInfoDescriptions;
}

const progressElem = <Spinner size="sm" className="flex-row space-x-1" classNames={{label: 'text-foreground/70'}} />;

function CardInfoDescription({folders, descriptions}: CardInfoDescriptionProps) {
  const getItems = useCallback((items: CardInfoDescriptions_Items): DescriptionsProps['items'] => {
    return items
      .map((item, index) => {
        if (isNil(item.result)) return null;

        if (item.result === 'loading') {
          return {key: index, label: item.label, children: progressElem};
        }
        
        if (isValidURL(item.result)) {
          return {
            key: index,
            label: item.label,
            children: (
              <Link
                size="sm"
                href={item.result}
                color="foreground"
                className="transition-colors duration-300 hover:text-primary"
                isExternal>
                {item.result}
              </Link>
            ),
          };
        }

        return {key: index, label: item.label, children: item.result};
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, []);

  const openDir = useCallback((dir: string) => {
    filesIpc.openPath(dir);
  }, []);

  if (isEmpty(descriptions) && isEmpty(folders)) return null;

  return (
    <>
      {descriptions?.map((desc, index) => {
        const items = getItems(desc.items);
        if (isEmpty(items)) return null;

        return (
          <div key={`desc_${index}`}>
            <Descriptions column={2} size="small" layout="vertical" title={desc.title} items={items} />
            {index !== descriptions.length - 1 && <Divider variant="dashed" className="mb-4" />}
          </div>
        );
      })}

      {!isEmpty(folders) && !isEmpty(descriptions) && <Divider variant="dashed" className="mb-4" />}

      {folders?.map((folder, index) => (
        <Button
          variant="flat"
          endContent={<div />}
          key={`openFolder_${index}`}
          startContent={<FolderOpen />}
          onPress={() => openDir(folder)}
          className="justify-between shrink-0 mb-2"
          fullWidth>
          {folder}
        </Button>
      ))}
    </>
  );
}

export default memo(CardInfoDescription);
