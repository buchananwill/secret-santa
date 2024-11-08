import { useCallback } from "react";
import {
  HasIdClass,
  Identifier,
} from "@/hooks/useSelectionIdListToValueListMemo";
import { DispatchState } from "@/hooks/useStringLabelSelection";

export function useStringSelectionListToIdListCallback<T extends HasIdClass>(
  selectableMap: Map<string, T>,
  dispatchIdList: DispatchState<Identifier[]>,
) {
  return useCallback(
    (selection: string | string[] | null) => {
      let stringList = [] as string[];
      if (typeof selection === "string") {
        stringList.push(selection);
      } else if (Array.isArray(selection)) {
        stringList = selection;
      }
      const nextSelection: Identifier[] = stringList
        .map((label) => selectableMap.get(label))
        .map((item) => item?.id)
        .filter(isNotUndefined);
      dispatchIdList(nextSelection);
    },
    [selectableMap, dispatchIdList],
  );
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
