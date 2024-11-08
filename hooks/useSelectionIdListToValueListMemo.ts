import { useMemo } from "react";

export type Identifier = string | number;
export type HasIdClass<ID extends Identifier = Identifier> = {
  id: ID;
};

export function useSelectionIdListToValueListMemo<T extends HasIdClass>(
  selectedIdList: Identifier[],
  idMap: Map<Identifier, T>,
  getValue: (item?: T) => string,
) {
  return useMemo(() => {
    return selectedIdList.map((id) => idMap.get(id)).map(getValue);
  }, [selectedIdList, getValue, idMap]);
}
