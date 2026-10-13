import { tokens } from "../../../styles/theme";

const { color } = tokens;

export const taskRowSx = {
  width: "100%",
  p: 2,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  textAlign: "left",
  borderRadius: 0,
  borderBottom: `1px solid ${color.borderLight}`,
  "&:hover": { bgcolor: color.primarySofter },
  "&.Mui-focusVisible": { bgcolor: color.primarySoft },
};

export const taskRowMainSx = {
  minWidth: 0,
  flex: "1 1 260px",
};

export const taskTitleSx = {
  color: color.textStrong,
  fontSize: 14,
  fontWeight: 650,
  overflowWrap: "anywhere",
};

export const taskMetaSx = {
  mt: 0.5,
  color: color.textMuted,
  fontSize: 12,
};

export const taskRowSideSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 1,
};

export const dueDateSx = {
  minWidth: 104,
  color: color.textBody,
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
};

export const overdueSx = {
  ...dueDateSx,
  color: color.danger,
  fontWeight: 600,
};

export const filterBarSx = {
  mb: 2.5,
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "minmax(220px, 2fr) repeat(4, minmax(0, 1fr))",
  },
};

export const commentSx = {
  py: 1.5,
  borderBottom: `1px solid ${color.borderLight}`,
  "&:last-of-type": { borderBottom: 0 },
};
