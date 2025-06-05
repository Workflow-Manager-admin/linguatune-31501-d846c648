import React from 'react';
import './App.css';
import LinguaTuneContainer from './LinguaTuneContainer';

// PUBLIC_INTERFACE
function App() {
  // The main app now renders the LinguaTuneContainer as the primary content.
  return (
    <div className="app">
      <LinguaTuneContainer />
    </div>
  );
}

export default App;