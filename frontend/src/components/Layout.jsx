import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: '#1a73e8',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Engineering Platform</h1>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'white' }}>Dashboard</Link>
          <Link to="/projects" style={{ color: 'white' }}>Projects</Link>
          <Link to="/calculations" style={{ color: 'white' }}>Calculations</Link>
          <Link to="/documents" style={{ color: 'white' }}>Documents</Link>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem',
          color: '#666',
          fontSize: '0.875rem',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        Engineering Platform v1.0.0
      </footer>
    </div>
  );
}

export default Layout;
