import React, { useState, useMemo, useEffect } from 'react';
import { Printer, RotateCcw, FileText, Receipt as ReceiptIcon, Truck, History, CheckCircle2, MessageSquare, ChevronRight, Lock, X } from 'lucide-react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
}

interface CustomerInfo {
  name: string;
  zipCode: string;
  address: string;
}

interface OrderRecord {
  id: number;
  customer_name: string;
  zip_code: string;
  address: string;
  items: Record<number, number>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  created_at: string;
}

// --- Constants ---
const PRODUCTS: Product[] = [
  { id: 1, name: '①3mmポロン（1mx0.5m）', price: 5290 },
  { id: 2, name: '②2mmポロン（1mx0.5m）', price: 3790 },
  { id: 3, name: '③1mmポロン（1mx0.5m）', price: 2890 },
  { id: 4, name: '④アーチパッドS（24.5以下）', price: 780 },
  { id: 5, name: '⑤アーチパッドM（25-27.5）', price: 960 },
  { id: 6, name: '⑥アーチパッドL（27.5-）', price: 1090 },
  { id: 7, name: '⑦両面テープ 幅10cm長さ50m', price: 7190 },
  { id: 8, name: '⑧表面材（ブルー）0.94m × 0.76m', price: 4500 },
  { id: 9, name: '⑨表面材（ブラック）0.94m × 0.76m', price: 4500 },
  { id: 10, name: '⑩表面材（練習用）1m × 1m', price: 2440 },
  { id: 11, name: '⑪表面材（シンプル）11.5cm × 5m', price: 3541 },
  { id: 12, name: '⑫表面材（スポーツ）11.5cm × 5m', price: 5195 },
  { id: 13, name: '⑬グラインダー 交換ヤスリペーパー', price: 740 },
  { id: 14, name: '⑭裏張り（5mx12.5cm）', price: 3895 }
];

const SHIPPING_THRESHOLD = 50000;
const TAX_RATE = 0.1;

// --- Components ---

