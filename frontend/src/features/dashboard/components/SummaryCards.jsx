import {
  Autorenew,
  FolderOutlined,
  Inventory2Outlined,
  PersonOutlined,
} from "@mui/icons-material";

function buildCards(projects, role, userId) {
  const count = (predicate) => projects.filter(predicate).length;

  const cards = [
    {
      label: "Total Projects",
      value: projects.length,
      detail: "Projects you belong to",
      icon: FolderOutlined,
      tone: "indigo",
    },
    {
      label: "Active Projects",
      value: count((project) => project.status === "ACTIVE"),
      detail: "Currently underway",
      icon: Autorenew,
      tone: "blue",
    },
    {
      label: "Archived Projects",
      value: count((project) => project.status === "ARCHIVED"),
      detail: "No longer editable",
      icon: Inventory2Outlined,
      tone: "orange",
    },
  ];

  if (role === "PROJECT_MANAGER") {
    cards.push({
      label: "Created by You",
      value: count((project) => String(project.created_by) === String(userId)),
      detail: "Projects you started",
      icon: PersonOutlined,
      tone: "green",
    });
  }

  return cards;
}

function SummaryCards({ projects, role, userId, isLoading }) {
  const cards = buildCards(projects, role, userId);

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
          <div className="summary-value">{isLoading ? "—" : value}</div>
          <p className="summary-detail">{detail}</p>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
