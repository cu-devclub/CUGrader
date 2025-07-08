import { createContext, useContext } from "react";
import { CodeSpaceStore } from "./store";

export const CodeSpaceStoreContext = createContext<CodeSpaceStore | null>(null);

export const useCodeSpaceStore = () => {
  const context = useContext(CodeSpaceStoreContext);
  if (!context) {
    throw new Error("useCodeSpaceStore must be used within a CodeSpaceStoreProvider");
  }
  return context;
};

