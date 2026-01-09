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
 * Fixed amounts are formatted with commas (e.g., "1,234.56").
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

  // Format value with commas for display (only for non-percentage values)
  const formatDisplayValue = (val: string): string => {
    if (!val || val.includes("%")) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const displayValue = isEditing ? editingValue : formatDisplayValue(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow digits, one decimal point, and % at the end
    // Also allow commas for user convenience while typing
    const regex = /^[0-9,]*\.?[0-9]*%?$/;
    if (regex.test(newValue) || newValue === "") {
      setEditingValue(newValue);
    }
  };

  const handleBlur = () => {
    if (editingValue === null) return;

    let finalValue = editingValue.trim();
    // Remove commas for parsing
    const cleanValue = finalValue.replace(/,/g, "");

    if (cleanValue && !cleanValue.includes("%")) {
      const num = parseFloat(cleanValue);
      if (!isNaN(num)) {
        // Validate: discount should not exceed price per unit
        if (maxValue > 0 && num > maxValue) {
          finalValue = maxValue.toFixed(2);
        } else {
          finalValue = num.toFixed(2);
        }
      }
    } else if (cleanValue.includes("%")) {
      // Validate: percentage should not exceed 100%
      const percent = parseFloat(cleanValue.replace("%", ""));
      if (!isNaN(percent) && percent > 100) {
        finalValue = "100%";
      } else if (!isNaN(percent)) {
        finalValue = `${percent}%`;
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
    // When focusing, show raw value without commas for easier editing
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
