// Communication Panel Component
// Multi-channel messaging (Email, SMS, WhatsApp)

import { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import styles from './CommunicationPanel.module.css';

export default function CommunicationPanel({ customerId, customerEmail, customerPhone }) {
    const [channel, setChannel] = useState('email');
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const response = await fetch('/api/communication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send_message',
                    data: {
                        channel,
                        to: channel === 'email' ? customerEmail : customerPhone,
                        subject: channel === 'email' ? subject : undefined,
                        message,
                        customerId
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                setMessage('');
                setSubject('');
                alert('Message sent successfully!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <MessageSquare size={20} />
                <h3>Send Message</h3>
            </div>

            <div className={styles.channelSelector}>
                <button
                    className={channel === 'email' ? styles.active : ''}
                    onClick={() => setChannel('email')}
                >
                    <Mail size={16} />
                    Email
                </button>
                <button
                    className={channel === 'sms' ? styles.active : ''}
                    onClick={() => setChannel('sms')}
                >
                    <MessageSquare size={16} />
                    SMS
                </button>
                <button
                    className={channel === 'whatsapp' ? styles.active : ''}
                    onClick={() => setChannel('whatsapp')}
                >
                    <MessageSquare size={16} />
                    WhatsApp
                </button>
            </div>

            <div className={styles.form}>
                {channel === 'email' && (
                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={styles.input}
                    />
                )}

                <textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.textarea}
                    rows={6}
                />

                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={sending || !message}
                >
                    <Send size={16} />
                    {sending ? 'Sending...' : 'Send Message'}
                </button>
            </div>
        </div>
    );
}
