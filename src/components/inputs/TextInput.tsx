"use client";

import { FOCUS_RING } from "@/lib/styles";
import type { InputHTMLAttributes } from "react";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
};

export function TextInput({
  value,
  onChange,
  large,
  className,
  ...rest
}: Props) {
  return (
    <input
      {...rest}
      type={rest.type ?? "text"}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-paper text-ink border-ink/[0.12] w-full rounded-[8px] border ${FOCUS_RING.paper} ${className ?? ""}`}
      style={{
        padding: large ? "12px 14px" : "9px 12px",
        fontSize: large ? 16 : 13,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        ...rest.style,
      }}
    />
  );
}
