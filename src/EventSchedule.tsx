import React from 'react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Morning Yoga',
    date: 'Monday, June 5',
    time: '7:00 AM - 8:00 AM',
    description: 'Start your day with energizing yoga poses and meditation',
  },
  {
    id: 2,
    title: 'Team Building Workshop',
    date: 'Tuesday, June 6',
    time: '2:00 PM - 4:00 PM',
    description:
      'Interactive session focusing on communication and collaboration',
  },
  {
    id: 3,
    title: 'Tech Talk: AI Future',
    date: 'Wednesday, June 7',
    time: '3:00 PM - 4:30 PM',
    description:
      'Discussion about artificial intelligence and its impact on society',
  },
];

const EventSchedule: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#333',
        }}
      >
        Upcoming Events
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '20px',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              // ':hover': {
              //   transform: 'translateY(-5px)'
              // }
            }}
          >
            <h3
              style={{
                color: '#2c3e50',
                marginBottom: '10px',
              }}
            >
              {event.title}
            </h3>
            <p
              style={{
                color: '#7f8c8d',
                fontSize: '0.9em',
                marginBottom: '5px',
              }}
            >
              {event.date}
            </p>
            <p
              style={{
                color: '#7f8c8d',
                fontSize: '0.9em',
                marginBottom: '15px',
              }}
            >
              {event.time}
            </p>
            <p
              style={{
                color: '#34495e',
                fontSize: '0.95em',
                lineHeight: '1.5',
              }}
            >
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSchedule;
