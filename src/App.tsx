import React from 'react';
import HeroBanner from './HeroBanner';
import EventSchedule from './EventSchedule';

const App: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Figure Prototype</h1>
      <HeroBanner />
      <EventSchedule />
    </div>
  );
};

export default App;
