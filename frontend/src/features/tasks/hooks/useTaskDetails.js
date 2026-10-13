import { useCallback, useEffect, useState } from "react";
import taskService from "../services/taskService";
import { getApiErrorMessage } from "../utils/taskFormatters";

// Callers remount this per task (via `key`), so state never mixes tasks.
export default function useTaskDetails(taskId) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchTask() {
      setIsLoading(true);
      setError("");

      try {
        const result = await taskService.getTask(taskId);
        if (isMounted) setTask(result);
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, "Unable to load task."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTask();

    return () => {
      isMounted = false;
    };
  }, [taskId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Both return an error message, or "" on success.
  const updateStatus = useCallback(
    async (status) => {
      try {
        setTask(await taskService.updateTask(taskId, { status }));
        return "";
      } catch (updateError) {
        return getApiErrorMessage(updateError, "Unable to update status.");
      }
    },
    [taskId]
  );

  const deleteTask = useCallback(async () => {
    try {
      await taskService.deleteTask(taskId);
      return "";
    } catch (deleteError) {
      return getApiErrorMessage(deleteError, "Unable to delete task.");
    }
  }, [taskId]);

  return { task, setTask, isLoading, error, reload, updateStatus, deleteTask };
}
