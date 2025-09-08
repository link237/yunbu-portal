import { HTMLAttributes, FC, PropsWithChildren } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {}

/** 卡片容器组件 */
const Card: FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={"bg-white rounded-lg shadow p-6 " + className} {...props}>
      {children}
    </div>
  );
};

export default Card;
