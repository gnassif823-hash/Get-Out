import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Calendar, MapPin, Users, Bell, Plus } from 'lucide-react';
import './Events.css';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, 'events'),
            orderBy('event_date', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                event_date: doc.data().event_date?.toDate?.() || new Date(doc.data().event_date) // Handle Firestore TS or ISO string
            }));
            setEvents(eventsData);
        });

        return () => unsubscribe();
    }, []);

    const handleJoin = async (eventId, currentStatus) => {
        if (!user) return;

        const event = events.find(e => e.id === eventId);
        if (!event) return;

        let participants = event.participants || [];

        if (currentStatus === 'going') {
            // Leave
            participants = participants.filter(p => p.user_id !== (user.id || user.uid));
        } else {
            // Join
            // Remove if exists first (clean slate) then add
            participants = participants.filter(p => p.user_id !== (user.id || user.uid));
            participants.push({
                user_id: user.id || user.uid,
                status: 'going'
            });
        }

        try {
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, { participants });
        } catch (error) {
            console.error('Error updating participants:', error);
        }
    };

    const handleCreateEvent = async () => {
        if (!user) return;
        const title = prompt('Event Title:');
        const location = prompt('Location:');
        const dateStr = prompt('Date (YYYY-MM-DD HH:MM):');

        if (title && location && dateStr) {
            try {
                await addDoc(collection(db, 'events'), {
                    title,
                    location,
                    event_date: new Date(dateStr).toISOString(),
                    created_by: user.id || user.uid,
                    created_by_name: user.username || 'Anonymous',
                    participants: [],
                    created_at: serverTimestamp()
                });
            } catch (error) {
                console.error('Error creating event:', error);
                alert('Could not create event');
            }
        }
    };

    return (
        <div className="page-container events-page">
            <header className="page-header">
                <h1>Events Tracker</h1>
                <button className="create-event-btn" onClick={handleCreateEvent}>
                    <Plus size={18} /> New Event
                </button>
            </header>

            <div className="events-list">
                {events.length === 0 ? (
                    <p className="no-events">No upcoming events. Plan one?</p>
                ) : (
                    events.map(event => {
                        const myId = user?.id || user?.uid;
                        const participants = event.participants || [];
                        const isGoing = participants.some(p => p.user_id === myId && p.status === 'going');
                        const attendeesCount = participants.filter(p => p.status === 'going').length;

                        return (
                            <div key={event.id} className="event-card glass-panel">
                                <div className="event-date">
                                    <Calendar size={24} />
                                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                                    <span className="event-time">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="event-content">
                                    <h2>{event.title}</h2>
                                    <div className="event-meta">
                                        <div className="meta-item">
                                            <MapPin size={16} /> {event.location}
                                        </div>
                                        <div className="meta-item">
                                            <Users size={16} /> {attendeesCount} Going
                                        </div>
                                    </div>
                                    <div className="created-by">
                                        Hosted by {event.created_by_name || 'Unknown'}
                                    </div>
                                </div>

                                <div className="event-actions">
                                    <button
                                        className={`join-btn ${isGoing ? 'joined' : ''}`}
                                        onClick={() => handleJoin(event.id, isGoing ? 'going' : null)}
                                    >
                                        {isGoing ? 'Going' : 'Join'}
                                    </button>
                                    <button className="notify-btn" title="Remind me">
                                        <Bell size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Events;
