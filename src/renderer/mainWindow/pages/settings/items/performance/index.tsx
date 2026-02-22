import SettingsSection from '@lynx/components/SettingsSection';
import {SpedometerMiddle} from '@solar-icons/react-perf/BoldDuotone';

import HWAcc from '../general/HWAcc';
import Autoplay from './Autoplay';
import ColorProfile from './ColorProfile';
import DiskCache from './DiskCache';
import FrameRate from './FrameRate';
import GpuBlacklist from './GpuBlacklist';
import GpuRasterization from './GpuRasterization';
import GpuSelection from './GpuSelection';
import HighDpi from './HighDpi';
import JsMemory from './JsMemory';
import VideoDecoding from './VideoDecoding';
import Vsync from './Vsync';
import Wasm from './Wasm';
import ZeroCopy from './ZeroCopy';

export const SettingsPerformanceId = 'settings_performance_elem';

export default function SettingsPerformance() {
  return (
    <SettingsSection title="Performance" id={SettingsPerformanceId} icon={<SpedometerMiddle className="size-5" />}>
      <HWAcc />
      <HighDpi />
      <VideoDecoding />
      <GpuRasterization />
      <ZeroCopy />
      <Wasm />
      <JsMemory />
      <DiskCache />
      <ColorProfile />
      <Autoplay />
      <GpuSelection />
      <GpuBlacklist />
      <Vsync />
      <FrameRate />
    </SettingsSection>
  );
}
