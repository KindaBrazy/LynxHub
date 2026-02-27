import {Button, Link, Spinner} from '@heroui/react';
import DescriptionGrid, {DescriptionGridItem} from '@lynx/components/DescriptionGrid';
import {CardInfoDescriptions, CardInfoDescriptions_Items} from '@lynx_common/types/plugins/modules';
import {isValidURL} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import {FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, isNil} from 'lodash';
import {memo, useCallback} from 'react';

interface CardInfoDescriptionProps {
  folders: string[] | undefined;
  descriptions: CardInfoDescriptions;
}

const progressElem = <Spinner size="sm" className="flex-row space-x-1" classNames={{label: 'text-foreground/70'}} />;

function CardInfoDescription({folders, descriptions}: CardInfoDescriptionProps) {
  const getItems = useCallback((items: CardInfoDescriptions_Items): DescriptionGridItem[] => {
    return items
      .map((item, index) => {
        if (isNil(item.result)) return null;

        if (item.result === 'loading') {
          return {key: index, label: item.label, content: progressElem};
        }

        if (isValidURL(item.result)) {
          return {
            key: index,
            label: item.label,
            content: (
              <Link
                size="sm"
                color="primary"
                href={item.result}
                className="break-all transition-colors duration-300 hover:opacity-80"
                isExternal>
                {item.result}
              </Link>
            ),
          };
        }

        return {key: index, label: item.label, content: item.result};
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
          <div className="space-y-4" key={`desc_${index}`}>
            <DescriptionGrid columns={2} items={items} title={desc.title} />
            {index !== descriptions.length - 1 && (
              <div className="h-px bg-linear-to-r from-transparent via-foreground-200 to-transparent" />
            )}
          </div>
        );
      })}

      {!isEmpty(folders) && !isEmpty(descriptions) && (
        <div className="h-px bg-linear-to-r from-transparent via-foreground-200 to-transparent" />
      )}

      {folders?.map((folder, index) => (
        <Button
          className={
            'justify-start shrink-0 h-12 rounded-xl border border-foreground-200/70 bg-content2/70' +
            ' hover:bg-content2'
          }
          variant="flat"
          key={`openFolder_${index}`}
          startContent={<FolderOpen />}
          onPress={() => openDir(folder)}
          fullWidth>
          <span className="truncate text-sm font-medium">{folder}</span>
        </Button>
      ))}
    </>
  );
}

export default memo(CardInfoDescription);
