export function Badge({ children, color = 'blue' }) {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      purple: 'bg-purple-50 text-purple-700',
      amber: 'bg-amber-50 text-amber-700',
      pink: 'bg-pink-50 text-pink-700',
      red: 'bg-red-50 text-red-700',
      yellow: 'bg-yellow-50 text-yellow-700',
    };
  
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${colorClasses[color] || colorClasses.blue}`}>{children}</span>
    );
  }