import { getGradientClass } from "@/stores/gradientStore";
import { CSSProperties, useMemo } from "react";

const ProfileGradients = ({
  id,
  children,
  classNames,
  style,
  onClick,
}: {
  id: string;
  children: React.ReactNode;
  classNames: string;
  style?: CSSProperties;
  onClick?: () => void;
}) => {
  const gradientClass = useMemo(() => getGradientClass(id), [id]);

  return (
    <div
      className={`${gradientClass} shrink-0 rounded-full flex-center text-white ${classNames}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ProfileGradients;
