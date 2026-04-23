import {useEffect, useRef} from 'react';

export default function useInertRemover() {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (node: HTMLDivElement | null) => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(record => {
        if (record.type === 'attributes') {
          const changedAttrName = record.attributeName;
          if (node && changedAttrName === 'inert') node.removeAttribute('inert');
        }
      });
    });

    if (node) {
      observer.observe(node, {attributes: true});
      observerRef.current = observer;
    }
  };
}
