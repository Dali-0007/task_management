
import { useCallback, useEffect, useState } from "react";
import projectService from "../services/projectService";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await projectService.getProjects();
      setProjects(data);
      return data;
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      try {
        const data = await projectService.getProjects();

        if (isMounted) {
          setProjects(data);
          setError("");
        }
      } catch (error) {
        if (isMounted) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const createProject = async (projectData) => {
    const project = await projectService.createProject(projectData);
    await loadProjects();
    return project;
  };

  const updateProject = async (projectId, projectData) => {
    const project = await projectService.updateProject(
      projectId,
      projectData
    );

    await loadProjects();
    return project;
  };

  const archiveProject = async (projectId) => {
    const project = await projectService.archiveProject(projectId);
    await loadProjects();
    return project;
  };

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    archiveProject,
  };
}
