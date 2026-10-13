import { useCallback, useEffect, useState } from "react";
import taskService from "../services/taskService";
import { getApiErrorMessage } from "../utils/taskFormatters";

// Loads tasks for the given query and reloads whenever it changes.
// `query` must be memoised by the caller.
export default function useTasks(query, { enabled = true } = {}) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    let isMounted = true;

    async function fetchTasks() {
      setIsLoading(true);
      setError("");

      try {
        const data = await taskService.getTasks(query);
        if (isMounted) {
          setTasks(data.tasks);
          setTotal(data.total);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(getApiErrorMessage(fetchError, "Unable to load tasks."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [query, enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { tasks, total, isLoading, error, reload };
}
