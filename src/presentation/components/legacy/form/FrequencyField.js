import React from "react";
import SelectButtonField from "./SelectButtonField";

const FrequencyField = ({
  control,
  validationRules,
  options = [],
  name = "frequency",
  label = "Frequência *",
}) => {
  return (
    <SelectButtonField
      control={control}
      validationRules={validationRules}
      options={options}
      name={name}
      label={label}
      getOptionKey={(freq) => freq.value}
      getOptionValue={(freq) => freq.value}
      getOptionLabel={(freq) => freq.label}
    />
  );
};

export default FrequencyField;
