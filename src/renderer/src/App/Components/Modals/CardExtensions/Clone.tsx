import {Input, Progress} from '@nextui-org/react';
import {Card, message} from 'antd';
import {motion} from 'framer-motion';
import {capitalize, startCase} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {SimpleGitProgressEvent} from 'simple-git';

import {extractGitHubUrl} from '../../../../../../cross/CrossUtils';
import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import {useAppState} from '../../../Redux/App/AppReducer';
import rendererIpc from '../../../RendererIpc';
import {initGitProgress} from '../../../Utils/Constants';
import {validateGitRepoUrl} from '../../../Utils/UtilFunctions';
import {tabContentVariants} from './Constants';

type Props = {
  visible: boolean;
  updateTable: () => void;
  installedExtensions: string[];
};

type ClipData = {name: string; owner: string; url: string};

/** Download (Clone repo) to extension folder of installed card */
export default function Clone({updateTable, visible, installedExtensions}: Props) {
  const isFocused = useAppState('onFocus');
  const {dir} = useModalsState('cardExtensions');

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
  }, [downloadBox]);

  const readClipboard = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();

      const validUrl = validateGitRepoUrl(clipText.toLowerCase());
      if (validUrl) {
        const {owner, repo} = extractGitHubUrl(validUrl);
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
    rendererIpc.git.cloneRepo(`${downloadBox?.url}` || '', `${dir}/${downloadBox?.name || ''}`);
  }, [downloadBox, dir, alreadyInstalled]);

  useEffect(() => {
    if (isFocused) {
      readClipboard();
    }
  }, [isFocused]);

  useEffect(() => {
    setCloning(false);
    setDownloadBox(undefined);
    setIsEmpty(true);
    setIsValid(true);
    setResultUrl('');

    if (visible) readClipboard();
  }, [visible]);

  const onValueChange = useCallback((text: string) => {
    const lowerCaseText = text.toLowerCase();
    setResultUrl(lowerCaseText.toLowerCase());

    const validUrl = validateGitRepoUrl(lowerCaseText);
    if (validUrl) {
      const {owner, repo} = extractGitHubUrl(validUrl);
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
    const onProgress: GitProgressCallback = (_e, id, state, result) => {
      // If id have string its pull progress, so return early
      if (id) return;
      switch (state) {
        case 'Progress':
          setCloneProgress(result as SimpleGitProgressEvent);
          break;
        case 'Failed':
          setCloneProgress(initGitProgress);
          setCloning(false);
          message.error('Error: Unable to clone the extension.');
          break;
        case 'Completed':
          setCloneProgress(initGitProgress);
          setDownloadBox(undefined);
          setIsEmpty(true);
          setIsValid(true);
          setResultUrl('');
          setCloning(false);
          message.success('Extension installed successfully.');
          updateTable();
          break;
      }
    };

    rendererIpc.git.offProgress();
    rendererIpc.git.onProgress(onProgress);

    return () => {
      rendererIpc.git.offProgress();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {!cloning ? (
        <motion.div initial="init" animate="animate" variants={tabContentVariants}>
          <Input
            radius="md"
            variant="flat"
            color="default"
            className="my-4"
            value={resultUrl}
            onValueChange={onValueChange}
            isInvalid={!isEmpty && !isValid}
            startContent={getIconByName('GitHub')}
            placeholder="Enter a GitHub repository URL..."
            errorMessage="Please enter a valid GitHub repository URL"
          />
          {downloadBox && (
            <Card
              className={
                'group mb-4 flex justify-center overflow-hidden bg-default-100 text-center' +
                ` transition duration-300 ${!alreadyInstalled && 'hover:bg-default-200'}`
              }
              onClick={clone}
              bordered={false}
              hoverable={!alreadyInstalled}>
              {alreadyInstalled ? (
                <Card.Meta title={<span className="text-success">This extension has already been installed.</span>} />
              ) : (
                <>
                  {getIconByName('Download2', {
                    className: 'size-10 group-hover:opacity-100 left-7 opacity-50 absolute transition duration-300',
                  })}
                  <Card.Meta
                    title={
                      <div className="flex flex-row items-center justify-center">
                        <span>{startCase(downloadBox.name)}</span>
                        <span className="mx-1 scale-85 opacity-75">by</span>
                        <span>{startCase(downloadBox.owner)}</span>
                      </div>
                    }
                    description={downloadBox.url}
                  />
                </>
              )}
            </Card>
          )}
        </motion.div>
      ) : (
        <Card bordered={false} className="bg-default-100">
          <Progress
            label={`Stage: ${capitalize(cloneProgress.stage)} | 
                    Item: ${cloneProgress.processed} | Total: ${cloneProgress.total}`}
            color="secondary"
            value={cloneProgress.progress}
            showValueLabel
          />
        </Card>
      )}
    </>
  );
}