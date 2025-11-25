'use client';

import { useState } from 'react';
import {
    Building2, User, DollarSign, Calendar, Mail, Phone,
    X, Clock, MessageSquare, Paperclip, TrendingUp
} from 'lucide-react';
import styles from './DealDetailsModal.module.css';

export default function DealDetailsModal({ deal, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('details');
    const [notes, setNotes] = useState([
        { id: 1, text: 'Initial contact made', date: '2025-11-20', user: 'Ahmed' },
        { id: 2, text: 'Sent proposal', date: '2025-11-21', user: 'Sarah' },
    ]);
    const [newNote, setNewNote] = useState('');

    const activities = [
        { id: 1, type: 'created', description: 'Deal created', date: '2025-11-18 10:30', user: 'Ahmed' },
        { id: 2, type: 'moved', description: 'Moved to Quotes', date: '2025-11-19 14:20', user: 'Sarah' },
        { id: 3, type: 'note', description: 'Added note', date: '2025-11-20 09:15', user: 'Ahmed' },
    ];

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const note = {
            id: notes.length + 1,
            text: newNote,
            date: new Date().toISOString().split('T')[0],
            user: 'Current User'
        };

        setNotes([...notes, note]);
        setNewNote('');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <Building2 size={24} />
                        <div>
                            <h2 className={styles.title}>{deal.company}</h2>
                            <p className={styles.subtitle}>{formatCurrency(deal.value)}</p>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'activity' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes ({notes.length})
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'details' && (
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <User size={18} />
                                <div>
                                    <label>Contact Person</label>
                                    <p>{deal.contact}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <Mail size={18} />
                                <div>
                                    <label>Email</label>
                                    <p>{deal.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <Phone size={18} />
                                <div>
                                    <label>Phone</label>
                                    <p>{deal.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <Calendar size={18} />
                                <div>
                                    <label>Created Date</label>
                                    <p>{deal.date}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <TrendingUp size={18} />
                                <div>
                                    <label>Priority</label>
                                    <p className={styles[`priority${deal.priority}`]}>{deal.priority}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className={styles.activityList}>
                            {activities.map(activity => (
                                <div key={activity.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>
                                        <Clock size={16} />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <p className={styles.activityDescription}>{activity.description}</p>
                                        <p className={styles.activityMeta}>
                                            {activity.user} • {activity.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className={styles.notesSection}>
                            <div className={styles.notesList}>
                                {notes.map(note => (
                                    <div key={note.id} className={styles.noteItem}>
                                        <div className={styles.noteHeader}>
                                            <MessageSquare size={16} />
                                            <span className={styles.noteUser}>{note.user}</span>
                                            <span className={styles.noteDate}>{note.date}</span>
                                        </div>
                                        <p className={styles.noteText}>{note.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.addNote}>
                                <textarea
                                    className={styles.noteInput}
                                    placeholder="Add a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    rows={3}
                                />
                                <button
                                    className={styles.addNoteButton}
                                    onClick={handleAddNote}
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
