
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          backgroundColor: '#0f172a', 
          color: '#f8fafc', 
          minHeight: '100vh', 
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '32px', 
            borderRadius: '24px', 
            maxWidth: '600px', 
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #334155'
          }}>
            <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              Oops! Algo deu errado.
            </h1>
            <p style={{ margin: '0 0 24px 0', color: '#94a3b8', lineHeight: '1.6' }}>
              O Finexus encontrou um erro inesperado. Isso pode ser causado por dados corrompidos no seu navegador ou uma falha no sistema.
            </p>
            
            <div style={{ 
              backgroundColor: '#020617', 
              padding: '16px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              color: '#94a3b8', 
              overflow: 'auto',
              marginBottom: '24px',
              maxHeight: '200px',
              border: '1px solid #0f172a'
            }}>
              <code>{this.state.error?.toString()}</code>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  flex: 1,
                  padding: '12px 24px', 
                  backgroundColor: '#6366f1', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Recarregar Página
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ 
                  flex: 1,
                  padding: '12px 24px', 
                  backgroundColor: '#475569', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Resetar Dados Locais
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
