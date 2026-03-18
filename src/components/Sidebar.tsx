import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  LayoutGrid, 
  IdCard,
  ChevronDown, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { Category, Item } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const iconMap: Record<string, React.ReactNode> = {
  Wallet: <Wallet size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  CreditCard: <CreditCard size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
  IdCard: <IdCard size={18} />,
  LayoutGrid: <LayoutGrid size={18} />,
};

interface SidebarProps {
  categories: Category[];
  selectedItem: Item | null;
  onSelectItem: (item: Item) => void;
  onOpenAdmin: () => void;
}

export default function Sidebar({ categories, selectedItem, onSelectItem, onOpenAdmin }: SidebarProps) {
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({ 1: true });

  const toggleCat = (id: number) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-64 bg-brand-sidebar h-full flex flex-col border-r border-white/5 min-h-0">
      <div className="p-4 flex items-center gap-2 border-b border-white/5">
        <div className="bg-brand-accent text-brand-dark p-1 rounded font-bold text-lg">B</div>
        <span className="font-bold text-lg tracking-tight">Thư viện <span className="text-brand-accent">SPDV</span></span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <div className="px-4 mb-4">
          <h3 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-4">Danh mục nghiệp vụ</h3>
          
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <button 
                  onClick={() => toggleCat(cat.id)}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 text-brand-accent">
                    {iconMap[cat.icon] || <LayoutGrid size={18} />}
                    <span className="text-xs font-bold uppercase tracking-wide">{cat.name}</span>
                  </div>
                  {expandedCats[cat.id] ? <ChevronDown size={14} className="text-brand-accent" /> : <ChevronRight size={14} className="text-brand-accent" />}
                </button>

                <AnimatePresence>
                  {expandedCats[cat.id] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-8 space-y-1"
                    >
                      {cat.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className={`w-full text-left p-2 rounded text-[11px] transition-colors ${
                            selectedItem?.id === item.id 
                              ? 'bg-white/10 text-brand-accent font-medium' 
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight size={10} className={selectedItem?.id === item.id ? 'text-brand-accent' : 'text-white/30'} />
                            {item.name}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onOpenAdmin}
          className="w-full p-2 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-accent transition-colors"
        >
          Trang quản lý
        </button>
        <p className="mt-4 text-[9px] text-white/40 italic leading-tight">
          Chọn sản phẩm để tra cứu thông tin chi tiết và gửi thắc mắc nghiệp vụ.
        </p>
      </div>
    </div>
  );
}
