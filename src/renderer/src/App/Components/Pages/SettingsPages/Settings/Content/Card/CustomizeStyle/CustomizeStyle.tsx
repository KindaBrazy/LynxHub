import ConfigCard from './ConfigCard/ConfigCard';
import PreviewCard from './PreviewCard';

export default function CustomizeStyle() {
  return (
    <div className="flex md:flex-col lg:flex-row justify-between space-x-4">
      <div className="flex w-full flex-col gap-y-2">
        <ConfigCard />
      </div>
      <div className="flex w-full items-center justify-center">
        <PreviewCard />
      </div>
    </div>
  );
}
