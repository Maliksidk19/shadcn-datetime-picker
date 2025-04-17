import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Image from "next/image";

const AppSidebar = () => {
  return (
    <Sidebar title="Shadcn Components">
      <SidebarHeader>
        <h2 className="font-semibold">Shadcn Components</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/datetime-picker">Datetime Picker</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/input-typewriter">Input Typewriter</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-sm ml-2">
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
          <Image src="/github.svg" alt="Github Logo" width={16} height={16} />
          <Link
            href="https://github.com/Maliksidk19/shadcn-datetime-picker"
            target="_blank"
            className="underline"
          >
            Give a star on GitHub
          </Link>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
