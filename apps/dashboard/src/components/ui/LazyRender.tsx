import { useEffect, useRef, useState, ReactNode } from "react";

interface LazyRenderProps {
  children: ReactNode;
  height?: number;
  placeholder?: ReactNode;
}

export const LazyRender = ({ children, height = 150, placeholder }: LazyRenderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (isVisible) return <>{children}</>;

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {placeholder || <div className="skeleton rounded-3xl" style={{ height }} />}
    </div>
  );
};

export default LazyRender;
