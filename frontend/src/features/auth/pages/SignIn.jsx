
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
import useSignIn from "../hooks/useSignIn";
import "./SignIn.css";

function SignIn() {
  const {
    formData,
    showPassword,
    setShowPassword,
    error,
    successMessage,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useSignIn();

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your workspace"
    >
      <form className="sign-in-form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        {successMessage && (
          <Alert severity="success">{successMessage}</Alert>
        )}

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
          autoComplete="current-password"
          placeholder="Enter your password"
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

        <Button
          className="auth-submit-button"
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        <Typography className="auth-prompt">
          Don't have an account?{" "}
          <MuiLink component={RouterLink} to="/sign-up" underline="hover">
            Create an account
          </MuiLink>
        </Typography>
      </form>
    </AuthLayout>
  );
}

export default SignIn;
