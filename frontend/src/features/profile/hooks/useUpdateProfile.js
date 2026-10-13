import { useCallback, useState } from "react";
import profileService from "../services/profileService";
import { useAuth } from "../../auth/context/AuthContext";
import { getApiErrorMessage } from "../../tasks/utils/taskFormatters";

export default function useUpdateProfile() {
  const { refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Returns true on success.
  const updateProfile = useCallback(
    async (changes) => {
      setIsSaving(true);
      setError("");

      try {
        await profileService.updateProfile(changes);
        await refreshUser();
        return true;
      } catch (updateError) {
        setError(getApiErrorMessage(updateError, "Unable to update your profile."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshUser]
  );

  return { updateProfile, isSaving, error, clearError: () => setError("") };
}
