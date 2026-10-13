import { useCallback, useEffect, useState } from "react";
import taskService from "../services/taskService";
import { getApiErrorMessage } from "../utils/taskFormatters";

// Callers remount this per task (via `key`), so state never mixes tasks.
export default function useTaskComments(taskId) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchComments() {
      setIsLoading(true);
      setError("");

      try {
        const result = await taskService.getComments(taskId);
        if (isMounted) setComments(result);
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, "Unable to load comments."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [taskId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Returns an error message, or "" on success.
  const addComment = useCallback(
    async (content) => {
      try {
        await taskService.addComment(taskId, content);
        reload();
        return "";
      } catch (addError) {
        return getApiErrorMessage(addError, "Unable to add comment.");
      }
    },
    [taskId, reload]
  );

  return { comments, isLoading, error, addComment, reload };
}
