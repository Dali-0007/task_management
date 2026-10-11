
import {
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
          <Alert severity="success">
            {successMessage}
          </Alert>
        )}
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
          autoComplete="current-password"
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        <Typography className="sign-up-prompt">
          Don't have an account?{" "}
          <Link href="/sign-up" underline="hover">
            Create an account
          </Link>
        </Typography>
      </form>
    </AuthLayout>
  );
}

export default SignIn;
