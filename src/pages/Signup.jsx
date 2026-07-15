import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

// Upgraded schema messages to match the terminal theme
const signupSchema = z.object({
  firstName: z.string().min(3, "ERR: ALIAS_TOO_SHORT (MIN 3)"),
  emailId: z.string().email("ERR: INVALID_EMAIL_STRUCTURE"),
  password: z.string().min(8, "ERR: ENCRYPTION_WEAK_MIN_8_CHARS")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth); 

  // Theme State (Persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('geekcode_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('geekcode_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Dynamic Brutalist Theme Dictionary
  const theme = isDarkMode ? {
    bgMain: "bg-neutral-950",
    bgCard: "bg-neutral-900",
    textMain: "text-neutral-50",
    textMuted: "text-neutral-400",
    border: "border-neutral-100",
    shadowDefault: "rgba(245,245,245,1)",
  } : {
    bgMain: "bg-[#f4f4f0]",
    bgCard: "bg-white",
    textMain: "text-neutral-900",
    textMuted: "text-neutral-500",
    border: "border-neutral-900",
    shadowDefault: "rgba(23,23,23,1)",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  // Redirect to backend Google OAuth entrypoint (full page nav, not client-side routing)
  const handleGoogleSignup = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  // Fake hex code generator for the aesthetic background on the left panel
  const generateHexDump = () => {
    let dump = "";
    for(let i=0; i<60; i++) {
      dump += Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase() + " ";
    }
    return dump;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${theme.bgMain} font-mono ${theme.textMain} selection:bg-emerald-500 selection:text-neutral-900 transition-colors duration-300`}>
      
      {/* Top Absolute Theme Toggle (BORDER REMOVED HERE) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center justify-center w-10 h-10 ${theme.bgCard} ${theme.textMain} hover:bg-emerald-500 hover:text-neutral-900 focus:outline-none transition-none`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Main Split-Panel Node Wrapper */}
      <div 
        className={`w-full max-w-4xl ${theme.bgCard} border-4 ${theme.border} transition-all duration-250 flex flex-col md:flex-row`}
        style={{ boxShadow: `8px 8px 0px 0px ${theme.shadowDefault}` }}
      >
        
        {/* ================= LEFT SIDE: SYSTEM DIAGNOSTIC PANEL ================= */}
        <div className={`w-full md:w-5/12 bg-neutral-950 text-emerald-500 border-b-4 md:border-b-0 md:border-r-4 ${theme.border} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden`}>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          
          <div className="relative z-10">
            {/* Branding for Signup */}
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-none">
              INIT<br/>NODE<span className="text-emerald-500 animate-pulse">_</span>
            </h1>
            
            {/* Simulated Registration Sequence */}
            <div className="space-y-2 text-xs font-bold mb-8 text-emerald-400/80">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500"></span> [SYS] ALLOCATING_MEMORY_BLOCK</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500"></span> [SYS] PREPARING_DATABASE_ENTRY</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-yellow-500 animate-pulse"></span> [WAIT] AWAITING_USER_INPUT</p>
            </div>

            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 border-b border-neutral-800 pb-1">
                MEM_ALLOC // NEW_USER_NODE
              </p>
              <div className="font-mono text-[10px] text-neutral-600 break-words leading-relaxed">
                {generateHexDump()}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
             <div className="border-l-2 border-emerald-500 pl-3">
                <p className="text-[10px] uppercase font-bold text-neutral-400">Node Status</p>
                <p className="text-sm font-black text-white">UNREGISTERED</p>
             </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: REGISTRATION FORM ================= */}
        <div className="w-full md:w-7/12 flex flex-col">
          
          {/* System Status Bar */}
          <div className={`flex items-center justify-between px-4 py-2 border-b-4 ${theme.border} bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">SECURE_REGISTRATION_PROTOCOL</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">PORT: 443</span>
          </div>

          <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col justify-center">
            
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                CREATE_ENTITY_PROFILE
              </h2>
              <p className={`text-xs font-bold ${theme.textMuted}`}>
                DEFINE YOUR GEEKCODE ACCESS CREDENTIALS
              </p>
            </div>

            {/* Global Redux Error Display */}
            {error && (
              <div className="mb-6 p-3 border-2 border-red-500 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-wider flex items-start gap-2">
                <span className="mt-0.5">🚨</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* First Name Field */}
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase tracking-wider mb-2">
                  [01] ENTITY_ALIAS (FIRST_NAME)
                </label>
                <div className="relative flex">
                  <div className={`flex items-center justify-center px-3 border-2 border-r-0 ${theme.border} ${theme.bgMain} ${theme.textMuted}`}>
                    $&gt;
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full px-4 py-3 rounded-none border-2 font-mono font-bold text-sm bg-transparent transition-none focus:outline-none 
                      ${errors.firstName ? 'border-red-500 text-red-500 placeholder-red-300' : `${theme.border} focus:border-emerald-500`}`} 
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <span className="text-red-500 font-bold text-[10px] mt-2 tracking-tight uppercase">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase tracking-wider mb-2">
                  [02] USER_IDENTIFIER (EMAIL)
                </label>
                <div className="relative flex">
                  <div className={`flex items-center justify-center px-3 border-2 border-r-0 ${theme.border} ${theme.bgMain} ${theme.textMuted}`}>
                    $&gt;
                  </div>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 rounded-none border-2 font-mono font-bold text-sm bg-transparent transition-none focus:outline-none 
                      ${errors.emailId ? 'border-red-500 text-red-500 placeholder-red-300' : `${theme.border} focus:border-emerald-500`}`} 
                    {...register('emailId')}
                  />
                </div>
                {errors.emailId && (
                  <span className="text-red-500 font-bold text-[10px] mt-2 tracking-tight uppercase">
                    {errors.emailId.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase tracking-wider mb-2 flex justify-between">
                  <span>[03] SECURE_PASSPHRASE</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={theme.textMuted}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </label>
                <div className="relative flex">
                   <div className={`flex items-center justify-center px-3 border-2 border-r-0 ${theme.border} ${theme.bgMain} ${theme.textMuted}`}>
                    $&gt;
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 rounded-none border-2 font-mono font-bold text-sm bg-transparent transition-none focus:outline-none 
                      ${errors.password ? 'border-red-500 text-red-500 placeholder-red-300' : `${theme.border} focus:border-emerald-500`}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className={`absolute top-1/2 right-3 transform -translate-y-1/2 p-1 border border-transparent hover:border-emerald-500 ${theme.textMain}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 font-bold text-[10px] mt-2 tracking-tight uppercase">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-center rounded-none border-2 ${theme.border} ${loading ? 'bg-neutral-500 text-neutral-300 cursor-not-allowed' : 'bg-emerald-400 text-neutral-900 hover:bg-emerald-500'} font-black uppercase tracking-widest py-4 text-sm transition-none focus:outline-none flex items-center justify-center gap-3`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent animate-spin"></span>
                      <span className="animate-pulse">GENERATING_PROFILE...</span>
                    </>
                  ) : (
                    'EXECUTE_SIGNUP_COMMAND'
                  )}
                </button>
              </div>
            </form>

            {/* Google OAuth Trigger */}
            <div className="flex items-center gap-3 my-6">
              <div className={`flex-1 h-[2px] ${theme.border} bg-neutral-400/30`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>OR</span>
              <div className={`flex-1 h-[2px] ${theme.border} bg-neutral-400/30`}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className={`w-full flex items-center justify-center gap-2 border-2 ${theme.border} py-3 text-sm font-black uppercase tracking-widest ${theme.textMain} hover:bg-emerald-500 hover:text-neutral-900 transition-none focus:outline-none`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.01l7.73 6c4.51-4.18 7.09-10.36 7.09-17.48z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            {/* Alternate Link Matrix Redirect */}
            <div className="text-center mt-6 pt-5 border-t-2 border-dashed border-neutral-700/30 dark:border-neutral-700/50">
              <span className={`text-xs font-bold uppercase tracking-tight ${theme.textMuted}`}>
                ALREADY COMPILED?{' '}
                <NavLink 
                  to="/login" 
                  className="text-emerald-500 font-black underline decoration-2 hover:bg-emerald-500 hover:text-neutral-900 transition-none px-1 py-0.5 ml-1 inline-block"
                >
                  EXECUTE_LOGIN
                </NavLink>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;