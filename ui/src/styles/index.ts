// Enhanced gradient and glass morphism styles for Brand DNA Engine
export const colorAnimation = `
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
  }
  
  @keyframes text-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .gradient-text {
    background: linear-gradient(45deg, #8b5cf6, #3b82f6, #6366f1, #8b5cf6);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: text-gradient 3s ease infinite;
  }
  
  .animated-gradient {
    background: linear-gradient(45deg, #1e1b4b, #312e81, #1e3a8a, #1e1b4b);
    background-size: 400% 400%;
    animation: gradient-shift 8s ease infinite;
  }
`;

export const dmSansStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
`;

// New enhanced glass morphism styles
export const glassStyle = {
  // Main container glass effect
  container: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl",
  
  // Card glass effect with enhanced blur
  card: "backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300",
  
  // Sidebar glass effect
  sidebar: "backdrop-blur-xl bg-white/8 border-l border-white/15 shadow-2xl",
  
  // Progress card glass effect
  progressCard: "backdrop-blur-md bg-white/8 border border-white/15 rounded-lg p-4 shadow-lg hover:bg-white/12 hover:border-white/25 transition-all duration-300",
  
  // Input glass effect
  input: "backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg focus:bg-white/15 focus:border-white/30 transition-all duration-200",
  
  // Button glass effect
  button: "backdrop-blur-sm bg-white/15 border border-white/25 rounded-lg hover:bg-white/20 hover:border-white/35 transition-all duration-200",
  
  // Header glass effect
  header: "backdrop-blur-lg bg-white/5 border-b border-white/10",
  
  // Base glass for general use
  base: "backdrop-blur-md bg-white/8 border border-white/15 rounded-lg"
};

// Animation styles
export const fadeInAnimation = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-500",
  slideDown: "animate-in slide-in-from-top-4 duration-500",
  slideLeft: "animate-in slide-in-from-right-4 duration-500",
  slideRight: "animate-in slide-in-from-left-4 duration-500",
  scaleIn: "animate-in zoom-in-95 duration-300",
  bounceIn: "animate-in zoom-in-50 duration-500 ease-out"
};

// Progress card styles
export const progressCardStyles = {
  active: "border-purple-400/50 bg-purple-500/10 shadow-purple-500/20",
  completed: "border-green-400/50 bg-green-500/10 shadow-green-500/20",
  pending: "border-gray-400/30 bg-gray-500/5 shadow-gray-500/10",
  error: "border-red-400/50 bg-red-500/10 shadow-red-500/20"
};

// Mobile styles
export const mobileStyles = {
  bottomSheet: "fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out",
  overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40",
  handle: "w-12 h-1 bg-white/40 rounded-full mx-auto mb-4"
};

// Responsive breakpoints
export const breakpoints = {
  mobile: "max-width: 767px",
  tablet: "min-width: 768px and max-width: 1023px", 
  desktop: "min-width: 1024px"
};
