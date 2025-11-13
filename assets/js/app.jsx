const highlights = [
  { title: 'Proyección mensual', value: '$84.5K', description: 'Ingresos proyectados a partir de la ocupación actual.' },
  { title: 'Tasa de ocupación', value: '92%', description: 'Eventos con boletería vendida sobre el total disponible.' },
  { title: 'Vendedores activos', value: '18', description: 'Colaboradores con sesiones vigentes en la plataforma.' }
];

const featureSections = [
  {
    title: 'Gestión centralizada',
    description: 'Administra eventos, vendedores y lotes de boletos desde un panel elegante y sencillo de navegar.',
    accent: 'Panel unificado',
  },
  {
    title: 'Reportes en tiempo real',
    description: 'Visualiza ventas, reservas y clientes desde cualquier dispositivo con actualizaciones inmediatas.',
    accent: 'Insights instantáneos',
  },
  {
    title: 'Automatización inteligente',
    description: 'Alertas de inventario bajo, confirmaciones por WhatsApp y correos personalizados en segundos.',
    accent: 'Flujos automáticos',
  }
];

const automationSteps = [
  {
    title: 'Configura eventos memorables',
    details: 'Crea rifas, conciertos o festivales con categorías, precios y aforos diferenciados en minutos.'
  },
  {
    title: 'Invita a tu equipo de ventas',
    details: 'Asigna roles, establece metas personalizadas y controla la disponibilidad de forma granular.'
  },
  {
    title: 'Observa el avance en vivo',
    details: 'Un tablero visual muestra reservas confirmadas, pagos pendientes y conversiones por canal.'
  },
  {
    title: 'Entregas y notificaciones perfectas',
    details: 'Envía comprobantes, cupones y recordatorios automáticos en el idioma de tus clientes.'
  }
];

const footerLinks = [
  {
    heading: 'Recursos',
    links: [
      { label: 'Documentación', href: '#' },
      { label: 'Centro de ayuda', href: '#' },
      { label: 'Academia de ventas', href: '#' }
    ]
  },
  {
    heading: 'Comunidad',
    links: [
      { label: 'Historias de éxito', href: '#' },
      { label: 'Eventos y webinars', href: '#' },
      { label: 'Programa de partners', href: '#' }
    ]
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '#' },
      { label: 'Política de privacidad', href: '#' },
      { label: 'Lineamientos de marca', href: '#' }
    ]
  }
];

const Icon = ({ children }) => (
  <span role="img" aria-hidden="true" className="icon">
    {children}
  </span>
);

const AppShell = () => (
  <div className="app-shell">
    <header className="hero">
      <div className="hero-cta">
        <div className="badge">
          <Icon>✨</Icon>
          Plataforma profesional para rifas y eventos
        </div>
        <h1>Gestiona boletería con estilo, control y velocidad</h1>
        <p>
          Diseñamos una experiencia moderna con React para que el seguimiento de tus eventos sea transparente,
          colaborativo y lleno de datos accionables. Cada interacción ha sido optimizada para un flujo más fluido.
        </p>
        <div className="hero-actions">
          <a className="btn-primary" href="#">Explorar demo guiada</a>
          <a className="btn-secondary" href="#">Hablar con un asesor</a>
        </div>
      </div>
      <div className="hero-highlights">
        {highlights.map(({ title, value, description }) => (
          <article key={title} className="highlight-card">
            <span className="highlight-title">{title}</span>
            <span className="highlight-value">{value}</span>
            <span>{description}</span>
          </article>
        ))}
      </div>
    </header>

    <main className="main-content">
      <section className="section">
        <header className="section-header">
          <h2 className="section-title">
            <Icon>🧭</Icon>
            Un diseño hecho para equipos modernos
          </h2>
          <p className="section-subtitle">
            Visualiza lo esencial, desliza entre métricas y toma decisiones con claridad.
          </p>
        </header>
        <div className="card-grid">
          {featureSections.map(({ title, description, accent }) => (
            <article className="info-card" key={title}>
              <span className="badge">{accent}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">
            <Icon>🚀</Icon>
            Un flujo de trabajo sin fricciones
          </h2>
          <p className="section-subtitle">
            Sigue los pasos clave para lanzar tu boletería más atractiva y efectiva.
          </p>
        </header>
        <div className="timeline">
          {automationSteps.map(({ title, details }) => (
            <div className="timeline-step" key={title}>
              <h4>{title}</h4>
              <p>{details}</p>
            </div>
          ))}
        </div>
      </section>
    </main>

    <footer>
      <div className="footer-brand">
        <h2>Boletería React+</h2>
        <p>
          Evolucionamos el proyecto original para ofrecer una interfaz más limpia, responsiva y pensada para equipos en
          crecimiento.
        </p>
      </div>
      <div className="footer-grid">
        {footerLinks.map(({ heading, links }) => (
          <div className="footer-links" key={heading}>
            <strong>{heading}</strong>
            {links.map(({ label, href }) => (
              <a href={href} key={label}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <small>© {new Date().getFullYear()} Boletería React+. Todos los derechos reservados.</small>
    </footer>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppShell />);
