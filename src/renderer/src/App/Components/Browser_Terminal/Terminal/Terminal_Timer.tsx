import NumberFlow, {NumberFlowGroup} from '@number-flow/react';
import {useEffect, useState} from 'react';

import {secondsElapsed} from '../../../../../../cross/CrossUtils';

const calc = (startTime: string) => {
  const startDate = new Date(startTime);

  if (isNaN(startDate.getTime())) {
    return {hh: 0, mm: 0, ss: 0};
  }

  const seconds = secondsElapsed(startDate);
  return {hh: Math.floor(seconds / 3600), mm: Math.floor((seconds % 3600) / 60), ss: seconds % 60};
};

type TimeType = {hh: number; mm: number; ss: number};

type Props = {startTime: string};
export default function Terminal_Timer({startTime}: Props) {
  const [{ss, hh, mm}, setTime] = useState<TimeType>(calc(startTime));

  useEffect(() => {
    setInterval(() => {
      setTime(calc(startTime));
    }, 1000);
  }, []);

  return (
    <NumberFlowGroup>
      <div
        className="flex overflow-hidden mx-2 text-[11pt]"
        // @ts-ignore
        style={{fontVariantNumeric: 'tabular-nums', '--number-flow-char-height': '0.85em'}}>
        <NumberFlow value={hh} format={{minimumIntegerDigits: 2}} />
        <NumberFlow prefix=":" value={mm} digits={{1: {max: 5}}} format={{minimumIntegerDigits: 2}} />
        <NumberFlow
          prefix=":"
          value={ss}
          digits={{1: {max: 5}}}
          transformTiming={{duration: 500}}
          format={{minimumIntegerDigits: 2}}
        />
      </div>
    </NumberFlowGroup>
  );
}
