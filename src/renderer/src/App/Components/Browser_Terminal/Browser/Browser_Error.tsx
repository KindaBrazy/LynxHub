import {Accordion, AccordionItem, Button, Card} from '@heroui/react';
import {motion} from 'framer-motion';

import {Web_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import CopyClipboard from '../../Reusable/CopyClipboard';

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
        className="flex max-w-lg flex-col items-center gap-6 text-center">
        <Web_Icon className="size-20 text-warning" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground-800">This page isn't available</h1>
          <p title={error.validatedURL} className="w-full truncate text-sm text-foreground-500">
            Could not load <span className="font-medium">{error.validatedURL}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button color="primary" className="w-36" onPress={onReload}>
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

        <Accordion>
          <AccordionItem
            classNames={{
              title: 'text-foreground-500 text-sm',
            }}
            title="Show details">
            <Card className="gap-y-2 pt-3 text-start">
              <pre className="whitespace-pre-wrap break-all px-3 !font-JetBrainsMono text-xs text-foreground-600">
                <code>
                  {`URL: ${error.validatedURL}\nError Code: ${error.errorCode}\nDescription: ${error.errorDescription}`}
                </code>
              </pre>
              <CopyClipboard contentToCopy={details} className="w-full bg-foreground-200 cursor-pointer" />
            </Card>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}
