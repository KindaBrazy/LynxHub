import {Accordion, AccordionItem, Button, Card, CardBody, CardHeader} from '@heroui/react';
import {APP_BUILD_NUMBER, APP_VERSION, RELEASES_PAGE} from '@lynx_common/consts';
import {AppUpdateInfo} from '@lynx_common/types';
import {SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';

import {RenderSubItems} from '../../../../utils/hooks';
import {ReleaseNote} from './useUpdateApp';

type Props = {
  releaseNotes: ReleaseNote[];
  updateInfo: Omit<AppUpdateInfo, 'earlyAccess'> | undefined;
};

/** Information and release notes about update */
export default function Info({updateInfo, releaseNotes}: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="grid w-full grid-cols-3 gap-4 border-b border-default-200 pb-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Version</span>
          <div className="flex justify-center gap-2 font-mono text-small">
            <span>{APP_VERSION}</span>
            <span className="text-default-300">{'->'}</span>
            <span className="text-success">{updateInfo?.currentVersion}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Build Number</span>
          <div className="flex justify-center gap-2 font-mono text-small">
            <span>{APP_BUILD_NUMBER}</span>
            <span className="text-default-300">{'->'}</span>
            <span className="text-success">{updateInfo?.currentBuild}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Release Date</span>
          <div className="font-mono text-small text-success">{updateInfo?.releaseDate}</div>
        </div>
      </div>

      <Card shadow="sm" className="w-full bg-content1/50">
        <CardHeader className="justify-center pb-0 pt-4">
          <h4 className="font-bold text-large">Release Notes</h4>
        </CardHeader>
        <CardBody className="px-3 pb-3">
          {isEmpty(releaseNotes) ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex flex-col items-center gap-2 text-default-500">
                <span className="text-large">No notes found 😔</span>
              </div>
              <Button
                variant="flat"
                color="primary"
                endContent={<SquareTopDown />}
                onPress={() => window.open(RELEASES_PAGE)}>
                Releases Page
              </Button>
            </div>
          ) : (
            <Accordion variant="light" selectionMode="multiple">
              {releaseNotes.map((note, index) => (
                <AccordionItem
                  classNames={{
                    title: 'font-mono text-small',
                  }}
                  key={index}
                  title={`Version ${note.version}`}
                  aria-label={`Version ${note.version}`}>
                  <div className="flex flex-col gap-4">
                    {note.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex flex-col gap-2">
                        <div className="w-full border-b border-default-100 pb-1 text-small font-bold text-default-600">
                          {change.title}
                        </div>
                        <ul className="list-disc pl-4 text-small text-default-500">
                          {RenderSubItems(change.items, `section_${index}_${changeIndex}`)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
