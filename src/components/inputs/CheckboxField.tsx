import { HTMLAttributes } from "react";

export type Props = {
  name: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

export function CheckboxField({
  name,
  label,
  checked,
  onChange,
  ...rest
}: Props) {
  return (
    <div {...rest}>
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange ? ev => onChange(ev.target.checked) : undefined}
        className="border-ink/10 bg-cream text-ink mr-1 rounded-[12px] border px-3 py-2.5"
      />
      <label htmlFor={name} className="text-l">
        {label}
      </label>
    </div>
  );
}
