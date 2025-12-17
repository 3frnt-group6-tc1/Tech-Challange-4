import React from "react";
import SelectButtonField from "./SelectButtonField";

const SelectTagField = ({
  control,
  validationRules,
  options = [],
  name = "category",
  label = "Categoria *",
}) => {
  return (
    <SelectButtonField
      control={control}
      validationRules={validationRules}
      options={options}
      name={name}
      label={label}
    />
  );
};

export default SelectTagField;
