import Terminal_Timer from './Terminal_Timer';

type Props = {startTime: Date};
export default function Terminal_TopBar({startTime}: Props) {
  return (
    <>
      <Terminal_Timer startTime={startTime} />
      <div></div>
    </>
  );
}
