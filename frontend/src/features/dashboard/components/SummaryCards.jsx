import {
  AssignmentOutlined,
  Autorenew,
  CheckCircle,
  FolderOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

function buildCards({ projects, summary, role }) {
  if (role === "PROJECT_MANAGER") {
    return [
      {
        label: "Total Projects",
        value: projects.length,
        detail: "Projects you belong to",
        icon: FolderOutlined,
        tone: "indigo",
      },
      {
        label: "Active Projects",
        value: projects.filter((project) => project.status === "ACTIVE").length,
        detail: "Currently underway",
        icon: Autorenew,
        tone: "blue",
      },
      {
        label: "Total Tasks",
        value: summary?.tasks.total,
        detail: "Across your projects",
        icon: AssignmentOutlined,
        tone: "green",
      },
      {
        label: "Overdue Tasks",
        value: summary?.tasks.overdue,
        detail: "Need team attention",
        icon: WarningAmberOutlined,
        tone: "orange",
      },
    ];
  }

  const mine = summary?.myTasks;

  return [
    {
      label: "My Open Tasks",
      value: mine && mine.total - mine.completed,
      detail: "Assigned to you",
      icon: AssignmentOutlined,
      tone: "indigo",
    },
    {
      label: "In Progress",
      value: mine?.in_progress,
      detail: "Currently working",
      icon: Autorenew,
      tone: "blue",
    },
    {
      label: "Completed",
      value: mine?.completed,
      detail: "Tasks finished",
      icon: CheckCircle,
      tone: "green",
    },
    {
      label: "Overdue",
      value: mine?.overdue,
      detail: "Need your attention",
      icon: WarningAmberOutlined,
      tone: "orange",
    },
  ];
}

function SummaryCards({ projects, summary, role, isLoading }) {
  const cards = buildCards({ projects, summary, role });

  return (
    <section className="summary-grid" aria-label="Dashboard summary" aria-busy={isLoading}>
      {cards.map(({ label, value, detail, icon: Icon, tone }) => (
        <article className="summary-card" key={label}>
          <div className="summary-card-top">
            <span>{label}</span>
            <div className={`summary-icon summary-icon-${tone}`}>
              <Icon fontSize="small" />
            </div>
          </div>
          <div className="summary-value">{isLoading || value === undefined ? "—" : value}</div>
          <p className="summary-detail">{detail}</p>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
