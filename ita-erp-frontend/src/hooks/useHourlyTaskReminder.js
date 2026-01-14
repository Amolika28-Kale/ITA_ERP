import { useEffect } from "react";
import { fetchTaskReminder } from "../services/taskReminderService";

export default function useHourlyTaskReminder(showPopup) {
  useEffect(() => {
    let interval;

    const checkTasks = async () => {
      try {
        const res = await fetchTaskReminder();
        const data = res.data;

        const total =
          (data.pendingCount || 0) + (data.overdueCount || 0);

        if (total > 0) {
          showPopup(data);
        }
      } catch (err) {
        console.error("Reminder check failed", err);
      }
    };

    // Run immediately
    checkTasks();

    // Every 1 hour
    interval = setInterval(checkTasks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [showPopup]);
}
