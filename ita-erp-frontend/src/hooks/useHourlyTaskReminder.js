import { useEffect } from "react";
import { fetchTaskReminder } from "../services/taskReminderService";

export default function useHourlyTaskReminder(showPopup) {
  useEffect(() => {
    let interval;

    const checkTasks = async () => {
      try {
        const res = await fetchTaskReminder();

        if (res.data.total > 0) {
          showPopup(res.data);
        }
      } catch (err) {
        console.error("Reminder check failed");
      }
    };

    // Run immediately on login
    checkTasks();

    // Every 1 hour
    interval = setInterval(checkTasks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [showPopup]);
}
