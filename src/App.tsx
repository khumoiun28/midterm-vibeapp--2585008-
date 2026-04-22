import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, Calendar, Smile, Gift, Sparkles, BookOpen, Clock, ChevronRight, X, Pencil } from 'lucide-react';
import { GratitudeEntry, EMOJIS } from './types';

export default function App() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [items, setItems] = useState<string[]>(['']);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gratitude-diary');
    if (saved) {
      try {
        setEntries(JSON.parse(saved).sort((a: GratitudeEntry, b: GratitudeEntry) => b.createdAt - a.createdAt));
      } catch (e) {
        console.error('Failed to parse entries', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gratitude-diary', JSON.stringify(entries));
  }, [entries]);

  // Statistics calculation
  const totalEntries = entries.length;
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    // Get unique dates sorted descending
    const uniqueDates = [...new Set(entries.map(e => {
      const d = new Date(e.createdAt);
      return d.toDateString();
    }))].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const latestDate = uniqueDates[0];
    latestDate.setHours(0, 0, 0, 0);

    // If latest record wasn't today or yesterday, streak is broken
    const diffToToday = (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffToToday > 1) return 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      const current = uniqueDates[i];
      current.setHours(0, 0, 0, 0);
      
      const expected = new Date(latestDate);
      expected.setDate(latestDate.getDate() - i);
      expected.setHours(0, 0, 0, 0);

      if (current.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streakValue = calculateStreak();

  const handleAddItem = () => {
    if (items.length < 3) {
      setItems([...items, '']);
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleRemoveInput = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredItems = items.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) return;

    if (editingId) {
      setEntries(entries.map(entry => 
        entry.id === editingId 
          ? { ...entry, items: filteredItems, emoji: selectedEmoji }
          : entry
      ));
      setEditingId(null);
    } else {
      const newEntry: GratitudeEntry = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }),
        items: filteredItems,
        emoji: selectedEmoji,
        createdAt: Date.now()
      };
      setEntries([newEntry, ...entries]);
    }

    setItems(['']);
    setSelectedEmoji(EMOJIS[0]);
    // Note: in the new desktop-first theme, we might keep the form always visible or integrated
    if (!editingId) setShowForm(false);
  };

  const editEntry = (entry: GratitudeEntry) => {
    setEditingId(entry.id);
    setItems(entry.items);
    setSelectedEmoji(entry.emoji);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setItems(['']);
    setSelectedEmoji(EMOJIS[0]);
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white shadow-sm px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 korea-accent">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">오늘의 감사 일기</h1>
            <p className="text-sm text-slate-500 font-medium">{todayStr}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02]">
            <span className="text-[#1971C2] text-[10px] font-bold block uppercase tracking-wider mb-0.5">전체 감사</span>
            <span className="text-xl font-bold text-blue-900">{totalEntries}</span>
          </div>
          <div className="flex-1 md:flex-none bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm transition-transform hover:scale-[1.02]">
            <span className="text-[#E03131] text-[10px] font-bold block uppercase tracking-wider mb-0.5">연속 달성</span>
            <span className="text-xl font-bold text-red-900">{streakValue}일</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Input and Habit Card */}
        <section className="w-full md:w-5/12 flex flex-col gap-6">
          {/* Always show form on desktop? Or at least integrate it nicely */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-700">
              {editingId ? '감사 일기 수정하기' : '오늘 무엇이 감사했나요?'}
            </h2>
            
            <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    selectedEmoji === emoji 
                      ? 'bg-white shadow-sm ring-1 ring-slate-100' 
                      : 'opacity-40 hover:opacity-100 hover:bg-white/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="relative group">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      placeholder={index === 0 ? "첫 번째 감사를 적어보세요" : index === 1 ? "두 번째 감사를 적어보세요 (선택)" : "세 번째 감사를 적어보세요 (선택)"}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1971C2] transition-all text-sm pr-10"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInput(index)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {items.length < 3 && !editingId && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#1971C2] font-bold flex items-center gap-1.5 px-1 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Plus size={14} /> 감사 추가하기
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
                >
                  <Heart size={16} fill={editingId ? 'none' : 'currentColor'} />
                  {editingId ? '수정 완료' : '기록 저장하기'}
                </button>
              </div>
            </form>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1971C2] p-6 rounded-2xl shadow-lg text-white flex justify-between items-center overflow-hidden relative"
          >
            <div className="space-y-1 relative z-10">
              <h3 className="font-bold text-lg">기록하는 습관</h3>
              <p className="text-xs text-blue-100">작은 감사함이 당신의 하루를 바꿉니다.</p>
            </div>
            <div className="text-6xl absolute -right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none grayscale-0">
              🇰🇷
            </div>
          </motion.div>
        </section>

        {/* Right Column: Recent Entries */}
        <section className="w-full md:w-7/12 flex flex-col gap-4 overflow-hidden">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">최근 기록</h2>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-250px)] pb-10">
            <AnimatePresence mode="popLayout">
              {entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 text-slate-400 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200"
                >
                  <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-medium">아직 기록된 일기가 없어요.</p>
                  <p className="text-xs mt-1">오늘 하루 감사한 마음을 기록해보세요.</p>
                </motion.div>
              ) : (
                entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-5 items-start group relative transition-transform hover:translate-x-1 ${
                      index % 2 === 0 ? 'gratitude-item-blue' : 'gratitude-item-red'
                    }`}
                  >
                    <div className="text-3xl bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {entry.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                          {entry.date}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => editEntry(entry)}
                            className="text-slate-300 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50"
                            title="수정"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-slate-50"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {entry.items.map((item, i) => (
                          <li key={i} className="text-slate-700 text-sm flex items-start gap-2 font-medium">
                            <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="p-8 text-center text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        Local Storage Enabled • Student Project South Korea
      </footer>
    </div>
  );
}
