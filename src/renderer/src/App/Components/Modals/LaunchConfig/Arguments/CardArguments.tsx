import {useDisclosure} from '@heroui/react';
import {motion} from 'framer-motion';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {ArgumentsPresets, ChosenArgumentsData} from '../../../../../../../cross/CrossTypes';
import {getCardMethod, useAllCardMethods} from '../../../../Modules/ModuleLoader';
import rendererIpc from '../../../../RendererIpc';
import {tabContentVariants} from '../../CardExtensions/Constants';
import AddArguments from './AddArguments/AddArguments';
import ManageArguments from './ManageArguments/ManageArguments';
import PresetsManager from './ManageArguments/PresetsManager';
import PreviewArguments from './PreviewArguments';

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
    rendererIpc.storageUtils.getCardArguments(id).then(result => {
      setChosenArguments(result);
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
