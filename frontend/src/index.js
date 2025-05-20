import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  // Import your App component
import { BrowserRouter as Router } from 'react-router-dom';  // Import Router from react-router-dom
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>  {/* Wrap the App with Router for routing functionality */}
      <App />  {/* Your main App component */}
    </Router>
  </React.StrictMode>
);

// Optionally log performance
reportWebVitals();
