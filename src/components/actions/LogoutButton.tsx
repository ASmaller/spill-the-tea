import Link from "next/link";
import { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href" | "prefetch">;

export function LogoutButton({ children, className, ...props }: Props) {
  return (
    <Link
      {...props}
      href="/logout"
      prefetch={false}
      className={className ?? "text-ink font-serif"}
    >
      {children ?? "Logout"}
    </Link>
  );
}
