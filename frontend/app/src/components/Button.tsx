import clsx from "clsx";

type ButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
};

const Button = ({
  children,
  onClick,
  type = "button",
  variant,
  size,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        // base
        "inline-flex items-center justify-center gap-1.5 rounded-1.5 border-0 bg-transparent p-0 font-normal text-text cursor-pointer transition-colors",

        // variant
        {
          "!bg-primary text-white": variant === "primary",
          "text-primary": variant === "secondary",
          "border border-primary text-primary": variant === "outline",
        },

        // size
        {
          "px-1 py-1.5 text-sm": size === "sm",
          "px-2 py-1.5 text-md": size === "md",
          "px-2.5 py-2 text-lg": size === "lg",
        },

        // disabled
        disabled && "cursor-not-allowed opacity-50",

        className
      )}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;