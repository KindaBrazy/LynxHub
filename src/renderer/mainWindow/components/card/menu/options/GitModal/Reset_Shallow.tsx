import {Button, ButtonGroup, Description, Popover, useOverlayState} from '@heroui/react';
import gitIpc from '@lynx_shared/ipc/git';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {useCallback, useState} from 'react';

import {topToast} from '../../../../../layouts/ToastProviders';

interface ResetShallowProps {
  isShallow: boolean;
  dir: string;
  refreshData: () => void;
  title: string;
}

export default function ResetShallow({isShallow, dir, refreshData, title}: ResetShallowProps) {
  const [isLoadingShallow, setIsLoadingShallow] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isStashingDrop, setIsStashingDrop] = useState(false);

  const resetDialog = useOverlayState();
  const shallowDialog = useOverlayState();

  const handleUnShallow = useCallback(async () => {
    AddBreadcrumb_Renderer(`unShallow: ${title}`);
    shallowDialog.close();
    setIsLoadingShallow(true);

    try {
      await gitIpc.unShallow(dir);
      topToast.success('Successfully unshallowed the repository.');
      refreshData();
    } catch {
      topToast.danger('Failed to unshallow the repository.');
    } finally {
      setIsLoadingShallow(false);
    }
  }, [dir, title, refreshData]);

  const handleResetHard = useCallback(async () => {
    console.log('pressed');
    AddBreadcrumb_Renderer(`Reset Hard: ${title}`);
    resetDialog.close();
    setIsResetting(true);

    try {
      await gitIpc.resetHard(dir);
      topToast.success('Successfully reset the repository to its last committed state.');
      refreshData();
    } catch {
      topToast.danger('Failed to reset the repository.');
    } finally {
      setIsResetting(false);
    }
  }, [dir, title, refreshData]);

  const handleStashDrop = useCallback(async () => {
    AddBreadcrumb_Renderer(`Stash Drop: ${title}`);
    setIsStashingDrop(true);

    try {
      const result = await gitIpc.stashDrop(dir);
      topToast[result.type](result.message);
    } catch (error: any) {
      topToast.danger(error.message || 'Stash drop failed');
    } finally {
      setIsStashingDrop(false);
    }
  }, [dir, title]);

  return (
    <ButtonGroup fullWidth>
      <Popover isOpen={resetDialog.isOpen} onOpenChange={resetDialog.setOpen}>
        <Button className="flex-1" variant="danger-soft" isPending={isResetting} fullWidth>
          Reset Hard
        </Button>
        <Popover.Content>
          <Popover.Dialog>
            <Popover.Arrow />
            <Popover.Heading>Reset Hard Confirmation</Popover.Heading>
            <div className="flex flex-col gap-y-2">
              <Description>Any changes will be discarded.</Description>
              <Button size="sm" variant="danger-soft" onPress={handleResetHard} fullWidth>
                Confirm Reset
              </Button>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      {isShallow && (
        <Popover isOpen={shallowDialog.isOpen} onOpenChange={shallowDialog.setOpen}>
          <Button className="flex-1" variant="secondary" isPending={isLoadingShallow} fullWidth>
            UnShallow
          </Button>
          <Popover.Content>
            <Popover.Dialog>
              <Popover.Arrow />
              <Popover.Heading>UnShallow Confirmation.</Popover.Heading>
              <div className="flex flex-col gap-y-2">
                <Description>May increase disk/data usage. Proceed if needed.</Description>
                <Button size="sm" variant="secondary" onPress={handleUnShallow} fullWidth>
                  Confirm Unshallow
                </Button>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      )}

      <Button className="flex-1" variant="tertiary" onPress={handleStashDrop} isPending={isStashingDrop} fullWidth>
        Stash & Drop
      </Button>
    </ButtonGroup>
  );
}
