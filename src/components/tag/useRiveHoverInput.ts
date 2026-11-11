import { useCallback, useEffect, useRef } from "react";
import { useStateMachineInput } from "@rive-app/react-canvas";

export function useRiveHoverInput(
  rive: unknown,
  stateMachineName: string,
  hoverInputName: string
) {
  const hoverInput = useStateMachineInput(
    rive as never,
    stateMachineName,
    hoverInputName
  );

  const hoverInputRef = useRef<typeof hoverInput | null>(null);

  useEffect(() => {
    hoverInputRef.current = hoverInput ?? null;
  }, [hoverInput]);

  return useCallback(
    (isHovering: boolean) => {
      const input = hoverInputRef.current;
      if (!input) return;
      input.value = isHovering;
    },
    []
  );
}

