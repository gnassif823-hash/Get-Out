import { useState } from 'react';
import { Calendar, MapPin, Users, Bell } from 'lucide-react';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Friday Night Gaming",
            date: "Friday, 8:00 PM",
            location: "George's Basement",
            attendees: ["George", "Mike", "Sarah"],
            joined: true
        },
        {
            id: 2,
            title: "Sunday Brunch",
            date: "Sunday, 11:00 AM",
            location: "The Grind Cafe",
            attendees: ["Sarah", "Jessica"],
            joined: false
        }
    ]);

    const toggleJoin = (id) => {
        setEvents(events.map(ev =>
            ev.id === id ? { ...ev, joined: !ev.joined } : ev
        ));
    };

    return (
        <div className="page-container events-page">
            <header className="page-header">
                <h1>Events Tracker</h1>
                <button className="create-event-btn">+ New Event</button>
            </header>

            <div className="events-list">
                {events.map(event => (
                    <div key={event.id} className="event-card glass-panel">
                        <div className="event-date">
                            <Calendar size={24} />
                            <span>{event.date}</span>
                        </div>

                        <div className="event-content">
                            <h2>{event.title}</h2>
                            <div className="event-meta">
                                <div className="meta-item">
                                    <MapPin size={16} /> {event.location}
                                </div>
                                <div className="meta-item">
                                    <Users size={16} /> {event.attendees.length} Going
                                </div>
                            </div>
                            <div className="attendees-preview">
                                {event.attendees.map((person, idx) => (
                                    <span key={idx} className="attendee-pill">{person}</span>
                                ))}
                            </div>
                        </div>

                        <div className="event-actions">
                            <button
                                className={`join-btn ${event.joined ? 'joined' : ''}`}
                                onClick={() => toggleJoin(event.id)}
                            >
                                {event.joined ? 'Going' : 'Join'}
                            </button>
                            <button className="notify-btn" title="Remind me">
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;
