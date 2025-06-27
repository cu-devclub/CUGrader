import { Panel, PanelOnCollapse, PanelOnExpand } from "react-resizable-panels";
import { ComponentProps, useCallback, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

export function usePanelControl(options: {
  id: string;
  defaultCollapsed?: boolean;
}) {
  const { id, defaultCollapsed } = options;
  const panelRef = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed ?? false);

  const onCollapse = useCallback<PanelOnCollapse>(() => {
    setIsCollapsed(true);
  }, []);

  const onExpand = useCallback<PanelOnExpand>(() => {
    setIsCollapsed(false);
  }, []);

  const toggle = useCallback(() => {
    if (panelRef.current) {
      if (panelRef.current.isCollapsed()) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  }, []);

  const panelProps: ComponentProps<typeof Panel> = {
    id,
    collapsible: true,
    onCollapse: onCollapse,
    onExpand: onExpand,
  };

  return {
    isCollapsed,
    panelProps,
    toggle,
    panelRef,
  };
}
