import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Loader2 } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            content: "SYSTEM_ONLINE: I am your AI assistant. Ask me for algorithm hints, edge cases, or code debugging advice!" 
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('geekcode_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = { role: 'user', content: data.message };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setIsThinking(true);
        reset();

        try {
            const geminiMessages = updatedMessages.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const response = await axiosClient.post("/ai/chat", {
                messages: geminiMessages,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                starterCode: problem?.starterCode || problem?.startCode
            }, {
                headers: getAuthHeaders()
            });

            setMessages(prev => [...prev, {
                role: 'model',
                content: response.data?.message || response.data?.reply || "Response received."
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                content: "⚠️ SYSTEM_ERROR: Unable to communicate with AI core. Please check backend connection or auth status."
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] max-h-[700px] w-full font-mono text-xs">
            
            {/* Chat Stream Window */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-3 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {msg.role === "model" && (
                            <div className="w-7 h-7 rounded-none bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold border border-neutral-900">
                                <Bot size={14} />
                            </div>
                        )}

                        <div 
                            className={`p-3 max-w-[85%] border-2 ${
                                msg.role === "user" 
                                    ? "bg-emerald-500/10 border-emerald-500 text-neutral-100" 
                                    : "bg-neutral-900 border-neutral-700 text-neutral-200"
                            }`}
                            style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.5)" }}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                                {msg.role === "user" ? "> USER_INPUT" : "> AI_ASSISTANT"}
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed font-mono">
                                {msg.content}
                            </div>
                        </div>

                        {msg.role === "user" && (
                            <div className="w-7 h-7 rounded-none bg-neutral-800 text-neutral-200 flex items-center justify-center shrink-0 font-bold border border-neutral-700">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="flex justify-start gap-3">
                        <div className="w-7 h-7 rounded-none bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
                            <Bot size={14} />
                        </div>
                        <div className="p-3 bg-neutral-900 border-2 border-dashed border-emerald-500/50 text-emerald-400 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">ANALYZING_MATRIX...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Query Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="mt-3 pt-3 border-t-2 border-neutral-800 flex gap-2"
            >
                <div className="relative flex-1">
                    <input 
                        placeholder="ASK_AI_FOR_HINTS..." 
                        className="w-full bg-neutral-900 border-2 border-neutral-700 text-neutral-100 px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 placeholder:text-neutral-600 uppercase" 
                        {...register("message", { required: true, minLength: 1 })}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isThinking || errors.message}
                    className="px-4 py-2 bg-emerald-500 text-neutral-950 font-black text-xs uppercase hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1 border-2 border-neutral-900 transition-none"
                >
                    <Send size={14} />
                    <span>SEND</span>
                </button>
            </form>
        </div>
    );
}

export default ChatAi;