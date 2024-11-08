"use client";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { TypedPaths } from "@/hooks/useStringLabelSelection";
import { useValueListValueMapAndIdMap } from "@/hooks/useValueListValueMapAndIdMap";
import { useLabelMaker } from "@/hooks/useLabelMaker";
import {
  HasIdClass,
  Identifier,
} from "@/hooks/useSelectionIdListToValueListMemo";
import { findProfilesForPartner } from "@/app/elf-ville/elf-profile/fetch-profile-action";
import { useFormContext } from "react-hook-form";
import { elf_profiles } from "@prisma/client";

export default function ChoosePartner() {
  let { watch, setValue } = useFormContext<elf_profiles>();

  let partnerId = watch("partner");

  const updatePartner = useCallback(
    (id: string | null) => {
      setValue("partner", id);
    },
    [setValue],
  );

  return (
    <AsyncAutocomplete
      label={"Add Partner"}
      placeholder="type to search"
      value={partnerId}
      onChange={updatePartner}
      getAsyncData={findProfilesForPartner}
      labelPath={"st_nick_name"}
    />
  );
}

export function AsyncAutocomplete<
  T extends HasIdClass<ID>,
  ID extends Identifier,
>({
  getAsyncData,
  labelPath,
  onChange,
  value: fieldValue,
  label,
  placeholder,
}: {
  getAsyncData?: (query: string, abortSignal: AbortSignal) => Promise<T[]>;
  value?: ID | null;
  onChange?: (value: ID | null) => void;
  labelPath: TypedPaths<T, string>;
  label?: string;
  placeholder?: string;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [loading, setLoading] = useState(false);
  const [masterList, setMasterList] = useState<T[]>([]);
  const [value, setValue] = useState("");
  const [empty, setEmpty] = useState(false);
  const abortController = useRef<AbortController>();

  const fetchOptions = (query: string) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    if (!getAsyncData) return;

    getAsyncData(query, abortController.current.signal)
      .then((result) => {
        console.log(result);
        setMasterList(result);
        setLoading(false);
        setEmpty(result.length === 0);
        abortController.current = undefined;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  let labelMaker = useLabelMaker<T>(labelPath);

  const { labelList, selectableMap, idMap } = useValueListValueMapAndIdMap(
    masterList,
    labelMaker,
  );

  const tValue = useMemo(() => {
    return fieldValue ? idMap.get(fieldValue) : null;
  }, [fieldValue, idMap]);

  const options = ["none", ...labelList].map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        if (onChange) {
          let selected = selectableMap.get(optionValue);
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
            fetchOptions(event.currentTarget.value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
            if (labelList === null) {
              fetchOptions(value);
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
