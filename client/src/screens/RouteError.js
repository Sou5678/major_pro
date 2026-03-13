import React from 'react';
import { useRouteError } from 'react-router-dom';

export default function RouteError() {
  const err = useRouteError();
  const message = err?.message || 'Something went wrong.';

  return (
    <div className="page">
      <div className="card">
        <div style={{ fontSize: 18, fontWeight: 900 }}>Something went wrong</div>
        <div className="muted" style={{ marginTop: 8 }}>{message}</div>
      </div>
    </div>
  );
}
