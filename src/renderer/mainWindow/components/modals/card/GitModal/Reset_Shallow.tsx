import {Button, ButtonGroup, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import gitIpc from '@lynx_shared/ipc/git';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {useCallback, useState} from 'react';

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

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isShallowConfirmOpen, setIsShallowConfirmOpen] = useState(false);

  const handleUnShallow = useCallback(async () => {
    AddBreadcrumb_Renderer(`unShallow: ${title}`);
    setIsShallowConfirmOpen(false);
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
    AddBreadcrumb_Renderer(`Reset Hard: ${title}`);
    setIsResetConfirmOpen(false);
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
      <Popover placement="bottom" isOpen={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="danger" isLoading={isResetting} fullWidth>
            Reset Hard
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 max-w-72 border border-foreground-200">
          <div className="flex flex-col gap-y-2">
            <span className="font-bold">{"Warning: Can't be undone!"}</span>
            <span>Any changes will be discarded. Sure?</span>
            <div>
              <Button size="sm" color="danger" onPress={handleResetHard} fullWidth>
                Confirm Reset
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {isShallow && (
        <Popover placement="bottom" isOpen={isShallowConfirmOpen} onOpenChange={setIsShallowConfirmOpen} showArrow>
          <PopoverTrigger>
            <Button variant="flat" color="secondary" isLoading={isLoadingShallow} fullWidth>
              UnShallow
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 max-w-72 border border-foreground-200">
            <div className="flex flex-col gap-y-2">
              <span className="font-bold">Unshallowing downloads full history.</span>
              <span>May increase disk/data usage. Proceed if needed.</span>
              <div>
                <Button size="sm" color="secondary" onPress={handleUnShallow} fullWidth>
                  Confirm Unshallow
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Button variant="flat" onPress={handleStashDrop} isLoading={isStashingDrop} fullWidth>
        Stash & Drop
      </Button>
    </ButtonGroup>
  );
}
