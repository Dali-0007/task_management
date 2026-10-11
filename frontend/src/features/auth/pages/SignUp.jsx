
import {
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AuthLayout from "../components/AuthLayout";
import useSignUp from "../hooks/useSignUp";
import "./SignUp.css";

function SignUp() {
  const {
    formData,
    showPassword,
    setShowPassword,
    error,
    successMessage,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useSignUp();

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register to get started"
    >
      <form className="sign-up-form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {error && ( <Alert severity="error"> {error}</Alert>)}
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="name"
        />

        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="email"
        />

        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="new-password"
        />

      <Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Creating account..." : "Sign Up"}
</Button>

        <p className="sign-in-prompt">
          Already have an account?{" "}
          <a href="/sign-in">Sign in</a>
        </p>
        
      </form>
    </AuthLayout>
  );
}

export default SignUp;
