import { Input } from "antd";
import { memo, useState } from "react";

interface EditableDiscountCellProps {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  maxValue?: number; // For validation (price per unit)
  onChange: (value: string) => void;
}

/**
 * Editable discount cell with local state to prevent parent re-renders while typing.
 * Supports both fixed amount and percentage (e.g., "100" or "10%").
 */
export const EditableDiscountCell = memo(function EditableDiscountCell({
  value,
  disabled = false,
  placeholder = "",
  maxValue = 0,
  onChange,
}: EditableDiscountCellProps) {
  // Use local state only when focused, otherwise show parent value directly
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const isEditing = editingValue !== null;

  const displayValue = isEditing ? editingValue : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*%?$/;
    if (regex.test(newValue) || newValue === "") {
      setEditingValue(newValue);
    }
  };

  const handleBlur = () => {
    if (editingValue === null) return;

    let finalValue = editingValue.trim();

    if (finalValue && !finalValue.includes("%")) {
      const num = parseFloat(finalValue);
      if (!isNaN(num)) {
        // Validate: discount should not exceed price per unit
        if (maxValue > 0 && num > maxValue) {
          finalValue = maxValue.toFixed(2);
        } else {
          finalValue = num.toFixed(2);
        }
      }
    } else if (finalValue.includes("%")) {
      // Validate: percentage should not exceed 100%
      const percent = parseFloat(finalValue.replace("%", ""));
      if (!isNaN(percent) && percent > 100) {
        finalValue = "100%";
      }
    }

    // Clear editing state first
    setEditingValue(null);

    // Only call onChange if value actually changed
    if (finalValue !== value) {
      onChange(finalValue);
    }
  };

  const handleFocus = () => {
    setEditingValue(value);
  };

  return (
    <Input
      value={displayValue}
      style={{ width: "100%", textAlign: "right" }}
      disabled={disabled}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
});
