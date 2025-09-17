import { Provider } from 'urql'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { graphqlClient } from './lib/graphqlClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider value={graphqlClient}>
      <App />
    </Provider>
  </StrictMode>,
)
