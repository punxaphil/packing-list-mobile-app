import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";

type Props = {
  initialTimestamp: number | null;
  onPicked: (timestamp: number) => void;
  onDismiss: () => void;
};

export const AndroidDateTimePicker = ({ initialTimestamp, onPicked, onDismiss }: Props) => {
  const [mode, setMode] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date>(initialTimestamp ? new Date(initialTimestamp) : new Date());

  const handleChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (event.type === "dismissed") {
        onDismiss();
        return;
      }
      if (!date) {
        onDismiss();
        return;
      }
      if (mode === "date") {
        setSelectedDate(date);
        setMode("time");
        return;
      }
      onPicked(date.getTime());
      onDismiss();
    },
    [mode, onDismiss, onPicked]
  );

  return <DateTimePicker value={selectedDate} mode={mode} onChange={handleChange} minimumDate={new Date()} />;
};
