import { DatetimePickerV1 } from "@/components/date-time-picker-v1";
import { DateTimePickerV2 } from "@/components/date-time-picker-v2";

const HomePage = () => {
  return (
    <section className="flex-1 m-20 flex flex-col gap-10 w-[400px]">
      <DatetimePickerV1 />
      <DateTimePickerV2 />
    </section>
  );
};

export default HomePage;
