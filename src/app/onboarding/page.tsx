"use client";

import { useState } from "react";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            await completeOnboarding();
            // Action handles redirect
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="max-w-md w-full rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="p-8">
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full mb-8" style={{ backgroundColor: 'var(--border)' }}>
                        <div 
                            className="h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%`, backgroundColor: 'var(--primary)' }}
                        />
                    </div>

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>Welcome to KodaSync 👋</h1>
                            <p className="mb-8 leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>
                                Let's get you set up so you can start turning user conversations into actionable Jira tickets automatically.
                            </p>
                            <button 
                                onClick={handleNext}
                                className="w-full font-medium py-3 rounded-lg transition-colors btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Get Started
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>Tell us about yourself</h1>
                            <p className="mb-6" style={{ color: 'var(--secondary-foreground)' }}>This helps us personalize your experience.</p>
                            
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>What is your role?</label>
                                    <select className="w-full rounded-lg p-3 outline-none" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                                        <option>Product Manager</option>
                                        <option>Founder / CEO</option>
                                        <option>Engineering Manager</option>
                                        <option>Designer</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 font-medium py-3 rounded-lg transition-colors btn"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="flex-[2] font-medium py-3 rounded-lg transition-colors btn btn-primary"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>You're all set! ✨</h1>
                            <p className="mb-8" style={{ color: 'var(--secondary-foreground)' }}>
                                We'll show you a quick tour of the dashboard so you know where everything is.
                            </p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStep(2)}
                                    className="flex-1 font-medium py-3 rounded-lg transition-colors btn"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleFinish}
                                    disabled={loading}
                                    className="flex-[2] font-medium py-3 rounded-lg transition-colors btn btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--background)', borderTopColor: 'transparent' }} />
                                    ) : "Go to Dashboard"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
