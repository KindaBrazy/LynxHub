import {InputNumber} from 'antd';
import {useDispatch} from 'react-redux';

import {Clock_Icon} from '../../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions, useCardsState} from '../../../../../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../RendererIpc';

export default function CheckUpdateInterval() {
  const updateInterval = useCardsState('checkUpdateInterval');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (value: number | null) => {
    if (value) {
      dispatch(cardsActions.setUpdateInterval(value));
      rendererIpc.storage.update('cards', {checkUpdateInterval: value});
    }
  };

  return (
    <div className="w-full text-start flex flex-col gap-y-1">
      <span>How often to check for AI updates:</span>
      <InputNumber
        min={2}
        variant="filled"
        className="w-full"
        onChange={onChange}
        addonAfter="Minutes"
        value={updateInterval}
        addonBefore={<Clock_Icon className="size-5" />}
        changeOnWheel
      />
    </div>
  );
}
