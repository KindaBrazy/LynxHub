import {Accordion, AccordionItem, Button} from '@heroui/react';
import CopyClipboard from '@lynx/components/CopyClipboard';
import {LinkBroken, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {motion} from 'framer-motion';
type FailedLoad = {errorCode: number; errorDescription: string; validatedURL: string};

type Props = {
  error: FailedLoad;
  onReload: () => void;
};

export function Browser_Error({error, onReload}: Props) {
  const details = `URL: ${error.validatedURL}\nError Code: ${error.errorCode}\nDescription: ${error.errorDescription}`;

  return (
    <div className="flex h-full w-full select-none items-center justify-center bg-white p-8 dark:bg-LynxNearBlack">
      <motion.div
        initial={{opacity: 0, translateY: 5}}
        animate={{opacity: 1, translateY: 0, transition: {delay: 0.2}}}
        className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <LinkBroken className="size-20 text-warning" />
        <div className="flex w-full flex-col gap-2">
          <div>
            <h1 className="text-2xl font-bold text-warning">This page isn't available</h1>
          </div>
          <p title={error.validatedURL} className="w-full line-clamp-2 text-sm text-foreground-500">
            Could not load <span className="font-medium">{error.validatedURL}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button color="primary" className="w-36" onPress={onReload} startContent={<Restart />}>
            Reload
          </Button>
        </div>

        <div className="text-left text-sm text-foreground-500">
          <p className="font-semibold">Try these suggestions:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Check your internet connection</li>
            <li>Make sure the URL is spelled correctly</li>
            <li>If the problem persists, the site may be down</li>
          </ul>
        </div>

        <Accordion variant="light">
          <AccordionItem
            title={
              <div className="flex items-center gap-x-2">
                Show details
                <CopyClipboard contentToCopy={details} />
              </div>
            }
            className="max-w-lg">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 rounded-lg bg-foreground-100 p-3">
                  <span className="text-xs font-semibold text-foreground-500">URL</span>
                  <code className="break-all font-JetBrainsMono! text-xs text-foreground-800">
                    {error.validatedURL}
                  </code>
                </div>

                <div className="flex flex-col gap-1 rounded-lg bg-foreground-100 p-3 ">
                  <span className="text-xs font-semibold text-danger">Error Code</span>
                  <code className="font-JetBrainsMono! text-xs text-danger-700">{error.errorCode}</code>
                </div>

                <div className="flex flex-col gap-1 rounded-lg bg-foreground-100 p-3 ">
                  <span className="text-xs font-semibold text-warning">Description</span>
                  <code className="break-all font-JetBrainsMono! text-xs text-warning-700">
                    {error.errorDescription}
                  </code>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}
