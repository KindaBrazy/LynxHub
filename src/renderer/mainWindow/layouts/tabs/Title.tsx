import {Dispatch, memo, SetStateAction, useEffect, useRef} from 'react';

type Props = {
  title: string;
  setIsTruncated: Dispatch<SetStateAction<boolean>>;
};

/**
 * Displays the tab title and detects truncation.
 * Updates the parent's state `setIsTruncated` if the text overflows.
 */
const TabTitle = memo(({title, setIsTruncated}: Props) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (spanRef.current) {
      const isTruncated = spanRef.current.offsetWidth < spanRef.current.scrollWidth;
      setIsTruncated(isTruncated);
    }
  }, [title, setIsTruncated]);

  return (
    <span ref={spanRef} className="truncate">
      {title}
    </span>
  );
});

export default TabTitle;
