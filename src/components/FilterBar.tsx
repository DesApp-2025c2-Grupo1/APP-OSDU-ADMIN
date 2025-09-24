import React from "react";

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterType(value);
    onFilterTypeChange(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    onFilterValueChange(value);
  };

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <input
        type="text"
        value={filterValue}
        onChange={handleValueChange}
        placeholder={valueLabel}
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="min-w-[200px]">
        <select
          value={filterType}
          onChange={handleTypeChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Seleccione tipo</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
