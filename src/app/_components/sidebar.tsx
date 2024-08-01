"use client";

import { cn } from "@/lib/utils";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Comic_Neue } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";

const comic = Comic_Neue({ subsets: ["latin"], weight: ["700"] });

const components = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Datetime Picker",
    href: "/datetime-picker",
  },
  {
    name: "Input Typewriter",
    href: "/input-typewriter",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="min-w-[300px] w-min h-full flex flex-col justify-between p-5">
      <div className="flex flex-col gap-20">
        <h2 className={cn("text-2xl", comic.className)}>Shadcn Components</h2>

        <ul className="flex flex-col gap-1">
          {components.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              className={cn(
                "p-2",
                pathname === item.href && "bg-neutral-100 rounded-md"
              )}
            >
              <li>{item.name}</li>
            </Link>
          ))}
        </ul>
      </div>

      <footer className="text-sm space-y-1">
        <p>
          Made with 💖 by{" "}
          <Link
            href="https://github.com/maliksidk19"
            className="underline"
            target="_blank"
          >
            Saad
          </Link>
        </p>
        <p className="flex items-center gap-1">
          <GitHubLogoIcon />
          <Link
            href="https://github.com/Maliksidk19/shadcn-datetime-picker"
            target="_blank"
            className="underline"
          >
            Give a star on GitHub
          </Link>
        </p>
      </footer>
    </aside>
  );
};
