import React from "react";
import { TextField, MenuItem, Box, Select, FormControl, InputLabel } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material"; 

type FilterOption = {
  label: string;
  value: string;
};

type FilterBarProps = {
  filterOptions: FilterOption[];
  onFilterTypeChange: (value: string) => void;
  onFilterValueChange: (value: string) => void;
  valueLabel: string;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  onFilterTypeChange,
  onFilterValueChange,
  valueLabel,
}) => {
  const [filterType, setFilterType] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilterType(value);
    onFilterTypeChange(value);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value);
    onFilterValueChange(value);
  };

  return (
    <Box display="flex" gap={2} mb={2}>
      <TextField
        value={filterValue}
        onChange={handleValueChange}
        size="small"
        sx={{ flex: 1 }}
        placeholder={valueLabel}
      />

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="filter-type-label">Tipo de dato</InputLabel>
        <Select
          labelId="filter-type-label"
          value={filterType}
          label="Tipo de dato"
          onChange={handleTypeChange} 
          displayEmpty
        >
          {filterOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
