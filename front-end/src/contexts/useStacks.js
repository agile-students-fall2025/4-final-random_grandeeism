import { useContext } from "react";
import { StacksContext } from "./StacksContextValue";

export function useStacks() {
  return useContext(StacksContext);
}
