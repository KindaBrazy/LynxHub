import {Button, ButtonGroup, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {useState} from 'react';

import rendererIpc from '../../../RendererIpc';
import {lynxTopToast} from '../../../Utils/UtilHooks';

type Props = {isShallow: boolean; dir: string; refreshData: () => void};
export default function Reset_Shallow({isShallow, dir, refreshData}: Props) {
  const [isLoadingShallow, setIsLoadingShallow] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isShallowConfirmOpen, setIsShallowConfirmOpen] = useState<boolean>(false);

  const [isStashingDrop, setIsStashingDrop] = useState<boolean>(false);

  const unShallow = () => {
    setIsShallowConfirmOpen(false);
    setIsLoadingShallow(true);
    rendererIpc.git
      .unShallow(dir)
      .then(() => {
        lynxTopToast.success('Successfully unshallowed the repository.');
        refreshData();
      })
      .catch(() => lynxTopToast.error('Failed to unshallow the repository.'))
      .finally(() => setIsLoadingShallow(false));
  };

  const resetHard = () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    rendererIpc.git
      .resetHard(dir)
      .then(() => {
        lynxTopToast.success('Successfully reset the repository to its last committed state.');
        refreshData();
      })
      .catch(() => lynxTopToast.error(`Failed to reset the repository.`))
      .finally(() => setIsResetting(false));
  };

  const stashDrop = () => {
    setIsStashingDrop(true);
    rendererIpc.git
      .stashDrop(dir)
      .then(result => {
        if (result.type === 'success') {
          lynxTopToast.success(result.message);
        } else if (result.type === 'info') {
          lynxTopToast.info(result.message);
        } else {
          lynxTopToast.error(result.message);
        }
      })
      .finally(() => {
        setIsStashingDrop(false);
      });
  };

  return (
    <ButtonGroup fullWidth>
      <Popover isOpen={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="danger" isLoading={isResetting} fullWidth>
            Reset Hard
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 max-w-72 border-1 border-foreground-200">
          <div className="flex flex-col gap-y-2">
            <span className="font-bold">{"Warning: Can't be undone!"}</span>
            <span>Any changes will be discarded. Sure?</span>
            <div>
              <Button size="sm" color="danger" onPress={resetHard}>
                Confirm Reset
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {isShallow && (
        <Popover isOpen={isShallowConfirmOpen} onOpenChange={setIsShallowConfirmOpen} showArrow>
          <PopoverTrigger>
            <Button variant="flat" color="secondary" isLoading={isLoadingShallow} fullWidth>
              UnShallow
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 max-w-72 border-1 border-foreground-200">
            <div className="flex flex-col gap-y-2">
              <span className="font-bold">Unshallowing downloads full history.</span>
              <span>May increase disk/data usage. Proceed if needed.</span>
              <div>
                <Button size="sm" color="secondary" onPress={unShallow}>
                  Confirm Unshallow
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      <Button variant="flat" onPress={stashDrop} isLoading={isStashingDrop}>
        Stash & Drop
      </Button>
    </ButtonGroup>
  );
}
