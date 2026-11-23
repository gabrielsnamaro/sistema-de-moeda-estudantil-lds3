export function CatalogSkeleton({ count = 6 }) {
  return (
    <div className="vantagens-grid" aria-busy="true" aria-label="Carregando catálogo">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="vantagem-card" style={{ padding: 0 }}>
          <div className="skeleton" style={{ height: 174, borderRadius: 0 }} />
          <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
            <div className="skeleton" style={{ height: 18, width: '78%' }} />
            <div className="skeleton" style={{ height: 14, width: '100%' }} />
            <div className="skeleton" style={{ height: 14, width: '65%' }} />
            <div className="skeleton" style={{ height: 34, width: '100%', marginTop: '0.5rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="tx-list" aria-busy="true" aria-label="Carregando lista">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="tx-row">
          <div className="tx-left" style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 11 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton" style={{ height: 14, width: '36%' }} />
              <div className="skeleton" style={{ height: 12, width: '64%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 20, width: 62 }} />
        </div>
      ))}
    </div>
  );
}
