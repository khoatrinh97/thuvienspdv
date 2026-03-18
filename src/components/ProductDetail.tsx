import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Check, 
  HelpCircle, 
  Send, 
  ChevronRight,
  Menu,
  MessageSquare
} from 'lucide-react';
import { Item, QA } from '../types';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProductDetailProps {
  item: Item;
  onRefresh: () => void;
}

export default function ProductDetail({ item, onRefresh }: ProductDetailProps) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detail, setDetail] = useState<Item | null>(null);

  useEffect(() => {
    fetch(`/api/items/${item.id}`)
      .then(res => res.json())
      .then(data => setDetail(data));
  }, [item.id]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          question: question,
          answer: ""
        })
      });
      setQuestion('');
      // Refresh details to show new QA
      const res = await fetch(`/api/items/${item.id}`);
      const data = await res.json();
      setDetail(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!detail) return <div className="p-8 text-brand-accent">Đang tải...</div>;

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 pb-24 bg-brand-dark min-h-0">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-8">
        <Menu size={14} />
        <span>THƯ VIỆN SPDV</span>
        <ChevronRight size={12} />
        <span>{detail.name}</span>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-end">
          <button 
            onClick={() => document.getElementById('qa-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-bold text-brand-accent/60 hover:text-brand-accent uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <MessageSquare size={14} />
            Đến phần thắc mắc
          </button>
        </div>

        <div className="bg-brand-card/30 border border-white/5 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-brand-accent mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-brand-accent rounded-full"></div>
            CHI TIẾT SẢN PHẨM DỊCH VỤ
          </h1>

          <div className="bg-brand-card rounded-xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-accent text-brand-dark p-2 rounded-lg">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight">{detail.name}</h2>
            </div>

            <div className="bg-black/20 rounded-lg p-6 border border-white/5">
              <h3 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-3">MÔ TẢ TỔNG QUÁT</h3>
              <p className="text-sm text-white/80 leading-relaxed">{detail.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                <h3 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-4">TÍNH NĂNG & TIỆN ÍCH</h3>
                <ul className="space-y-3">
                  {detail.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                <h3 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-4">ĐIỀU KIỆN ÁP DỤNG</h3>
                <p className="text-sm text-white/80 italic leading-relaxed">{detail.conditions}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end items-center px-4">
            <span className="text-[10px] text-white/40">Hiệu lực: {detail.lastUpdated}</span>
          </div>

          {detail.details && (
            <div className="mt-12 pt-12 border-t border-white/5 markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {detail.details}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Q&A Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-accent flex items-center gap-3">
              <div className="w-1 h-8 bg-brand-accent rounded-full"></div>
              KHÓ KHĂN NGHIỆP VỤ (Q&A)
            </h2>
            <div className="bg-[#003D2E]/50 border border-[#00A884]/30 px-3 py-1 rounded text-[10px] font-bold text-[#00A884] uppercase tracking-widest">
              {detail.qa?.length || 0} THẮC MẮC
            </div>
          </div>

          {detail.qa?.map((qa) => (
            <motion.div 
              key={qa.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-card/40 border border-white/5 rounded-xl p-6 space-y-4"
            >
              <div className="flex gap-4">
                <div className="text-brand-accent font-bold text-lg shrink-0">Q</div>
                <div className="font-bold text-white/90">{qa.question}</div>
              </div>
              {qa.answer && qa.answer !== "Cảm ơn bạn đã gửi thắc mắc. Chúng tôi sẽ phản hồi sớm nhất có thể." && (
                <div className="flex gap-4">
                  <div className="text-brand-accent font-bold text-lg shrink-0">A</div>
                  <div className="text-sm text-white/70 leading-relaxed">{qa.answer}</div>
                </div>
              )}
            </motion.div>
          ))}

          <div id="qa-form" className="bg-brand-card/20 border border-[#00A884]/20 rounded-xl p-8 space-y-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-bold text-[#00A884] uppercase tracking-widest flex items-center gap-2">
              GỬI THẮC MẮC NGHIỆP VỤ
            </h3>
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Câu hỏi / Vướng mắc</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Nhập nội dung thắc mắc về sản phẩm này..."
                    className="w-full h-32 bg-[#001F1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00A884]/50 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !question.trim()}
                  className="bg-[#4D5D26] hover:bg-[#5D6D36] text-[#A3B386] px-8 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'GỬI THẮC MẮC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
