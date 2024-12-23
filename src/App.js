import React from 'react';
import './App.css';
import HeroBanner from './components/HeroBanner';

function App() {
  const images = [
    'https://placecats.com/1200/400?image=1',
    'https://placecats.com/1200/400?image=2',
    'https://placecats.com/1200/400?image=3',
    'https://placecats.com/1200/400?image=4',
  ];

  return (
    <div className="App">
      <HeroBanner images={images} interval={5000} />
    </div>
  );
}

export default App;