import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  ChevronRight, 
  ShieldCheck, 
  Truck,
  IdCard,
  Calendar,
  ChevronLeft
} from 'lucide-react';

type AuthMode = 'login' | 'register';
type Role = "manager" | "dispatcher" | "safety" | "analyst" | "driver";

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('driver');
  const [isLoading, setIsLoading] = useState(false);

  // Toggle between Login and Registration
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth logic
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-500">
        
        {/* Top Header / Illustration Area */}
        <div className="bg-emerald-600 px-8 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full border-[20px] border-white"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 rounded-full border-[15px] border-white"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30 shadow-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FleetOS</h1>
            <p className="text-emerald-100/80 text-sm mt-1">Enterprise Fleet Management</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-10 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 flex mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${mode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${mode === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                    <input 
                      type="text" required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Role Type</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none"
                    >
                      <option value="driver">Driver</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="manager">Fleet Manager</option>
                      <option value="safety">Safety Officer</option>
                      <option value="analyst">Analyst</option>
                    </select>
                  </div>
                </div>

                {role === 'driver' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5 col-span-2">
                       <label className="text-xs font-semibold text-slate-500 uppercase ml-1">License Number</label>
                       <div className="relative group">
                        <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="ABC-12345" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Category</label>
                       <input type="text" placeholder="Class A" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Expiry Date</label>
                       <div className="relative group">
                        <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="date" className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                       </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                <input 
                  type="email" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                <input 
                  type="password" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Fleet Account'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"}
              <button 
                onClick={toggleMode}
                className="ml-1.5 text-emerald-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Register Now' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
