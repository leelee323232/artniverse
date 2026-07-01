"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BasicDatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function BasicDatePicker({
  value,
  onChange,
  placeholder = "請選擇日期",
  disabled,
  className = "",
}: BasicDatePickerProps) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      placeholderText={placeholder}
      disabled={disabled}
      dateFormat="yyyy/MM/dd"
      className={`
        h-10 w-full rounded-md border border-gray-100 bg-transparent px-3 text-sm
        text-gray-100 shadow-sm
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
        disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
        ${className}
      `}
    />
  );
}
