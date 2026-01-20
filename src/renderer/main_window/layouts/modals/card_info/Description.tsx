import {Button, Link, Spinner} from '@heroui/react';
import {CardInfoDescriptions, CardInfoDescriptions_Items} from '@lynx_cross/types/plugins/modules';
import {isValidURL} from '@lynx_cross/utils';
import filesIpc from '@lynx_shared/ipc/files';
import {Descriptions, DescriptionsProps, Divider} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {useCallback} from 'react';

import {OpenFolder_Icon} from '../../../../shared/assets/icons';

type Props = {
  folders: string[] | undefined;
  descriptions: CardInfoDescriptions;
};

const progressElem = <Spinner size="sm" className="flex-row space-x-1" classNames={{label: 'text-foreground/70'}} />;

export default function CardInfoDescription({folders, descriptions}: Props) {
  const getItems = useCallback((items: CardInfoDescriptions_Items) => {
    const result: DescriptionsProps['items'] = [];

    items.forEach((item, index) => {
      if (isNil(item.result)) {
        return;
      } else if (item.result === 'loading') {
        result.push({key: index, label: item.label, children: progressElem});
      } else if (isValidURL(item.result)) {
        result.push({
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
        });
      } else {
        result.push({key: index, label: item.label, children: item.result});
      }
    });

    return result;
  }, []);

  const openDir = useCallback((dir: string) => {
    filesIpc.openPath(dir);
  }, []);

  return (
    <>
      {descriptions?.map((desc, index) => {
        return isEmpty(getItems(desc.items)) ? null : (
          <div key={`desc_${index}`}>
            <Descriptions column={2} size="small" layout="vertical" title={desc.title} items={getItems(desc.items)} />
            {index !== descriptions.length - 1 && <Divider variant="dashed" className="mb-4" />}
          </div>
        );
      })}

      {!isEmpty(folders) && <Divider variant="dashed" className="mb-4" />}

      {folders?.map((folder, index) => {
        return (
          <Button
            variant="flat"
            endContent={<div />}
            key={`openFolder_${index}`}
            onPress={() => openDir(folder)}
            startContent={<OpenFolder_Icon />}
            className="justify-between shrink-0"
            fullWidth>
            {folder}
          </Button>
        );
      })}
    </>
  );
}
