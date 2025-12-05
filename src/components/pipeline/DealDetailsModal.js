'use client';

import { useState } from 'react';
import {
    Building2, User, DollarSign, Calendar, Mail, Phone,
    X, Clock, MessageSquare, Paperclip, TrendingUp
} from 'lucide-react';
import styles from './DealDetailsModal.module.css';
import DealTimeline from './DealTimeline';

export default function DealDetailsModal({ deal, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('details');
    const [notes, setNotes] = useState([
        { id: 1, text: 'Initial contact made', date: '2025-11-20', user: 'Ahmed' },
        { id: 2, text: 'Sent proposal', date: '2025-11-21', user: 'Sarah' },
    ]);
    const [newNote, setNewNote] = useState('');

    const [stageHistory, setStageHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch history when activity tab is active
    useEffect(() => {
        if (activeTab === 'activity' && deal.id) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const res = await fetch(`/api/pipeline/${deal.id}/history`);
                    if (res.ok) {
                        const data = await res.json();
                        setStageHistory(data);
                    }
                } catch (error) {
                    console.error('Error fetching history:', error);
                } finally {
                    setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [activeTab, deal.id]);

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
                    <button
                        className={styles.actionButton}
                        onClick={() => window.location.href = `/rfq/create?opportunityId=${deal.id}`}
                        title="Create RFQ from this opportunity"
                    >
                        Create RFQ
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
                            {loadingHistory ? (
                                <div className="p-4 text-center text-slate-400">Loading history...</div>
                            ) : (
                                <DealTimeline history={stageHistory} />
                            )}
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
