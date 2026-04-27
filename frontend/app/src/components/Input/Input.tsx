import React from "react";
import styles from "./Input.module.css";
import clsx from "clsx";

type InputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  error = false,
  className = "",
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx(styles.input, error && styles.error, className)}
    />
  );
};

export default Input;