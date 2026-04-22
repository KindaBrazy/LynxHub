import {Card, CardBody, Input, Progress} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {GitHub_Icon} from '@lynx_assets/icons';
import {GitProgressCallback} from '@lynx_common/types/ipc';
import {extractGitUrl, validateGitRepoUrl} from '@lynx_common/utils';
import gitIpc from '@lynx_shared/ipc/git';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {motion} from 'framer-motion';
import {capitalize, startCase} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {SimpleGitProgressEvent} from 'simple-git';

import {useAppState} from '../../../../redux/reducers/app';
import {initGitProgress} from '../../../../utils/constants';
import {tabContentVariants} from './Constants';

type Props = {
  visible: boolean;
  updateTable: () => void;
  installedExtensions: string[];
  dir: string;
};

type ClipData = {name: string; owner: string; url: string};

/** Download (Clone repo) to extension folder of installed card */
export default function Clone({updateTable, visible, installedExtensions, dir}: Props) {
  const isFocused = useAppState('onFocus');

  const [resultUrl, setResultUrl] = useState<string>('');
  const [downloadBox, setDownloadBox] = useState<ClipData | undefined>(undefined);
  const [cloneProgress, setCloneProgress] = useState<SimpleGitProgressEvent>(initGitProgress);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [cloning, setCloning] = useState<boolean>(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (downloadBox) {
      setAlreadyInstalled(installedExtensions.includes(validateGitRepoUrl(downloadBox.url)));
    } else {
      setAlreadyInstalled(false);
    }
  }, [downloadBox, installedExtensions]);

  const readClipboard = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();

      const validUrl = validateGitRepoUrl(clipText.toLowerCase());
      if (validUrl) {
        const {owner, repo} = extractGitUrl(validUrl);
        setDownloadBox({name: repo, owner, url: validUrl});
        setResultUrl(validUrl);
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  }, []);

  const clone = useCallback(() => {
    if (alreadyInstalled) return;
    setCloning(true);
    gitIpc.cloneShallow({
      url: downloadBox?.url || '',
      directory: `${dir}/${downloadBox?.name || ''}`,
      singleBranch: true,
      depth: 1,
    });
  }, [downloadBox, dir, alreadyInstalled]);

  useEffect(() => {
    if (isFocused) {
      readClipboard();
    }
  }, [isFocused, readClipboard]);

  useEffect(() => {
    setCloning(false);
    setDownloadBox(undefined);
    setIsEmpty(true);
    setIsValid(true);
    setResultUrl('');

    if (visible) readClipboard();
  }, [visible, readClipboard]);

  const onValueChange = useCallback((text: string) => {
    const lowerCaseText = text.toLowerCase();
    setResultUrl(lowerCaseText.toLowerCase());

    const validUrl = validateGitRepoUrl(lowerCaseText);
    if (validUrl) {
      const {owner, repo} = extractGitUrl(validUrl);
      setDownloadBox({
        name: repo,
        owner: owner,
        url: validUrl,
      });
    } else {
      setDownloadBox(undefined);
    }

    setIsEmpty(!lowerCaseText);
    setIsValid(!!validUrl);
  }, []);

  useEffect(() => {
    const onProgress: GitProgressCallback = (id, state, result) => {
      // If id have string its pull progress, so return early
      if (id) return;
      switch (state) {
        case 'Progress':
          setCloneProgress(result as SimpleGitProgressEvent);
          break;
        case 'Failed':
          setCloneProgress(initGitProgress);
          setCloning(false);
          topToast.danger('Error: Unable to clone the extension.');
          break;
        case 'Completed':
          setCloneProgress(initGitProgress);
          setDownloadBox(undefined);
          setIsEmpty(true);
          setIsValid(true);
          setResultUrl('');
          setCloning(false);
          topToast.success('Extension installed successfully.');
          updateTable();
          break;
      }
    };

    const removeListener = gitIpc.onProgress(onProgress);

    return () => removeListener();
  }, [visible, updateTable]);

  if (!visible) return null;

  return (
    <>
      {!cloning ? (
        <motion.div
          initial="init"
          animate="animate"
          variants={tabContentVariants}
          className="flex flex-col gap-y-2 items-center">
          <Input
            variant="flat"
            color="default"
            className="my-4"
            value={resultUrl}
            onValueChange={onValueChange}
            startContent={<GitHub_Icon />}
            isInvalid={!isEmpty && !isValid}
            placeholder="Enter a GitHub repository URL..."
            errorMessage="Please enter a valid GitHub repository URL"
          />
          {downloadBox && (
            <Card
              className={`mb-4 overflow-hidden bg-default-100 text-center transition duration-300 w-[90%] ${
                !alreadyInstalled ? 'hover:bg-default-200' : ''
              }`}
              shadow="none"
              onPress={clone}
              isPressable={!alreadyInstalled}>
              <CardBody className="items-center justify-center p-4">
                {alreadyInstalled ? (
                  <span className="font-semibold text-success">This extension has already been installed.</span>
                ) : (
                  <div className="relative flex w-full flex-col items-center justify-center">
                    <Download
                      className={'absolute left-7 size-10 opacity-50 transition duration-300 group-hover:opacity-100'}
                    />
                    <div className="flex flex-row items-center justify-center text-large font-bold">
                      <span>{startCase(downloadBox.name)}</span>
                      <span className="mx-1 scale-85 opacity-75">by</span>
                      <span>{startCase(downloadBox.owner)}</span>
                    </div>
                    <div className="text-small text-default-500">{downloadBox.url}</div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </motion.div>
      ) : (
        <Card shadow="none" className="bg-default-100">
          <CardBody>
            <Progress
              label={`Stage: ${capitalize(cloneProgress.stage)} | Item: ${cloneProgress.processed} | Total: ${
                cloneProgress.total
              }`}
              color="secondary"
              value={cloneProgress.progress}
              showValueLabel
            />
          </CardBody>
        </Card>
      )}
    </>
  );
}
