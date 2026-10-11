
import { useState } from "react";
import { validateSignIn } from "../validation/authValidation";

function useSignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  }


function handleSubmit(event) {
  event.preventDefault();

  const validationErrors = validateSignIn(formData);

  if (Object.keys(validationErrors).length > 0) {
    setError(Object.values(validationErrors)[0]);
    return;
  }

  setError("");
  console.log("Sign-in form validation successful.");
}

  return {
    formData,
    showPassword,
    setShowPassword,
    error,
    handleChange,
    handleSubmit,
  };
}

export default useSignIn;
