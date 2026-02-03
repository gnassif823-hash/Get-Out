import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, Users, Bell, Plus } from 'lucide-react';
import './Events.css';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        // Fetch events and their participants
        const { data: eventsData, error } = await supabase
            .from('events')
            .select(`
        *,
        created_by_profile:created_by (name),
        event_participants (user_id, status)
      `)
            .order('event_date', { ascending: true });

        if (error) console.error('Error fetching events:', error);
        else setEvents(eventsData);
    };

    useEffect(() => {
        fetchEvents();

        const eventsChannel = supabase
            .channel('public:events')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
            .subscribe();

        const participantsChannel = supabase
            .channel('public:event_participants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, fetchEvents)
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(participantsChannel);
        };
    }, []);

    const handleJoin = async (eventId, currentStatus) => {
        if (!user) return;

        if (currentStatus === 'going') {
            // Leave
            await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', user.id);
        } else {
            // Join
            await supabase
                .from('event_participants')
                .upsert({ event_id: eventId, user_id: user.id, status: 'going' });
        }
    };

    const handleCreateEvent = async () => {
        if (!user) return;
        const title = prompt('Event Title:');
        const location = prompt('Location:');
        const dateStr = prompt('Date (YYYY-MM-DD HH:MM):'); // Simple prompt for prototype

        if (title && location && dateStr) {
            await supabase.from('events').insert([{
                title,
                location,
                event_date: new Date(dateStr).toISOString(),
                created_by: user.id
            }]);
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
                {events.map(event => {
                    const isGoing = event.event_participants.some(p => p.user_id === user?.id && p.status === 'going');
                    const attendeesCount = event.event_participants.filter(p => p.status === 'going').length;

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
                                    Hosted by {event.created_by_profile?.name || 'Unknown'}
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
                })}
                {events.length === 0 && <p className="no-events">No upcoming events.</p>}
            </div>
        </div>
    );
};

export default Events;
