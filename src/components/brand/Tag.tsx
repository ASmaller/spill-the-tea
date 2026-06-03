type Props = {
  children: React.ReactNode;
  icon?: React.ReactNode;
};

export function Tag({ children, icon }: Props) {
  return (
    <span
      className={`bg-tea/10 text-tea inline-flex items-center gap-1 rounded-full font-medium`}
      style={{ fontSize: 11, padding: "4px 9px" }}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
