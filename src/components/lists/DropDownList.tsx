import Link, { LinkProps } from "next/link";
import { HTMLAttributes, Key } from "react";

export interface DropDownItem {
  key: Key;
  name: string;
  href: string;
  dumb?: boolean;
}

export type Props = HTMLAttributes<HTMLDivElement> & {
  items: DropDownItem[];
  leftAnchored?: boolean;
  topAnchored?: boolean;
  /** Event handler called when a link in the list is pressed. */
  onNavigate?: () => void;
};

export function DropDownList({
  items,
  leftAnchored = false,
  topAnchored = false,
  onNavigate,
  className,
  ...rest
}: Props) {
  return (
    <div {...rest} className={`absolute ${className ?? ""}`}>
      <ul
        className={`bg-paper text-md text-ink border-ink/10 supports-[backdrop-filter]:bg-paper/70 absolute min-h-4 min-w-4 border p-2 font-serif backdrop-blur-md ${leftAnchored ? "left-0" : "right-0"} ${topAnchored ? "bottom-0 rounded-t-lg" : "top-0 rounded-b-lg"}`}
      >
        {items.map(item => {
          const linkProps = {
            href: item.href,
            className: `block ${leftAnchored ? "text-left" : "text-right"}`,
            onClick: () => {
              onNavigate?.();
            },
          } satisfies {
            href: string;
          } & HTMLAttributes<HTMLAnchorElement> &
            LinkProps;

          return (
            <li key={item.key} className="mb-1">
              {item.dumb ? (
                <a {...linkProps}>{item.name}</a>
              ) : (
                <Link {...linkProps}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
