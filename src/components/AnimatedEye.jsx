const AnimatedEye = ({ isOpen }) => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-5 h-5 fill-none stroke-current transition-all duration-500"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Base Eye Shape */}
    <path 
      d="M21 12C21 12 18 19 12 19C6 19 3 12 3 12C3 12 6 5 12 5C18 5 21 12 21 12Z" 
      className="opacity-20"
    />
    
    {/* Inner Iris/Pupil */}
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      className={`transition-all duration-300 origin-center ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
    />
    
    {/* Top Lid */}
    <path 
      d={isOpen ? "M3 12C3 12 6 5 12 5C18 5 21 12 21 12" : "M3 12C3 12 6 12 12 12C18 12 21 12 21 12"} 
      className="transition-all duration-500 ease-in-out"
    />
    
    {/* Bottom Lid */}
    <path 
      d={isOpen ? "M3 12C3 12 6 19 12 19C18 19 21 12 21 12" : "M3 12C3 12 6 12 12 12C18 12 21 12 21 12"} 
      className="transition-all duration-500 ease-in-out"
    />

    {/* Eyelashes / detail for closed state */}
    <g className={`transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
      <line x1="12" y1="13" x2="12" y2="16" />
      <line x1="17" y1="12" x2="19" y2="15" />
      <line x1="7" y1="12" x2="5" y2="15" />
    </g>
  </svg>
);

export default AnimatedEye;
