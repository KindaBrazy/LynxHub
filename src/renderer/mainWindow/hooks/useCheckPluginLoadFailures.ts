import pluginsIpc from '@lynx_shared/ipc/plugins';
import {useEffect} from 'react';

import {bottomToast} from '../layouts/ToastProviders';
import {getRendererFailures} from '../plugins/failures';

/**
 * Hook to check for plugin load failures (in both main and renderer processes) on startup
 * and display toast notifications for any failures.
 */
export default function useCheckPluginLoadFailures(): void {
  useEffect(() => {
    let isMounted = true;

    async function checkFailures() {
      try {
        // Fetch main process failures (skipped/unloaded list)
        const mainFailures = await pluginsIpc.getUnloadedList();

        // Fetch renderer process failures
        const rendererFailures = getRendererFailures();

        if (!isMounted) return;

        // Show toast for main process failures
        mainFailures.forEach(failure => {
          // Check if it's a runtime loading failure vs compatibility/metadata check
          if (failure.message.includes('Main load error') || failure.message.includes('load error')) {
            bottomToast.danger(`Failed to load plugin: ${failure.id} (Main Process)`, {
              description: failure.message,
            });
          } else {
            bottomToast.warning(`Plugin Skipped: ${failure.id}`, {
              description: failure.message,
            });
          }
        });

        // Show toast for renderer process failures
        rendererFailures.forEach(failure => {
          bottomToast.danger(`Failed to load plugin: ${failure.id} (Renderer Process)`, {
            description: failure.message,
          });
        });
      } catch (err) {
        console.error('Error checking plugin load failures:', err);
      }
    }

    // Delay slightly to ensure layout is ready and doesn't conflict with other startup messages
    const timer = setTimeout(() => {
      checkFailures();
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
}
