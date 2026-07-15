import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  // Track which problem card is currently hovered for the pop-up effect
  const [hoveredProblemId, setHoveredProblemId] = useState(null);

  // Profile Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Theme Engine (Synced across views using localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('geekcode_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('geekcode_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const theme = isDarkMode ? {
    bgMain: "bg-neutral-950",
    bgCard: "bg-neutral-900",
    textMain: "text-neutral-50",
    textMuted: "text-neutral-400",
    border: "border-neutral-100",
    borderHex: "#f5f5f5",
    shadowDefault: "rgba(245,245,245,1)",
    barBg: "bg-neutral-900"
  } : {
    bgMain: "bg-[#f4f4f0]",
    bgCard: "bg-white",
    textMain: "text-neutral-900",
    textMuted: "text-neutral-500",
    border: "border-neutral-900",
    borderHex: "#171717",
    shadowDefault: "rgba(23,23,23,1)",
    barBg: "bg-white"
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setDropdownOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      difficulty: 'all',
      tag: 'all',
      status: 'all'
    });
  };

  // Advanced Matrix Filters compilation
  const filteredProblems = problems.filter(problem => {
    const searchMatch =
      filters.search.trim() === '' ||
      problem.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      problem.tags?.toLowerCase().includes(filters.search.toLowerCase());

    const difficultyMatch =
      filters.difficulty === 'all' ||
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

    const tagMatch =
      filters.tag === 'all' ||
      problem.tags?.toLowerCase().includes(filters.tag.toLowerCase());

    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && isSolved) ||
      (filters.status === 'unsolved' && !isSolved);

    return searchMatch && difficultyMatch && tagMatch && statusMatch;
  });

  // Calculate live user session stats
  const totalProblemsCount = problems.length;
  const totalSolvedCount = solvedProblems.length;
  const easySolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  return (
    <div className={`min-h-screen ${theme.bgMain} font-mono ${theme.textMain} transition-colors duration-300 antialiased pb-16`}>
      
      {/* ================= TERMINAL NAVIGATION BAR ================= */}
      <nav className={`w-full ${theme.bgCard} border-b-4 ${theme.border} px-4 py-3 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-emerald-500 animate-pulse"></span>
            <NavLink to="/" className="text-2xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-none">
              GEEKCODE<span className="text-emerald-500 font-extrabold">.EXE</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center justify-center w-9 h-9 ${theme.bgCard} ${theme.textMain} hover:bg-emerald-500 hover:text-neutral-900 focus:outline-none transition-none`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                  <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Account Dropdown Node */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`px-3 py-1.5 border-2 ${theme.border} font-black uppercase text-xs flex items-center gap-2 tracking-wider ${theme.bgCard} hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900`}
                >
                  <span>[{user?.firstName}]</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {dropdownOpen && (
                  <div 
                    className={`absolute right-0 mt-2 w-48 ${theme.bgCard} border-4 ${theme.border} text-left rounded-none z-50`}
                    style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}
                  >
                    <div className="px-3 py-2 border-b-2 border-dashed border-neutral-700 text-[10px] font-black tracking-widest uppercase opacity-60">
                      Access: {user?.role || 'user'}
                    </div>
                    {user?.role === 'admin' && (
                      <NavLink 
                        to="/admin" 
                        onClick={() => setDropdownOpen(false)}
                        className={`block px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-neutral-900 border-b-2 ${theme.border}`}
                      >
                        ⚡ ADMIN_PANEL
                      </NavLink>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-3 py-2 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      ☠️ DISCONNECT_SESSION
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ================= HEADER AND TELEMETRY STATS WIDGET ================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8 border-b-4 border-dashed border-neutral-700/30 pb-8">
          
          {/* Main Module Heading */}
          <div className="border-l-4 border-emerald-500 pl-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">PROBLEM_MATRIX</h2>
            <p className={`text-xs font-bold tracking-tight ${theme.textMuted} mt-1`}>
              ENVIRONMENT CODESPIRES COMPILED SUCCESSFULLY // READ: ONLINE
            </p>
          </div>

          {/* Top-Right Metrics Panel (Beneath original dropdown alignment) */}
          <div 
            className={`flex flex-col sm:flex-row items-stretch border-2 ${theme.border} ${theme.bgCard} text-xs font-bold`}
            style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}
          >
            {/* Total Ratio Segment */}
            <div className={`p-3 sm:px-4 flex flex-col justify-center border-b-2 sm:border-b-0 sm:border-r-2 ${theme.border}`}>
              <span className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>COMPILATIONS</span>
              <span className="text-lg font-black text-emerald-500">
                {totalSolvedCount} <span className={`text-xs ${theme.textMain}`}>/ {totalProblemsCount} RESOLVED</span>
              </span>
            </div>

            {/* Core Classification Breakdown blocks */}
            <div className="grid grid-cols-3 divide-x-2 divide-neutral-700/50">
              <div className="p-3 px-4 text-center flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-wider text-emerald-500">EASY</span>
                <span className="text-sm font-black">{easySolved}</span>
              </div>
              <div className="p-3 px-4 text-center flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-wider text-amber-500">MED</span>
                <span className="text-sm font-black">{mediumSolved}</span>
              </div>
              <div className="p-3 px-4 text-center flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-wider text-red-500">HARD</span>
                <span className="text-sm font-black">{hardSolved}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= HIGH-STRUCTURED FILTER CONSOLE ================= */}
        <div className={`border-2 ${theme.border} ${theme.bgCard} p-4 mb-8`} style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}>
          <div className="flex flex-col gap-4">
            
            {/* Grid row 1: Dynamic text search */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-neutral-500 text-xs font-bold">SYS_FIND:</span>
              </div>
              <input 
                type="text" 
                placeholder="INPUT MATRIX TITLE OR STRUCT TYPE (e.g. Array, Dynamic)..."
                className={`w-full pl-20 pr-4 py-2 border-2 ${theme.border} ${theme.bgMain} focus:outline-none focus:border-emerald-500 text-xs uppercase font-bold placeholder-neutral-500`}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Grid row 2: Advanced dropdown selectors */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Status Dropdown */}
                <div className="flex flex-col min-w-[140px]">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 opacity-95">REG_STATUS</span>
                  <select 
                    className={`px-3 py-1.5 border-2 ${theme.border} ${theme.bgMain} font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-emerald-500`}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="all">ALL_RECORDS</option>
                    <option value="solved">RESOLVED</option>
                    <option value="unsolved">UNRESOLVED</option>
                  </select>
                </div>

                {/* Difficulty Dropdown */}
                <div className="flex flex-col min-w-[140px]">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 opacity-95">WEIGHT_LBL</span>
                  <select 
                    className={`px-3 py-1.5 border-2 ${theme.border} ${theme.bgMain} font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-emerald-500`}
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  >
                    <option value="all">ALL_LEVELS</option>
                    <option value="easy">EASY</option>
                    <option value="medium">MEDIUM</option>
                    <option value="hard">HARD</option>
                  </select>
                </div>

                {/* Tags Dropdown */}
                <div className="flex flex-col min-w-[140px]">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 opacity-95">ALGO_STRUCT</span>
                  <select 
                    className={`px-3 py-1.5 border-2 ${theme.border} ${theme.bgMain} font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-emerald-500`}
                    value={filters.tag}
                    onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                  >
                    <option value="all">ALL_STRUCTURES</option>
                    <option value="array">ARRAY</option>
                    <option value="linkedlist">LINKED_LIST</option>
                    <option value="graph">GRAPH</option>
                    <option value="dp">DYNAMIC_PROG</option>
                  </select>
                </div>
              </div>

              {/* Reset Controller */}
              <div className="pt-4 sm:pt-0">
                <button
                  onClick={handleResetFilters}
                  className={`px-3 py-1.5 text-xs font-black uppercase border-2 ${theme.border} bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-none`}
                >
                  RESET_COMPILER_PARAMS [✖]
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ================= PROBLEMS DATA CONTAINER ================= */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className={`text-center py-12 border-4 border-dashed ${theme.border} ${theme.bgCard}`}>
              <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-1">
                ⚠️ [ERR] NO_MATCHING_RECORDS_FOUND
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                The parameters you input returned null execution data. Readjust your parameters.
              </p>
            </div>
          ) : (
            filteredProblems.map(problem => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              const isHovered = hoveredProblemId === problem._id;
              
              return (
                <div 
                  key={problem._id} 
                  onMouseEnter={() => setHoveredProblemId(problem._id)}
                  onMouseLeave={() => setHoveredProblemId(null)}
                  className={`w-full ${theme.bgCard} border-2 ${theme.border} ${
                    isHovered ? 'border-emerald-500 -translate-y-1 -translate-x-1' : ''
                  } transition-all duration-200 relative overflow-hidden`}
                  style={{ 
                    boxShadow: isHovered 
                      ? `8px 8px 0px 0px ${theme.borderHex}` 
                      : `4px 4px 0px 0px ${theme.borderHex}` 
                  }}
                >
                  
                  {/* Internal Row Layout */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center flex-wrap gap-3">
                        
                        {/* Interactive Title Heading */}
                        <h3 className="text-lg font-black uppercase tracking-tight">
                          <NavLink 
                            to={`/problem/${problem._id}`} 
                            className="hover:bg-emerald-500 hover:text-neutral-900 transition-none px-1"
                          >
                            {problem.title}
                          </NavLink>
                        </h3>

                        {/* Resolved Flag Badge (Updated to matching scalable font style) */}
                        {isSolved && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500 text-neutral-900 px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-widest border border-neutral-900">
                            ✓ RESOLVED
                          </span>
                        )}
                      </div>

                      {/* Sub-metrics Row (Increased Font & Padding) */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Complexity Badge */}
                        <span className={`px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider border-2 ${theme.border} ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        
                        {/* Tag Badges */}
                        {problem.tags && (
                          <span className={`px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider ${theme.bgMain} ${theme.textMuted} border border-dashed border-neutral-500`}>
                            #{problem.tags}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Code Action Trigger */}
                    <div className="flex items-center sm:justify-end">
                      <NavLink 
                        to={`/problem/${problem._id}`}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 ${theme.border} bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-emerald-500 hover:text-neutral-900 dark:hover:bg-emerald-500 dark:hover:text-neutral-900 transition-none`}
                      >
                        RUN_CODE_&gt;
                      </NavLink>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

// Brutalist Matrix Complexity Color Map
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': 
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500 dark:bg-emerald-500 dark:text-neutral-950';
    case 'medium': 
      return 'bg-amber-500/10 text-amber-500 border-amber-500 dark:bg-amber-500 dark:text-neutral-950';
    case 'hard': 
      return 'bg-red-500/10 text-red-500 border-red-500 dark:bg-red-500 dark:text-neutral-950';
    default: 
      return 'bg-neutral-500/10 text-neutral-400 border-neutral-500';
  }
};

export default Homepage;