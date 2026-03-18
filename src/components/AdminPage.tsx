import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  LayoutGrid, 
  FileText, 
  HelpCircle,
  ArrowLeft,
  Upload,
  Sparkles,
  Loader2,
  Edit2
} from 'lucide-react';
import { Category, Item } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminPageProps {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function AdminPage({ categories, onClose, onRefresh }: AdminPageProps) {
  const [selectedCatId, setSelectedCatId] = useState<number>(categories[0]?.id || 0);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
    conditions: '',
    details: '',
    lastUpdated: new Date().toLocaleDateString('vi-VN')
  });

  const handleSelectItem = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      features: item.features.join('\n'),
      conditions: item.conditions,
      details: item.details || '',
      lastUpdated: item.lastUpdated
    });
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      features: '',
      conditions: '',
      details: '',
      lastUpdated: new Date().toLocaleDateString('vi-VN')
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !selectedCatId) return;

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCatId,
          name: formData.name,
          description: formData.description,
          features: formData.features.split('\n').filter(f => f.trim()),
          conditions: formData.conditions,
          details: formData.details,
          lastUpdated: formData.lastUpdated
        })
      });
      
      resetForm();
      onRefresh();
      alert(editingItem ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      onRefresh();
      if (editingItem?.id === id) resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        const mimeType = file.type;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: `Hãy phân tích tài liệu/hình ảnh này và trích xuất thông tin sản phẩm dịch vụ ngân hàng. 
                Trả về kết quả dưới dạng JSON với cấu trúc sau:
                {
                  "name": "Tên sản phẩm",
                  "description": "Mô tả tổng quát ngắn gọn",
                  "features": ["Tính năng 1", "Tính năng 2", ...],
                  "conditions": "Điều kiện áp dụng",
                  "details": "Bảng quyền lợi hoặc biểu phí chi tiết dưới dạng Markdown table"
                }
                Lưu ý: Chỉ trả về JSON, không kèm giải thích.` }
              ]
            }
          ],
          config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text);
        setFormData({
          ...formData,
          name: result.name || formData.name,
          description: result.description || formData.description,
          features: (result.features || []).join('\n'),
          conditions: result.conditions || formData.conditions,
          details: result.details || formData.details
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Có lỗi khi xử lý file bằng AI.");
      setIsProcessing(false);
    }
  };

  const currentCategory = categories.find(c => c.id === selectedCatId);

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 bg-brand-dark min-h-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-accent flex items-center gap-3">
            <div className="w-1 h-8 bg-brand-accent rounded-full"></div>
            TRANG QUẢN LÝ NỘI DUNG
          </h1>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-card/40 border border-white/10 rounded-xl p-6">
              <h3 className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-4">Chọn danh mục</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      selectedCatId === cat.id 
                        ? 'bg-brand-accent text-brand-dark font-bold' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-card/40 border border-white/10 rounded-xl p-6">
              <h3 className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-4">Sản phẩm trong mục</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {currentCategory?.items.map((item) => (
                  <div key={item.id} className="group flex items-center gap-2">
                    <button
                      onClick={() => handleSelectItem(item)}
                      className={`flex-1 text-left p-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                        editingItem?.id === item.id 
                          ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!currentCategory?.items || currentCategory.items.length === 0) && (
                  <div className="text-[10px] text-white/20 italic text-center py-4">Chưa có sản phẩm</div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-brand-card/40 border border-white/10 rounded-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-accent flex items-center gap-2">
                  {editingItem ? <Edit2 size={20} /> : <Plus size={20} />}
                  {editingItem ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}
                </h2>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*,.pdf,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent/20 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {isProcessing ? 'Đang xử lý...' : 'Cập nhật từ file (AI)'}
                  </button>
                  {editingItem && (
                    <button
                      onClick={resetForm}
                      className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Gói tín dụng ưu đãi..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mô tả tổng quát</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả chi tiết..."
                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tính năng (Mỗi dòng 1 ý)</label>
                    <textarea
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Cập nhật thời gian thực...&#10;Chi tiết lãi suất..."
                      className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Điều kiện áp dụng</label>
                    <textarea
                      value={formData.conditions}
                      onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                      placeholder="Áp dụng cho khách hàng..."
                      className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nội dung chi tiết (Markdown/Bảng)</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Nhập nội dung chi tiết hoặc bảng quyền lợi bằng Markdown..."
                    className="w-full h-48 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ngày cập nhật</label>
                    <input
                      type="text"
                      value={formData.lastUpdated}
                      onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                      className="bg-transparent border-b border-white/20 text-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-accent text-brand-dark px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    {editingItem ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
