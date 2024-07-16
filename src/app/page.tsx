import { DatetimePickerV1 } from "@/components/date-time-picker-v1";
import { DateTimePickerV2 } from "@/components/date-time-picker-v2";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <span className="absolute flex items-center gap-2 top-10 right-10">
        <GitHubLogoIcon className="h-6 w-6" />{" "}
        <Link
          href="https://github.com/Maliksidk19/shadcn-datetime-picker"
          target="_blank"
        >
          Datetime Picker Repo
        </Link>
      </span>
      <section className="flex-1 m-20 flex flex-col gap-10 w-[400px]">
        <DatetimePickerV1 />
        <DateTimePickerV2 />
      </section>
    </div>
  );
};

export default HomePage;
