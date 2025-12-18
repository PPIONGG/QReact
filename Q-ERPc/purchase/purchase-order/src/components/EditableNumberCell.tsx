import { Input } from "antd";
import { memo, useState } from "react";

interface EditableNumberCellProps {
  value: number;
  disabled?: boolean;
  placeholder?: string;
  precision?: number;
  min?: number;
  onChange: (value: number) => void;
}

/**
 * Editable number cell with local state to prevent parent re-renders while typing.
 * Only syncs value back to parent on blur.
 */
export const EditableNumberCell = memo(function EditableNumberCell({
  value,
  disabled = false,
  placeholder = "0.00",
  precision = 2,
  onChange,
}: EditableNumberCellProps) {
  // Format number to string with precision
  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  // Use local state only when focused, otherwise show parent value directly
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const isEditing = editingValue !== null;

  const displayValue = isEditing ? editingValue : formatNumber(value);

  // Format number string with commas and fixed decimal places
  const formatWithCommasAndDecimals = (numStr: string): string => {
    // Remove commas first
    const clean = numStr.replace(/,/g, "");

    // Split by decimal point
    const parts = clean.split(".");

    // Add commas to integer part (or "0" if empty)
    const intPart = parts[0] || "0";
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Handle decimal part - always show fixed decimal places
    let decPart = parts[1] ?? "";
    // Limit to precision digits
    decPart = decPart.slice(0, precision);
    // Pad with zeros if needed
    decPart = decPart.padEnd(precision, "0");

    return `${formattedInt}.${decPart}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const inputValue = input.value;
    const cursorPos = input.selectionStart ?? 0;

    // Remove commas to get raw value
    const rawValue = inputValue.replace(/,/g, "");

    // Only allow digits (no manual dot input - it's always there)
    const rawWithoutDot = rawValue.replace(".", "");
    if (!/^[0-9]*$/.test(rawWithoutDot)) {
      return;
    }

    // Don't allow editing past the decimal precision
    const rawDotIndex = rawValue.indexOf(".");
    if (rawDotIndex !== -1) {
      const decimalPart = rawValue.slice(rawDotIndex + 1);
      if (decimalPart.length > precision) {
        return;
      }
    }

    // Format with commas and fixed decimals
    const formattedValue = formatWithCommasAndDecimals(rawValue);

    // Calculate new cursor position (adjust for added/removed commas)
    const oldCommasBefore = (inputValue.slice(0, cursorPos).match(/,/g) || []).length;
    const newCommasBefore = (formattedValue.slice(0, cursorPos).match(/,/g) || []).length;
    let newCursorPos = cursorPos + (newCommasBefore - oldCommasBefore);

    // Make sure cursor doesn't go past the allowed decimal places
    const newDotIndex = formattedValue.indexOf(".");
    const maxPos = newDotIndex + precision + 1;
    if (newCursorPos > maxPos) {
      newCursorPos = maxPos;
    }

    setEditingValue(formattedValue);

    // Restore cursor position after React updates
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleBlur = () => {
    if (editingValue === null) return;

    // Parse the value, removing commas
    const cleanValue = editingValue.replace(/,/g, "");
    const num = parseFloat(cleanValue) || 0;

    // Clear editing state first
    setEditingValue(null);

    // Only call onChange if value actually changed
    if (num !== value) {
      onChange(num);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Start editing with current formatted value
    setEditingValue(formatNumber(value));
    // Select all after a microtask to ensure value is set
    requestAnimationFrame(() => {
      e.target.select();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const currentValue = input.value;
    const dotIndex = currentValue.indexOf(".");
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;

    // Press "." - move cursor after dot
    if (e.key === ".") {
      e.preventDefault();
      if (dotIndex !== -1) {
        requestAnimationFrame(() => {
          input.setSelectionRange(dotIndex + 1, dotIndex + 1);
        });
      }
      return;
    }

    // Handle digit input
    if (/^[0-9]$/.test(e.key)) {
      // Case 1: Cursor at position 0 and value starts with "0." - replace the 0
      if (selectionStart === 0 && selectionEnd === 0 && currentValue.startsWith("0.")) {
        e.preventDefault();
        const newValue = e.key + currentValue.slice(1);
        setEditingValue(newValue);
        requestAnimationFrame(() => {
          input.setSelectionRange(1, 1);
        });
        return;
      }

      // Case 2: Cursor is in the decimal part - replace the digit at cursor position
      if (dotIndex !== -1 && selectionStart > dotIndex) {
        const posInDecimal = selectionStart - dotIndex - 1; // 0-based position in decimal part

        // Only allow if within precision
        if (posInDecimal < precision) {
          e.preventDefault();

          // Build new value by replacing the digit at cursor position
          const beforeCursor = currentValue.slice(0, selectionStart);
          const afterCursor = currentValue.slice(selectionStart + 1); // Skip the digit being replaced
          const newValue = beforeCursor + e.key + afterCursor;

          // Ensure we still have proper decimal places
          const formatted = formatWithCommasAndDecimals(newValue.replace(/,/g, ""));
          setEditingValue(formatted);

          // Move cursor to next position
          const newCursorPos = selectionStart + 1;
          const maxPos = formatted.indexOf(".") + precision + 1;
          requestAnimationFrame(() => {
            input.setSelectionRange(
              Math.min(newCursorPos, maxPos),
              Math.min(newCursorPos, maxPos)
            );
          });
        } else {
          e.preventDefault();
        }
        return;
      }

      // Case 3: Normal integer part - let handleChange deal with it
      return;
    }

    // Block non-numeric keys (except navigation, backspace, delete, tab, and dot)
    const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "."];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Input
      value={displayValue}
      placeholder={placeholder}
      style={{ width: "100%", textAlign: "right" }}
      disabled={disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
});
