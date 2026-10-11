
import { useState } from "react";
import { signInUser } from "../services/authService";
import { validateSignIn } from "../validation/authValidation";

export default function useSignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccessMessage("");

    const validationErrors = validateSignIn(formData);
    const firstValidationError = Object.values(validationErrors)[0];

    if (firstValidationError) {
      setError(firstValidationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signInUser(formData);

      setSuccessMessage(
        response.message || "Signed in successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    formData,
    showPassword,
    setShowPassword,
    error,
    successMessage,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
