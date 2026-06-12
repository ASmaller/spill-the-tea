import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export function LoginButton({ children }: Props) {
  return (
    <Link className="text-ink font-serif" href="/login">
      {children ?? "Login"}
    </Link>
  );
}
