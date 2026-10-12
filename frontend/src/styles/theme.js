import { createTheme } from "@mui/material/styles";

// Shared design tokens for JS/MUI styling.
// Keep these values in sync with the CSS variables in src/styles/index.css.
export const tokens = {
  color: {
    primary: "#4f46e5",
    primaryDark: "#4338ca",
    primaryDarker: "#3730a3",
    primaryLight: "#6366f1",
    primarySoft: "#eef0ff",
    primarySofter: "#f5f6ff",
    primaryBorder: "#c7d2fe",
    text: "#172033",
    textStrong: "#202b40",
    textBody: "#5b667a",
    textMuted: "#7e899d",
    textSubtle: "#98a1b1",
    bg: "#f5f7fb",
    surface: "#ffffff",
    border: "#e8edf5",
    borderLight: "#f0f2f7",
    hover: "#f1f3f9",
    success: "#169b61",
    successSoft: "#e5f8ef",
    successText: "#24834f",
    danger: "#dc2626",
    dangerSoft: "#fdecec",
  },
  gradient: {
    primary: "linear-gradient(135deg, #4f46e5, #3730a3)",
    primaryHover: "linear-gradient(135deg, #4338ca, #312e81)",
  },
  radius: { sm: 6, md: 9, lg: 12, xl: 16 },
  shadow: {
    card: "0 1px 2px rgba(23, 32, 51, 0.04), 0 4px 14px rgba(23, 32, 51, 0.04)",
    cardHover: "0 8px 24px rgba(23, 32, 51, 0.08)",
    primary: "0 5px 12px rgba(67, 56, 202, 0.19)",
    primaryHover: "0 6px 14px rgba(67, 56, 202, 0.27)",
    focus: "0 0 0 3px rgba(67, 56, 202, 0.12)",
  },
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
};

const { color, radius, shadow } = tokens;

const theme = createTheme({
  palette: {
    primary: {
      main: color.primary,
      dark: color.primaryDarker,
      light: color.primaryLight,
      contrastText: "#ffffff",
    },
    success: { main: color.success },
    error: { main: color.danger },
    text: {
      primary: color.text,
      secondary: color.textMuted,
    },
    background: {
      default: color.bg,
      paper: color.surface,
    },
    divider: color.border,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily: tokens.fontFamily,
    h4: { fontSize: "1.75rem", fontWeight: 750, letterSpacing: "-0.03em" },
    h5: { fontSize: "1.5rem", fontWeight: 750, letterSpacing: "-0.02em" },
    h6: { fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8125rem" },
    caption: { fontSize: "0.75rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          fontWeight: 600,
          whiteSpace: "nowrap",
        },
        containedPrimary: {
          background: tokens.gradient.primary,
          boxShadow: shadow.primary,
          "&:hover": {
            background: tokens.gradient.primaryHover,
            boxShadow: shadow.primaryHover,
          },
          "&.Mui-disabled": {
            background: color.primaryBorder,
            color: "#ffffff",
            boxShadow: "none",
          },
        },
        outlinedPrimary: {
          borderColor: color.primaryBorder,
          backgroundColor: color.surface,
          color: color.primaryDark,
          "&:hover": {
            borderColor: color.primary,
            backgroundColor: color.primarySofter,
          },
        },
        textPrimary: {
          color: color.primaryDark,
          "&:hover": { backgroundColor: color.primarySofter },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: color.border,
          borderRadius: radius.lg,
          boxShadow: shadow.card,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md + 1,
          backgroundColor: color.surface,
          transition: "box-shadow 160ms ease",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dbe2ee" },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#a5b4fc",
          },
          "&.Mui-focused": { boxShadow: shadow.focus },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: color.primaryDark,
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.sm, fontWeight: 600, fontSize: "0.72rem" },
        colorSuccess: {
          backgroundColor: color.successSoft,
          color: color.successText,
        },
        colorDefault: {
          backgroundColor: color.hover,
          color: color.textMuted,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius.xl,
          boxShadow: "0 24px 60px rgba(23, 32, 51, 0.18)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1.125rem", fontWeight: 700, paddingTop: 22 },
      },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: "12px 24px 20px", gap: 4 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: radius.md + 1 } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: "0.875rem" } },
    },
    MuiLink: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;
