import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProductDetail from './components/ProductDetail';
import AdminPage from './components/AdminPage';
import { Category, Item } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
      
      // Select first item by default if none selected
      if (!selectedItem && data.length > 0 && data[0].items.length > 0) {
        setSelectedItem(data[0].items[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-accent font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-brand-dark overflow-hidden font-sans selection:bg-brand-accent selection:text-brand-dark min-h-0">
      <Sidebar 
        categories={categories} 
        selectedItem={selectedItem}
        onSelectItem={(item) => {
          setSelectedItem(item);
          setIsAdminOpen(false);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="flex-1 flex flex-col relative min-h-0">
        <AnimatePresence mode="wait">
          {isAdminOpen ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <AdminPage 
                categories={categories} 
                onClose={() => setIsAdminOpen(false)}
                onRefresh={fetchData}
              />
            </motion.div>
          ) : selectedItem ? (
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ProductDetail 
                item={selectedItem} 
                onRefresh={fetchData}
              />
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20 italic">
              Chọn một sản phẩm từ danh mục để xem chi tiết
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
