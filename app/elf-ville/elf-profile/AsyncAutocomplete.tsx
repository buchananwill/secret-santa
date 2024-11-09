import {
  HasIdClass,
  Identifier,
} from "@/hooks/useSelectionIdListToValueListMemo";
import { TypedPaths } from "@/hooks/useStringLabelSelection";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useLabelMaker } from "@/hooks/useLabelMaker";
import { useValueListValueMapAndIdMap } from "@/hooks/useValueListValueMapAndIdMap";

export function AsyncAutocomplete<
  T extends HasIdClass<ID>,
  ID extends Identifier,
>({
  getAsyncData,
  labelPath,
  onChange,
  initialValue,
  label,
  placeholder,
}: {
  getAsyncData?: (query: string, abortSignal: AbortSignal) => Promise<T[]>;
  initialValue?: string | null;
  onChange?: (value: ID | null) => void;
  labelPath: TypedPaths<T, string>;
  label?: string;
  placeholder?: string;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  let [loading, setLoading] = useTransition();

  const [masterList, setMasterList] = useState<T[]>([]);
  const [empty, setEmpty] = useState(false);
  const abortController = useRef<AbortController>();
  const [value, setValue] = useState(initialValue ?? "");

  const fetchOptions = useCallback(
    async (query: string) => {
      if (!getAsyncData) return;

      setLoading(() => {
        abortController.current?.abort();
        abortController.current = new AbortController();

        getAsyncData(query, abortController.current?.signal)
          .then((result) => {
            console.log(result);
            setMasterList(result ?? []);
            setEmpty(result?.length === 0);
            abortController.current = undefined;
          })
          .catch((e) => {
            console.error(e);
          });
      });
    },

    [getAsyncData],
  );

  let labelMaker = useLabelMaker<T>(labelPath);

  const { labelList, selectableMap, idMap } = useValueListValueMapAndIdMap(
    masterList,
    labelMaker,
  );

  const options = ["none", ...labelList].map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        if (onChange) {
          let selected = selectableMap
            ? selectableMap.get(optionValue)
            : undefined;
          const id = selected ? selected.id : null;
          onChange(id);
        }
        setValue(optionValue);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            fetchOptions(event.currentTarget.value).catch((e) =>
              console.error(e),
            );
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
            if (labelList === null) {
              fetchOptions(value).catch((e) => console.error(e));
            }
          }}
          onBlur={() => combobox.closeDropdown()}
          rightSection={loading && <Loader size={18} />}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={labelList === null}>
        <Combobox.Options>
          {options}
          {empty && <Combobox.Empty>No results found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
