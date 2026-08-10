import { motion } from 'framer-motion';

interface MemoryCardProps {
  memory: {
    id: string;
    title: string;
    bengaliTitle: string;
    icon: string;
    mood: string;
  };
  onClick: () => void;
}

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-paper-white border border-dark-brown/20 p-6 rounded-sm shadow-[4px_4px_0px_rgba(62,39,35,0.15)] flex flex-col items-center justify-center text-center gap-4 transition-colors hover:bg-[#faf6e9] group"
    >
      <div className="text-5xl mb-2 opacity-90 group-hover:scale-110 transition-transform duration-500">
        {memory.icon}
      </div>
      <div>
        <h3 className="bengali-text text-2xl font-bold text-dark-brown mb-1">{memory.bengaliTitle}</h3>
        <p className="font-semibold text-sm tracking-wider uppercase text-dark-brown/80">{memory.title}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-dark-brown/10 w-full">
        <p className="text-xs tracking-widest uppercase text-dark-brown/50">{memory.mood}</p>
      </div>
    </motion.button>
  );
}
