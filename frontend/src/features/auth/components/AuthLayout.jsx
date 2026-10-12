
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">ADN</div>
          <div className="auth-brand-name">ADN TECH</div>
          <p className="auth-brand-caption">
            Task &amp; Project Management
          </p>
        </div>

        <header className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>

        <div className="auth-content">{children}</div>

        <footer className="auth-footer">
          Built with care by ADN TECH
        </footer>
      </section>
    </main>
  );
}

export default AuthLayout;
