import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { HistoryProvider } from "./context/HistoryContext.jsx"
import App from "./App";
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <HistoryProvider>
              <App />
          </HistoryProvider>
      </BrowserRouter>
  </StrictMode>,
)
