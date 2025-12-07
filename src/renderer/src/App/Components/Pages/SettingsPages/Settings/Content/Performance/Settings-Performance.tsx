import {SpedometerMiddle} from '@solar-icons/react-perf/BoldDuotone';

import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsGeneralHwAcc from '../General/SettingsGeneral-HWAcc';
import SettingsPerformanceAutoplay from './SettingsPerformance-Autoplay';
import SettingsPerformanceColorProfile from './SettingsPerformance-ColorProfile';
import SettingsPerformanceDiskCache from './SettingsPerformance-DiskCache';
import SettingsPerformanceFrameRate from './SettingsPerformance-FrameRate';
import SettingsPerformanceGpuBlacklist from './SettingsPerformance-GpuBlacklist';
import SettingsPerformanceGpuRasterization from './SettingsPerformance-GpuRasterization';
import SettingsPerformanceGpuSelection from './SettingsPerformance-GpuSelection';
import SettingsPerformanceHighDpi from './SettingsPerformance-HighDpi';
import SettingsPerformanceJsMemory from './SettingsPerformance-JsMemory';
import SettingsPerformanceVideoDecoding from './SettingsPerformance-VideoDecoding';
import SettingsPerformanceVsync from './SettingsPerformance-Vsync';
import SettingsPerformanceWasm from './SettingsPerformance-Wasm';
import SettingsPerformanceZeroCopy from './SettingsPerformance-ZeroCopy';

export const SettingsPerformanceId = 'settings_performance_elem';

export default function SettingsPerformance() {
  return (
    <SettingsSection title="Performance" id={SettingsPerformanceId} icon={<SpedometerMiddle className="size-5" />}>
      <SettingsGeneralHwAcc />
      <SettingsPerformanceHighDpi />
      <SettingsPerformanceVideoDecoding />
      <SettingsPerformanceGpuRasterization />
      <SettingsPerformanceZeroCopy />
      <SettingsPerformanceWasm />
      <SettingsPerformanceJsMemory />
      <SettingsPerformanceDiskCache />
      <SettingsPerformanceColorProfile />
      <SettingsPerformanceAutoplay />
      <SettingsPerformanceGpuSelection />
      <SettingsPerformanceGpuBlacklist />
      <SettingsPerformanceVsync />
      <SettingsPerformanceFrameRate />
    </SettingsSection>
  );
}
