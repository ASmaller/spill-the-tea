"use client";

import { SessionProfile } from "@/lib/session";
import { HTMLAttributes, useState } from "react";
import { DropDownItem, DropDownList } from "../lists/DropDownList";

export type Props = HTMLAttributes<HTMLDivElement> & {
  profile: SessionProfile;
  isAdmin?: boolean;
};

export function ProfileButton({
  profile,
  isAdmin = false,
  className,
  ...rest
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const items: DropDownItem[] = [
    isAdmin
      ? {
          key: "admin",
          name: "Admin",
          href: "/admin",
        }
      : null,
    {
      key: "logout",
      name: "Logout",
      href: "/logout",
      dumb: true,
    },
  ].filter(it => it != null);

  return (
    <div
      {...rest}
      className={`relative flex h-full flex-col justify-center ${className ?? ""}`}
    >
      <button
        className="text-ink cursor-pointer"
        onClick={ev => {
          ev.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        {profile.nickname}
      </button>

      {isOpen && (
        <DropDownList
          className={`right-0 bottom-0`}
          items={items}
          onNavigate={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
