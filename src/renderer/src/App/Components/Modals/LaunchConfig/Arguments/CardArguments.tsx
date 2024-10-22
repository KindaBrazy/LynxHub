import {useDisclosure} from '@nextui-org/react';
import {motion} from 'framer-motion';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {ArgumentsPresets, ChosenArgumentsData} from '../../../../../../../cross/CrossTypes';
import {useModules} from '../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../RendererIpc';
import {tabContentVariants} from '../../CardExtensions/Constants';
import AddArguments from './AddArguments/AddArguments';
import ManageArguments from './ManageArguments/ManageArguments';
import PresetsManager from './ManageArguments/PresetsManager';
import PreviewArguments from './PreviewArguments';

type Props = {
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  chosenArguments: ChosenArgumentsData;
};

/** Manage card arguments: add, edit, or remove */
export default function CardArguments({chosenArguments, setChosenArguments}: Props) {
  const {id} = useModalsState('cardLaunchConfig');

  const [activePreset, setActivePreset] = useState<ArgumentsPresets>({arguments: [], preset: ''});
  const [presets, setPresets] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState<string>('');

  const addArgumentsModal = useDisclosure();

  const {getMethod} = useModules();

  useEffect(() => {
    rendererIpc.storageUtils.getCardArguments(id).then(result => {
      setChosenArguments(result);
    });
  }, []);

  useEffect(() => {
    const getParsedArgs = getMethod(id, 'parseArgsToString');
    if (getParsedArgs) setPreviewText(getParsedArgs(activePreset.arguments));
  }, [activePreset, getMethod]);

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
        chosenArguments={activePreset}
        addArgumentsModal={addArgumentsModal}
        setChosenArguments={setChosenArguments}
      />
      <PreviewArguments text={previewText} />
      <AddArguments
        chosenArguments={activePreset}
        addArgumentsModal={addArgumentsModal}
        setChosenArguments={setChosenArguments}
      />
    </motion.div>
  );
}
