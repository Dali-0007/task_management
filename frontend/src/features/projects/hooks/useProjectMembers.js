
import { useCallback, useEffect, useState } from "react";
import projectMemberService from "../services/projectMemberService";

function useProjectMembers(projectId) {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await projectMemberService.getMembers(projectId);
      setMembers(result);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load project members."
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMembers() {
      if (!projectId) return;

      setIsLoading(true);
      setError("");

      try {
        const result = await projectMemberService.getMembers(projectId);
        if (isMounted) setMembers(result);
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Unable to load project members."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const searchUsers = useCallback(
    async (search) => {
      if (!projectId || search.trim().length < 2) {
        setAvailableUsers([]);
        return;
      }

      setIsSearching(true);
      setError("");

      try {
        const result = await projectMemberService.searchAvailableUsers(
          projectId,
          search.trim()
        );
        setAvailableUsers(result);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to search available users."
        );
        setAvailableUsers([]);
      } finally {
        setIsSearching(false);
      }
    },
    [projectId]
  );

  const addMember = useCallback(
    async (userId) => {
      setError("");

      try {
        await projectMemberService.addMember(projectId, userId);
        await loadMembers();
        setAvailableUsers((previous) =>
          previous.filter((user) => String(user.id) !== String(userId))
        );
        return true;
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to add project member."
        );
        return false;
      }
    },
    [projectId, loadMembers]
  );

  const removeMember = useCallback(
    async (userId) => {
      setError("");

      try {
        await projectMemberService.removeMember(projectId, userId);
        setMembers((previous) =>
          previous.filter((member) => String(member.id) !== String(userId))
        );
        return true;
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to remove project member."
        );
        return false;
      }
    },
    [projectId]
  );

  return {
    members,
    availableUsers,
    isLoading,
    isSearching,
    error,
    loadMembers,
    searchUsers,
    addMember,
    removeMember,
  };
}

export default useProjectMembers;
