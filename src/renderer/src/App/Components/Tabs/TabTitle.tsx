import {Dispatch, memo, SetStateAction, useEffect, useRef} from 'react';

type Props = {title: string; setIsTruncated: Dispatch<SetStateAction<boolean>>};

const TabTitle = memo(({title, setIsTruncated}: Props) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (spanRef.current) {
      setIsTruncated(spanRef.current.offsetWidth < spanRef.current.scrollWidth);
    }
  }, [title]);

  return (
    <span ref={spanRef} className="truncate">
      {title}
    </span>
  );
});

export default TabTitle;
