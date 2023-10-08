import React, {useEffect, useRef} from 'react';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';

type SmoothScrollProps = {
  children: React.ReactNode;
  // Extra class names for the root element
  extraClasses?: string;
  // Extra class names for the content element
  extraContentElClasses?: string;
};

function SmoothScroll({children, extraClasses, extraContentElClasses}: SmoothScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      Scrollbar.detachStyle();
      Scrollbar.use(OverscrollPlugin);
      const scrollbar: Scrollbar = Scrollbar.init(scrollRef.current, {damping: 0.15});

      scrollbar.updatePluginOptions('OverscrollPlugin', {effect: 'bounce', enable: true, damping: 0.2, maxOverscroll: 150});
      scrollbar.track.xAxis.hide();

      scrollbar.track.yAxis.element.style.background = 'rgba(0,0,0,0.2)';
      scrollbar.track.yAxis.thumb.element.style.background = 'rgba(80,80,80,0.6)';
      scrollbar.track.yAxis.element.style.display = 'absolute';
      scrollbar.track.yAxis.element.style.marginBottom = 'absolute';

      scrollbar.contentEl.className = ['flex flex-col items-center', extraContentElClasses].join(' ');

      return (): void => {
        if (scrollRef.current) scrollbar.destroy();
      };
    }
    return undefined;
  }, []);

  return (
    <div className={['h-full w-full pb-4 pt-2', extraClasses].join(' ')} ref={scrollRef}>
      {children}
    </div>
  );
}

SmoothScroll.defaultProps = {
  extraClasses: '',
  extraContentElClasses: '',
};
export default React.memo(SmoothScroll);
