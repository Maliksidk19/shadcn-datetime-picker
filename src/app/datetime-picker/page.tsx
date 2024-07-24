import { DatetimePickerV1 } from "@/components/date-time-picker-v1";
import { DateTimePickerV2 } from "@/components/date-time-picker-v2";

const DateTimePickerComp = () => {
  return (
    <div className="flex-1 m-20 flex flex-col gap-10 w-[400px]">
      <h2 className="text-xl font-bold">Datetime Picker V1</h2>
      <DatetimePickerV1 />
      <h2 className="text-xl font-bold mt-10">Datetime Picker V2</h2>
      <DateTimePickerV2 />
    </div>
  );
};

export default DateTimePickerComp;
