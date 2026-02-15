import {useDisclosure} from '@heroui/react';
import {tabContentVariants} from '@lynx/layouts/modals/card/ExtensionsModal/Constants';
import {getCardMethod, useAllCardMethods} from '@lynx/plugins/modules';
import {ArgumentsPresets, ChosenArgumentsData} from '@lynx_common/types';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {motion} from 'framer-motion';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import AddArguments from './ArgumentAdd';
import ManageArguments from './ArgumentManage';
import PresetsManager from './ArgumentManagePresets';
import PreviewArguments from './ArgumentsPreview';

type Props = {
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  chosenArguments: ChosenArgumentsData;
  id: string;
  tabId: string;
};

/** Manage card arguments: add, edit, or remove */
export default function CardArguments({chosenArguments, setChosenArguments, id, tabId}: Props) {
  const [activePreset, setActivePreset] = useState<ArgumentsPresets>({arguments: [], preset: ''});
  const [presets, setPresets] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState<string>('');

  const addArgumentsModal = useDisclosure();
  const allMethods = useAllCardMethods();

  useEffect(() => {
    storageUtilsIpc.invoke
      .getCardArguments(id)
      .then(result => {
        setChosenArguments(result);
      })
      .catch(e => {
        console.log(`Failed get card arguments for ${id}: `, e);
      });
  }, []);

  useEffect(() => {
    const getParsedArgs = getCardMethod(allMethods, id, 'parseArgsToString');
    if (getParsedArgs) setPreviewText(getParsedArgs(activePreset.arguments));
  }, [activePreset, id, allMethods]);

  useEffect(() => {
    setPresets(chosenArguments.data.map(arg => arg.preset));

    setActivePreset({
      ...(chosenArguments.data.find(data => data.preset === chosenArguments.activePreset) || {
        arguments: [],
        preset: 'Default',
      }),
    });
  }, [chosenArguments]);

  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <PresetsManager presets={presets} chosenArguments={chosenArguments} setChosenArguments={setChosenArguments} />
      <ManageArguments
        id={id}
        chosenArguments={activePreset}
        addArgumentsModal={addArgumentsModal}
        setChosenArguments={setChosenArguments}
      />
      <PreviewArguments text={previewText} />
      <AddArguments
        id={id}
        tabId={tabId}
        chosenArguments={activePreset}
        addArgumentsModal={addArgumentsModal}
        setChosenArguments={setChosenArguments}
      />
    </motion.div>
  );
}
