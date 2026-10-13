import { useCallback, useEffect, useState } from "react";
import taskService from "../../tasks/services/taskService";
import { getApiErrorMessage } from "../../tasks/utils/taskFormatters";

export default function useDashboardSummary() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      try {
        const result = await taskService.getSummary();
        if (isMounted) {
          setSummary(result);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, "Unable to load task insights."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { summary, isLoading, error, reload };
}
