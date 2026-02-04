import { useSpring, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  className?: string;
}

function AnimatedValue({
  motionValue,
  formatter,
}: {
  motionValue: MotionValue<number>;
  formatter: (n: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(
    formatter(motionValue.get()),
  );

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (v) => {
      setDisplayValue(formatter(v));
    });
    return unsubscribe;
  }, [motionValue, formatter]);

  return <>{displayValue}</>;
}

export function AnimatedNumber({
  value,
  formatter,
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <span className={className}>
      <AnimatedValue motionValue={spring} formatter={formatter} />
    </span>
  );
}
