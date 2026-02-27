
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, X } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    description?: string;
    type: 'success' | 'info' | 'warning';
}

export function NotificationListener() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('jira-events')
            .on('broadcast', { event: 'toast' }, (payload) => {
                console.log('🔔 Received Realtime Notification:', payload);

                const newToast: Toast = {
                    id: Math.random().toString(36).substring(7),
                    message: payload.payload.message,
                    description: payload.payload.description,
                    type: payload.payload.type || 'info'
                };

                setToasts(prev => [...prev, newToast]);

                // Auto-remove after 5 seconds
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== newToast.id));
                }, 5000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '350px'
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    gap: '12px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ color: '#00c853' }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                            {toast.message}
                        </div>
                        {toast.description && (
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                {toast.description}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            opacity: 0.5,
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            padding: '2px'
                        }}
                    >
                        <X size={14} />
                    </button>
                    <style jsx>{`
                        @keyframes slideIn {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
}
