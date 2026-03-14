import {useLayoutEffect, useRef, useState} from "react";

type ChartContainerProps = {
  children: (size: {width: number; height: number}) => React.ReactNode;
};

export const ChartContainer = ({children}: ChartContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({width: 0, height: 0});

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const {width, height} = entries[0]?.contentRect ?? {};
      if (
        typeof width === "number" &&
        typeof height === "number" &&
        width > 0 &&
        height > 0
      ) {
        setSize({width, height});
      }
    });
    observer.observe(el);
    const {width, height} = el.getBoundingClientRect();
    if (width > 0 && height > 0) setSize({width, height});
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-64 min-h-64 min-w-0 w-full">
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
};
