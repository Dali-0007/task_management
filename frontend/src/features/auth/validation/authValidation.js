
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email.trim());
}

export function validateSignIn(formData) {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!formData.password) {
    errors.password = "Password is required.";
  }

  return errors;
}