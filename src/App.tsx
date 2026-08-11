import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CassettePlayer } from './components/CassettePlayer';
import { MemoryCard } from './components/MemoryCard';

const MEMORIES = [
  { id: 'rain', title: 'Brishtir Shondhya', bengaliTitle: 'বৃষ্টির সন্ধ্যা', icon: '🌧', mood: 'Quiet · Romantic · Nostalgic', bg: 'from-blue-900 to-gray-900', bgImage: '/img/bristir-sandha.png' },
  { id: 'mela', title: 'Melar Shondhya', bengaliTitle: 'মেলার সন্ধ্যা', icon: '🎡', mood: 'Joyful · Childhood · Wandering', bg: 'from-orange-800 to-amber-900' },
  { id: 'wedding', title: 'Biye Bari', bengaliTitle: 'বিয়ে বাড়ি', icon: '💍', mood: 'Celebration · Family · Tradition', bg: 'from-red-900 to-yellow-900' },
  { id: 'bus', title: 'Bus Journey', bengaliTitle: 'বাস জার্নি', icon: '🚌', mood: 'Travel · Window · Evening', bg: 'from-gray-800 to-emerald-900' },
  { id: 'tea', title: 'Cha-er Dokan', bengaliTitle: 'চায়ের দোকান', icon: '☕', mood: 'Adda · Friendship · Evening', bg: 'from-amber-900 to-stone-900' },
  { id: 'radio', title: 'Dadu-r Radio', bengaliTitle: 'দাদুর রেডিও', icon: '📻', mood: 'Classic · Static · Morning', bg: 'from-stone-700 to-stone-900' },
  { id: 'remake', title: 'Old Bengali Remake', bengaliTitle: 'পুরোনো গান রিমেক', icon: '🎸', mood: 'Retro · Reimagined · Melancholy', bg: 'from-purple-900 to-slate-900' },
  { id: 'childhood', title: 'Chhotobelar Din', bengaliTitle: 'ছোটবেলার দিন', icon: '🪁', mood: 'Innocence · Sunday · Play', bg: 'from-sky-800 to-indigo-900' }
];

export default function App() {
  const [activeMemory, setActiveMemory] = useState<string | null>(null);

  const selectedMemory = MEMORIES.find(m => m.id === activeMemory);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="noise-overlay"></div>
      
      {/* Background Atmosphere Transition */}
      <AnimatePresence>
        {activeMemory && (
          <motion.div
            key={activeMemory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat ${selectedMemory?.bgImage ? '' : `bg-gradient-to-br opacity-80 ${selectedMemory?.bg}`}`}
            style={
              selectedMemory?.bgImage
                ? { backgroundImage: `url(${selectedMemory.bgImage})` }
                : {}
            }
          >
            {selectedMemory?.bgImage && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-16 px-4 pb-24">
        <AnimatePresence mode="wait">
          {!activeMemory ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl w-full text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2 text-dark-brown">SHONA DIN</h1>
              <p className="bengali-text text-xl md:text-2xl text-dark-brown/80 mb-12 italic">"Gaan noy, smriti shuni."</p>
              
              <div className="mb-10">
                <h2 className="bengali-text text-2xl md:text-3xl font-semibold text-dark-brown">আজ কোন স্মৃতিটা শুনতে ইচ্ছে করছে?</h2>
                <p className="text-sm uppercase tracking-widest text-dark-brown/60 mt-2">Choose a memory</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MEMORIES.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onClick={() => setActiveMemory(memory.id)} />
                ))}
              </div>

              <div className="mt-16">
                <button 
                  onClick={() => setActiveMemory(MEMORIES[Math.floor(Math.random() * MEMORIES.length)].id)}
                  className="bg-faded-red text-paper-white px-8 py-4 rounded-sm shadow-[4px_4px_0px_#3e2723] hover:translate-y-1 hover:shadow-[2px_2px_0px_#3e2723] transition-all font-bold tracking-wide uppercase"
                >
                  Ajke ki shunbo? (Surprise Me)
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full max-w-4xl flex flex-col items-center justify-center h-full"
            >
              <button 
                onClick={() => setActiveMemory(null)}
                className="self-start mb-8 text-paper-white/70 hover:text-paper-white transition-colors flex items-center gap-2 uppercase text-sm tracking-wider"
              >
                ← Back to Memories
              </button>
              
              <div className="text-center mb-12">
                <h2 className="bengali-text text-4xl text-paper-white mb-2 shadow-black drop-shadow-md">
                  {MEMORIES.find(m => m.id === activeMemory)?.bengaliTitle}
                </h2>
                <p className="text-paper-white/60 tracking-widest uppercase text-sm">
                  {MEMORIES.find(m => m.id === activeMemory)?.title}
                </p>
              </div>

              <CassettePlayer memoryId={activeMemory} memory={MEMORIES.find(m => m.id === activeMemory)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
