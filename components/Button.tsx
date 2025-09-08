import { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** 通用按钮组件，使用 Tailwind CSS 样式 */
const Button: FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={
        "px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
