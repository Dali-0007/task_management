
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-layout">
      <section className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>

        <div className="auth-content">{children}</div>
      </section>
    </main>
  );
}

export default AuthLayout;