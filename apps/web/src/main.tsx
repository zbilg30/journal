import { Provider } from 'urql'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { graphqlClient } from './lib/graphqlClient'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider value={graphqlClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
