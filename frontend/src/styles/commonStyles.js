import { tokens } from "./theme";

const { color, radius, shadow } = tokens;

// Reusable `sx` presets for MUI-based pages.

export const pageHeaderSx = {
  mb: 3,
  gap: 2,
};

export const eyebrowSx = {
  mb: 1,
  color: color.primaryLight,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export const pageTitleSx = {
  color: color.text,
  fontSize: { xs: 24, md: 28 },
  fontWeight: 750,
  letterSpacing: "-0.03em",
  lineHeight: 1.25,
};

export const pageSubtitleSx = {
  mt: 0.75,
  color: color.textMuted,
  fontSize: 14,
};

export const headerButtonSx = {
  height: 40,
  px: 2,
  flex: { xs: 1, sm: "0 0 auto" },
};

export const statCardSx = {
  flex: 1,
  p: 2.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
};

export const statLabelSx = {
  color: color.textMuted,
  fontSize: 13,
  fontWeight: 500,
};

export const statValueSx = {
  mt: 0.5,
  color: color.text,
  fontSize: 28,
  fontWeight: 750,
  letterSpacing: "-0.03em",
  lineHeight: 1.2,
};

const statIconBase = {
  display: "grid",
  placeItems: "center",
  width: 42,
  height: 42,
  flexShrink: 0,
  borderRadius: `${radius.md + 1}px`,
};

export const statIconSx = {
  indigo: { ...statIconBase, bgcolor: color.primarySoft, color: color.primary },
  green: { ...statIconBase, bgcolor: color.successSoft, color: color.success },
  gray: { ...statIconBase, bgcolor: color.hover, color: color.textMuted },
};

export const cardSx = {
  p: 2.5,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  transition: "box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease",
  "&:hover": {
    borderColor: color.primaryBorder,
    boxShadow: shadow.cardHover,
    transform: "translateY(-2px)",
  },
};

export const cardTitleSx = {
  color: color.textStrong,
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

export const cardMetaSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  color: color.textMuted,
  fontSize: 13,
  "& svg": { fontSize: 17, color: color.textSubtle },
};

export const cardActionsSx = {
  mt: "auto",
  pt: 1.5,
  borderTop: `1px solid ${color.borderLight}`,
  flexWrap: "wrap",
  gap: 0.5,
};

export const emptyStateSx = {
  p: { xs: 4, md: 6 },
  textAlign: "center",
  borderStyle: "dashed",
  boxShadow: "none",
};

export const detailRowSx = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  py: 1.25,
  borderBottom: `1px solid ${color.borderLight}`,
  fontSize: 14,
  "&:last-of-type": { borderBottom: 0 },
  "& > span:first-of-type": { color: color.textMuted },
  "& > span:last-of-type": {
    color: color.textStrong,
    fontWeight: 600,
    textAlign: "right",
  },
};

export const filterFieldSx = {
  minWidth: 200,
};
