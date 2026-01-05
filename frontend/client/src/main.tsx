import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Ignore browser extension errors
  if (event.reason?.message?.includes('message channel closed') || 
      event.reason?.message?.includes('Host is not') ||
      event.reason?.stack?.includes('content.js')) {
    event.preventDefault();
    return;
  }
  // Log other errors for debugging
  console.error('Unhandled promise rejection:', event.reason);
});

// Global error handler for general errors
window.addEventListener('error', (event) => {
  // Ignore browser extension errors
  if (event.filename?.includes('content.js') || 
      event.message?.includes('message channel closed') ||
      event.message?.includes('Host is not')) {
    event.preventDefault();
    return;
  }
  // Log other errors for debugging
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