const Invoice = ({ customer, products, quantities, subtotal, tax, shipping, total, date }: any) => (
  <div className="p-8 bg-white text-black font-serif border border-gray-200 shadow-lg max-w-[210mm] mx-auto my-8 print:m-0 print:shadow-none print:border-none">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">請求書</h1>
        <p className="text-sm text-gray-500">Invoice</p>
      </div>
      <div className="text-right text-sm">
        <p className="font-bold mb-2">発行日: {date || new Date().toLocaleDateString('ja-JP')}</p>
        <div className="space-y-0.5">
          <p className="font-bold text-base">FOOT BUILDS</p>
          <p className="font-bold">神谷尚紀</p>
          <p>〒457-0007</p>
          <p>愛知県名古屋市南区駈上1-11-3</p>
          <p>グリーンパーク新瑞 1F</p>
          <p>TEL: 090-9180-3432</p>
          <p className="text-xs">naokikamiya1201@gmail.com</p>
        </div>
      </div>
    </div>

    <div className="mb-8">
      <p className="text-xl border-b-2 border-black pb-1 inline-block min-w-[200px]">
        {customer.name || customer.customer_name || '＿＿＿＿＿＿'} 様
      </p>
      <p className="mt-4 text-sm">下記の通り、ご請求申し上げます。</p>
    </div>

    <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
      <div className="flex justify-between items-end">
        <span className="text-lg">合計金額（税込）</span>
        <span className="text-3xl font-bold border-b-4 border-double border-black">
          ¥{total.toLocaleString()} -
        </span>
      </div>
    </div>

    <table className="w-full mb-8 border-collapse">
      <thead>
        <tr className="border-y-2 border-black bg-gray-100">
          <th className="py-2 px-3 text-left">品名</th>
          <th className="py-2 px-3 text-right">単価</th>
          <th className="py-2 px-3 text-center">数量</th>
          <th className="py-2 px-3 text-right">金額</th>
        </tr>
      </thead>
      <tbody>
        {products.filter((p: any) => (quantities[p.id] || 0) > 0).map((product: any) => (
          <tr key={product.id} className="border-b border-gray-200">
            <td className="py-2 px-3">{product.name}</td>
            <td className="py-2 px-3 text-right">¥{product.price.toLocaleString()}</td>
            <td className="py-2 px-3 text-center">{quantities[product.id]}</td>
            <td className="py-2 px-3 text-right">¥{(product.price * quantities[product.id]).toLocaleString()}</td>
          </tr>
        ))}
        {shipping > 0 ? (
          <tr className="border-b border-gray-200">
            <td className="py-2 px-3">送料</td>
            <td className="py-2 px-3 text-right">¥{shipping.toLocaleString()}</td>
            <td className="py-2 px-3 text-center">1</td>
            <td className="py-2 px-3 text-right">¥{shipping.toLocaleString()}</td>
          </tr>
        ) : shipping === 0 && total > 0 && (
          <tr className="border-b border-gray-200">
            <td className="py-2 px-3">送料</td>
            <td className="py-2 px-3 text-right">¥0</td>
            <td className="py-2 px-3 text-center">1</td>
            <td className="py-2 px-3 text-right">¥0 (送料無料)</td>
          </tr>
        )}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between">
          <span>小計</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>消費税 (10%)</span>
          <span>¥{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-black pt-2">
          <span>合計</span>
          <span>¥{total.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="mt-16 text-sm text-gray-600 border-t border-gray-100 pt-8">
      <div className="mb-4">
        <p className="font-bold text-black mb-1">【お振込先】</p>
        <p className="text-black">楽天銀行 ボレロ支店（店番:227）</p>
        <p className="text-black">普通 4821402 カミヤナオキ</p>
      </div>
      <p>※ 振込手数料は、お客様のご負担にてお願い申し上げます。</p>
    </div>
  </div>
);

const Receipt = ({ customer, total, date }: any) => (
  <div className="p-8 bg-white text-black font-serif border border-gray-200 shadow-lg max-w-[210mm] mx-auto my-8 print:m-0 print:shadow-none print:border-none">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold tracking-[0.5em] border-b-2 border-black inline-block px-8 pb-2">領収書</h1>
    </div>

    <div className="flex justify-between mb-12">
      <div className="text-xl border-b border-black pb-1 min-w-[300px]">
        {customer.name || customer.customer_name || '＿＿＿＿＿＿'} 様
      </div>
      <div className="text-right text-sm">
        <p className="mb-4">{date || new Date().toLocaleDateString('ja-JP')}</p>
        <div className="space-y-0.5">
          <p className="font-bold text-base">FOOT BUILDS</p>
          <p className="font-bold">神谷尚紀</p>
          <p>〒457-0007</p>
          <p>愛知県名古屋市南区駈上1-11-3</p>
          <p>グリーンパーク新瑞 1F</p>
          <p>TEL: 090-9180-3432</p>
        </div>
      </div>
    </div>

    <div className="text-center mb-12">
      <div className="inline-block border-4 border-double border-black p-6">
        <span className="text-2xl mr-4">金額</span>
        <span className="text-4xl font-bold">¥{total.toLocaleString()} -</span>
      </div>
    </div>

    <div className="mb-12 text-center">
      <p className="text-lg">但し、インソール材料費として正に領収いたしました。</p>
    </div>

    <div className="flex justify-end mt-16">
      <div className="text-right border-t border-black pt-4 min-w-[200px]">
        <p className="font-bold text-lg">材料販売係</p>
        <p className="text-xs text-gray-500 mt-4">印</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    zipCode: '',
    address: ''
  });

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    PRODUCTS.forEach(p => initial[p.id] = 0);
    return initial;
  });

  const [manualShipping, setManualShipping] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'order' | 'invoice' | 'receipt' | 'history'>('order');
  const [history, setHistory] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lineConfirmed, setLineConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const totals = useMemo(() => {
    const subtotal = PRODUCTS.reduce((acc, p) => acc + (p.price * (quantities[p.id] || 0)), 0);
    const tax = Math.floor(subtotal * TAX_RATE);
    const productTotal = subtotal + tax;
    const isFreeShipping = productTotal >= SHIPPING_THRESHOLD;
    const shipping = isFreeShipping ? 0 : manualShipping;
    const finalTotal = productTotal + shipping;

    return { subtotal, tax, productTotal, shipping, finalTotal, isFreeShipping };
  }, [quantities, manualShipping]);

  const handleQuantityChange = (id: number, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setQuantities(prev => ({ ...prev, [id]: num }));
  };

  const reset = () => {
    const initial: Record<number, number> = {};
    PRODUCTS.forEach(p => initial[p.id] = 0);
    setQuantities(initial);
    setManualShipping(0);
    setCustomerInfo({ name: '', zipCode: '', address: '' });
    setLineConfirmed(false);
  };

  const completeOrder = async () => {
    if (!customerInfo.name) {
      alert("宛名を入力してください");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          zipCode: customerInfo.zipCode,
          address: customerInfo.address,
          items: quantities,
          subtotal: totals.subtotal,
          tax: totals.tax,
          shipping: totals.shipping,
          total: totals.finalTotal
        })
      });
      if (res.ok) {
        setShowSuccess(true);
        reset();
        fetchHistory();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`サーバーエラーが発生しました。このアプリはNetlify等の静的ホスティングでは動作しません。サーバー機能のある環境（Render等）をご利用ください。\n詳細: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error("Failed to save order", e);
      alert("通信エラーが発生しました。サーバーが起動していないか、非対応のホスティング環境（Netlify等）の可能性があります。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateShipping = async (orderId: number, shipping: number) => {
    const order = history.find(o => o.id === orderId);
    if (!order) return;
    
    const newTotal = order.subtotal + order.tax + shipping;
    try {
      const res = await fetch(`/api/orders/${orderId}/shipping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping, total: newTotal })
      });
      if (res.ok) {
        fetchHistory();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...order, shipping, total: newTotal });
        }
      }
    } catch (e) {
      console.error("Failed to update shipping", e);
    }
  };

  const print = () => {
    window.print();
  };

  const handleHistoryClick = () => {
    if (isAuthenticated) {
      setViewMode('history');
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'naoki1201') {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setViewMode('history');
      setPasswordInput('');
    } else {
      alert('パスワードが違います');
    }
  };

  const hasItems = Object.values(quantities).some((q: number) => q > 0);
  const isCustomerInfoComplete = customerInfo.name.trim() !== '';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* Header - Hidden on print */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Material Order Pro</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setViewMode('order'); setSelectedOrder(null); setShowSuccess(false); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'order' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-stone-100'}`}
            >
              注文入力
            </button>
            <button
              onClick={handleHistoryClick}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'history' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-stone-100'}`}
            >
              <div className="flex items-center gap-1.5">
                {isAuthenticated ? <History size={14} /> : <Lock size={14} />}
                履歴
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {showSuccess ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-stone-900">注文完了しました</h2>
              <p className="text-stone-500 font-medium">ご注文ありがとうございます！</p>
            </div>
            
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <MessageSquare size={24} />
                <span className="font-black text-lg">重要なお願い</span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-bold">
                今すぐ下のボタンからLINEを開いて<br />
                <span className="text-xl underline decoration-amber-400 decoration-4 underline-offset-4">「注文しました」</span><br />
                とメッセージを送ってください。
              </p>
              <a
                href="https://lin.ee/nCWbbCW"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#06C755] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                <img src="https://www.line-website.com/social-plugins/img/line_logo_white.png" alt="LINE" className="w-5 h-5" />
                LINEで連絡する
              </a>
            </div>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200"
            >
              続けて注文する
            </button>
          </div>
        ) : viewMode === 'order' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Info Section */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="font-bold text-lg">お客様情報</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">宛名</label>
                    <input
                      type="text"
                      placeholder="個人名または職場の名称"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">郵便番号</label>
                    <input
                      type="text"
                      placeholder="000-0000"
                      value={customerInfo.zipCode}
                      onChange={e => setCustomerInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">住所</label>
                    <input
                      type="text"
                      placeholder="都道府県・市区町村・番地"
                      value={customerInfo.address}
                      onChange={e => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Products Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="font-bold text-lg">商品一覧</h2>
                  </div>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    <RotateCcw size={14} />
                    リセット
                  </button>
                </div>
                <div className="divide-y divide-stone-100">
                  {/* Desktop Header */}
                  <div className="hidden md:grid md:grid-cols-12 bg-stone-50 text-stone-500 border-b border-stone-100 px-6 py-3 text-xs font-bold uppercase tracking-wider">
                    <div className="col-span-6">商品名</div>
                    <div className="col-span-2 text-right">単価</div>
                    <div className="col-span-2 text-center">数量</div>
                    <div className="col-span-2 text-right">小計</div>
                  </div>

                  {/* Product Rows */}
                  {PRODUCTS.map(product => (
                    <div key={product.id} className="p-4 md:px-6 md:py-4 hover:bg-stone-50/50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-0 items-center">
                        {/* Product Name */}
                        <div className="md:col-span-6 font-bold md:font-medium text-stone-900">
                          {product.name}
                        </div>

                        {/* Price, Quantity, Subtotal Group for Mobile */}
                        <div className="grid grid-cols-3 md:contents items-center gap-2">
                          {/* Unit Price */}
                          <div className="md:col-span-2 text-left md:text-right">
                            <div className="text-[10px] md:hidden text-stone-400 font-bold uppercase">単価</div>
                            <div className="text-sm text-stone-600">¥{product.price.toLocaleString()}</div>
                          </div>

                          {/* Quantity Input */}
                          <div className="md:col-span-2 flex flex-col items-center">
                            <div className="text-[10px] md:hidden text-stone-400 font-bold uppercase mb-1">数量</div>
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={quantities[product.id] || ''}
                              onChange={e => handleQuantityChange(product.id, e.target.value)}
                              className="w-full max-w-[70px] md:max-w-none px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-center text-base md:text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="md:col-span-2 text-right">
                            <div className="text-[10px] md:hidden text-stone-400 font-bold uppercase">小計</div>
                            <div className="text-sm md:text-base font-black text-stone-900">
                              ¥{((quantities[product.id] || 0) * product.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="font-bold text-lg">注文内容</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-stone-500">
                    <span>商品小計</span>
                    <span>¥{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>消費税 (10%)</span>
                    <span>¥{totals.tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Truck size={16} />
                        <span className="text-sm font-medium">送料</span>
                      </div>
                      {totals.isFreeShipping ? (
                        <span className="text-emerald-600 font-bold text-sm">無料</span>
                      ) : (
                        <span className="text-stone-500 text-sm font-bold">送料別途</span>
                      )}
                    </div>
                    {!totals.isFreeShipping && (
                      <p className="text-[10px] text-stone-400 text-right">
                        5万円以上で送料無料 / 5万円未満は後ほど送料を加算します
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200">
                    <div className="flex justify-between items-end">
                      <span className="font-bold">合計金額</span>
                      <span className="text-2xl font-black text-emerald-600">¥{totals.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                      <div className="flex gap-3">
                        <MessageSquare className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          注文を確定したら、LINEで<span className="font-black text-amber-900 underline">「注文しました」</span>と必ず連絡してください！
                        </p>
                      </div>
                      <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={lineConfirmed}
                          onChange={e => setLineConfirmed(e.target.checked)}
                          className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-stone-700">LINEで連絡することを約束します</span>
                      </label>
                    </div>

                    <button
                      onClick={completeOrder}
                      disabled={isSubmitting || !lineConfirmed || !isCustomerInfoComplete || !hasItems}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={24} />
                      注文を確定する
                    </button>
                    
                    <div className="space-y-1">
                      {!hasItems && (
                        <p className="text-[10px] text-center text-amber-600 font-bold">
                          ⚠️ 商品を選択してください
                        </p>
                      )}
                      {!isCustomerInfoComplete && (
                        <p className="text-[10px] text-center text-red-500 font-bold">
                          ⚠️ 宛名を入力してください
                        </p>
                      )}
                      {hasItems && isCustomerInfoComplete && !lineConfirmed && (
                        <p className="text-[10px] text-center text-amber-600 font-bold">
                          ⚠️ LINE連絡の確認にチェックを入れてください
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : viewMode === 'history' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="font-bold text-xl">注文履歴</h2>
            </div>

            {selectedOrder ? (
              <div className="space-y-8">
                <div className="flex justify-center gap-4 print:hidden">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center gap-2 px-6 py-2 bg-stone-200 text-stone-700 rounded-full font-bold hover:bg-stone-300 transition-all"
                  >
                    <RotateCcw size={18} />
                    履歴一覧に戻る
                  </button>
                  <button
                    onClick={print}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    <Printer size={18} />
                    PDF保存 / 印刷
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
                  <div className="lg:col-span-1 space-y-4 print:hidden">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold mb-4 text-stone-500 text-xs uppercase tracking-widest">送料の更新</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={selectedOrder.shipping}
                            onBlur={(e) => updateShipping(selectedOrder.id, parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-sm">円</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {[1500, 2000].map(amt => (
                            <button
                              key={amt}
                              onClick={() => updateShipping(selectedOrder.id, amt)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${selectedOrder.shipping === amt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-500'}`}
                            >
                              {amt.toLocaleString()}円
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-stone-400">送料を更新すると、下の書類に即座に反映されます。</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-12">
                    <Invoice
                      customer={selectedOrder}
                      products={PRODUCTS}
                      quantities={selectedOrder.items}
                      subtotal={selectedOrder.subtotal}
                      tax={selectedOrder.tax}
                      shipping={selectedOrder.shipping}
                      total={selectedOrder.total}
                      date={new Date(selectedOrder.created_at).toLocaleDateString('ja-JP')}
                    />
                    <Receipt
                      customer={selectedOrder}
                      total={selectedOrder.total}
                      date={new Date(selectedOrder.created_at).toLocaleDateString('ja-JP')}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-200 border-dashed">
                    <History className="mx-auto text-stone-300 mb-4" size={48} />
                    <p className="text-stone-400 font-medium">注文履歴はまだありません</p>
                  </div>
                ) : (
                  history.map(order => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          {new Date(order.created_at).toLocaleDateString('ja-JP')}
                        </span>
                        <ChevronRight className="text-stone-300 group-hover:text-emerald-500 transition-colors" size={16} />
                      </div>
                      <h3 className="font-bold text-lg mb-1 truncate">{order.customer_name} 様</h3>
                      <p className="text-xs text-stone-500 mb-4 truncate">{order.address || '住所未入力'}</p>
                      <div className="flex justify-between items-end pt-4 border-t border-stone-50">
                        <div className="text-[10px] text-stone-400">
                          {Object.values(order.items).reduce((a: number, b: number) => a + b, 0)}点の商品
                        </div>
                        <div className="text-xl font-black text-emerald-600">
                          ¥{order.total.toLocaleString()}
                        </div>
                      </div>
                      {order.shipping === 0 && (order.subtotal as number) + (order.tax as number) < SHIPPING_THRESHOLD && (
                        <div className="mt-3 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <Truck size={10} />
                          送料未入力
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center gap-4 print:hidden">
              <button
                onClick={() => setViewMode('order')}
                className="flex items-center gap-2 px-6 py-2 bg-stone-200 text-stone-700 rounded-full font-bold hover:bg-stone-300 transition-all"
              >
                <RotateCcw size={18} />
                戻る
              </button>
              <button
                onClick={print}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                <Printer size={18} />
                PDF保存 / 印刷
              </button>
            </div>

            <div className="print:m-0">
              {viewMode === 'invoice' && (
                <Invoice
                  customer={customerInfo}
                  products={PRODUCTS}
                  quantities={quantities}
                  subtotal={totals.subtotal}
                  tax={totals.tax}
                  shipping={totals.shipping}
                  total={totals.finalTotal}
                />
              )}
              {viewMode === 'receipt' && (
                <Receipt
                  customer={customerInfo}
                  total={totals.finalTotal}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer - Hidden on print */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-200 py-3 px-4 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-xs text-stone-400">
            © {new Date().getFullYear()} Material Order Pro
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${hasItems ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
              <span className="text-xs font-bold text-stone-600">{hasItems ? '注文作成中' : '待機中'}</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}</style>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">管理者認証</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <p className="text-sm text-stone-500">履歴を表示するにはパスワードを入力してください。</p>
              <input
                type="password"
                autoFocus
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="パスワード"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                認証
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
