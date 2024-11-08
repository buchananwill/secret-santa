import { useValueListValueMapAndIdMap } from "@/hooks/useValueListValueMapAndIdMap";
import {
  HasIdClass,
  Identifier,
  useSelectionIdListToValueListMemo,
} from "@/hooks/useSelectionIdListToValueListMemo";

import { Dispatch, SetStateAction } from "react";
import { Get, Paths } from "type-fest";
import { useStringSelectionListToIdListCallback } from "@/hooks/useStringSelectionListToIdListCallback";
import { useLabelMaker } from "@/hooks/useLabelMaker";

export function useStringLabelSelection<T extends HasIdClass>(
  masterList: T[],
  selectedIdList: Identifier[],
  dispatchIdList: DispatchState<Identifier[]>,
  labelMaker?:
    | (string & TypedPaths<T, string | number>)
    | ((item: T) => string),
) {
  const getLabel = useLabelMaker(labelMaker);
  const { labelList, selectableMap, idMap } = useValueListValueMapAndIdMap<T>(
    masterList,
    getLabel,
  );
  const selectionList = useSelectionIdListToValueListMemo(
    selectedIdList,
    idMap,
    getLabel,
  );
  const onChange = useStringSelectionListToIdListCallback(
    selectableMap,
    dispatchIdList,
  );
  return { labelList, selectionList, onChange };
}

export type DispatchState<T> = Dispatch<SetStateAction<T>>;

export type TypedPaths<TType, PType> =
  Paths<TType> extends infer P
    ? P extends string
      ? Get<TType, P> extends PType
        ? P
        : never
      : never
    : never;
