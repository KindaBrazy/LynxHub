import {InputNumber} from 'antd';
import {Clock_Icon} from '../../../../../../../../assets/icons/SvgIcons/SvgIcons5';
import {cardsActions, useCardsState} from '../../../../../../../Redux/AI/CardsReducer';
import {useDispatch} from 'react-redux';
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
        variant="filled"
        className="w-full"
        addonBefore={<Clock_Icon className="size-5" />}
        addonAfter="Minutes"
        changeOnWheel
        onChange={onChange}
        min={2}
        value={updateInterval}
      />
    </div>
  );
}
