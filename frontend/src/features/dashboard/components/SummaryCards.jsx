
import {
  AssignmentOutlined,
  Autorenew,
  CheckCircle,
  WarningAmberOutlined,
  FolderOutlined,
} from "@mui/icons-material";

const cardDefinitions = {
  TEAM_MEMBER: [
    { label: "My Tasks", value: "12", detail: "Assigned to you", icon: AssignmentOutlined, tone: "indigo" },
    { label: "In Progress", value: "05", detail: "Currently working", icon: Autorenew, tone: "blue" },
    { label: "Completed", value: "18", detail: "Tasks finished", icon: CheckCircle, tone: "green" },
    { label: "Overdue", value: "02", detail: "Need your attention", icon: WarningAmberOutlined, tone: "orange" },
  ],
  PROJECT_MANAGER: [
    { label: "Total Projects", value: "08", detail: "Across your workspace", icon: FolderOutlined, tone: "indigo" },
    { label: "Active Projects", value: "06", detail: "Currently underway", icon: Autorenew, tone: "blue" },
    { label: "Total Tasks", value: "64", detail: "Across all projects", icon: AssignmentOutlined, tone: "green" },
    { label: "Overdue Tasks", value: "07", detail: "Need team attention", icon: WarningAmberOutlined, tone: "orange" },
  ],
};

function SummaryCards({ role }) {
  const cards = cardDefinitions[role] ?? cardDefinitions.TEAM_MEMBER;

  return (
    <section className="summary-grid" aria-label="Dashboard summary">
      {cards.map(({ label, value, detail, icon: Icon, tone }) => (
        <article className="summary-card" key={label}>
          <div className="summary-card-top">
            <span>{label}</span>
            <div className={`summary-icon summary-icon-${tone}`}>
              <Icon fontSize="small" />
            </div>
          </div>
          <div className="summary-value">{value}</div>
          <p className="summary-detail">{detail}</p>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
