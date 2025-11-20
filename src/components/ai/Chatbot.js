'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'مرحباً! 👋 أنا المساعد الذكي لنظام ERP.\n\nيمكنني مساعدتك في:\n• الاستعلام عن المبيعات والفواتير\n• معلومات العملاء والموردين\n• بيانات الموظفين والرواتب\n• تحليل المصروفات\n• إحصائيات عامة\n\nكيف يمكنني مساعدتك اليوم؟'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    conversationHistory: messages
                })
            });

            const data = await response.json();

            if (data.message) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message,
                    isError: data.isError
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'عذراً، حدث خطأ في الاتصال. تأكد من أن الخادم يعمل وحاول مرة أخرى.',
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟'
            }
        ]);
    };

    const quickQuestions = [
        'كم إجمالي المبيعات؟',
        'ما هي الفواتير المعلقة؟',
        'من هم أفضل العملاء؟',
        'كم عدد الموظفين؟'
    ];

    const handleQuickQuestion = (question) => {
        setInput(question);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Assistant"
                title="المساعد الذكي"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerContent}>
                            <h3>🤖 المساعد الذكي</h3>
                            <span className={styles.status}>
                                {loading ? '⏳ يكتب...' : '🟢 متصل'}
                            </span>
                        </div>
                        <div className={styles.headerActions}>
                            <button
                                onClick={clearChat}
                                className={styles.clearButton}
                                title="مسح المحادثة"
                            >
                                🗑️
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.message} ${styles[msg.role]} ${msg.isError ? styles.error : ''}`}
                            >
                                <div className={styles.messageContent}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < msg.content.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.messageTime}>
                                    {new Date().toLocaleTimeString('ar-EG', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.typing}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 2 && !loading && (
                        <div className={styles.quickQuestions}>
                            <p className={styles.quickTitle}>أسئلة سريعة:</p>
                            <div className={styles.quickButtons}>
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuestion(q)}
                                        className={styles.quickButton}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="اسأل عن المبيعات، الفواتير، الموظفين..."
                            disabled={loading}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className={styles.sendButton}
                            title="إرسال"
                        >
                            {loading ? '⏳' : '📤'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
