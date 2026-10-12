
import {
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import useSignUp from "../hooks/useSignUp";
import "../components/AuthForm.css";

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
      subtitle="Join your team and organize your work"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        {successMessage && (
          <Alert severity="success">{successMessage}</Alert>
        )}

        <TextField
          className="auth-field"
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="name"
          placeholder="Enter your full name"
        />

        <TextField
          className="auth-field"
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="email"
          placeholder="you@company.com"
        />

        <TextField
          className="auth-field"
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="new-password"
          placeholder="Create a password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
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
          className="auth-field"
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        <Button
          className="auth-submit-button"
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <Typography className="auth-prompt">
          Already have an account?{" "}
          <MuiLink component={RouterLink} to="/sign-in" underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      </form>
    </AuthLayout>
  );
}

export default SignUp;
