import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Heart, Search, Settings, Home, Layers, User, 
  ChevronLeft, Plus, X, SkipForward, SkipBack, Zap, ExternalLink,
  ChevronDown, FolderPlus, Folder, MoreVertical, Headphones, Clock, Check,
  Trash2, History, ChevronRight, Share2, Sliders, FileText, Edit2, Move,
  ArrowUp, ArrowDown, Info, Wand2
} from 'lucide-react';

// --- 常量資料 ---
const DAYS_OF_WEEK = ["一", "二", "三", "四", "五", "六", "日"];

const INTEREST_DATA = {
  "財經": ["股市", "基金", "房地產", "虛擬貨幣"],
  "科技": ["人工智慧", "半導體", "智慧型手機", "電動車"],
  "體育": ["中職", "NBA", "歐冠", "網球"],
  "生活": ["美食", "旅遊", "健康", "星座"],
  "國際": ["地緣主題", "歐盟動態", "東南亞", "美國大選"]
};

const MOCK_NEWS = [
  { id: 1, title: "台積電 2026 資本支出上看 7200 億美元", source: "中央社", date: "2026-05-04", category: "財經", ai_tags: ["2奈米", "先進製程"], content: "台積電將成為 AI 浪潮下最大受益者。分析師指出，2奈米製程訂單已滿，且全球擴廠計畫順利進展中..." },
  { id: 2, title: "AI 晶片需求爆發，輝達市值再創新高", source: "商業周刊", date: "2026-05-04", category: "科技", ai_tags: ["GPU", "硬體需求"], content: "隨著大型語言模型普及，硬體需求仍未見頂。輝達執行長強調，未來的運算將是自動化的、分布式的..." },
  { id: 3, title: "中職開季熱潮：大巨蛋場次一票難求", source: "體育時報", date: "2026-05-03", category: "體育", ai_tags: ["台北大巨蛋", "中職"], content: "職棒熱度回升，室內場館成為球迷首選。這也帶動了周邊商品與門票收入的大幅增長..." },
  { id: 4, title: "全球 AI 監管趨勢：歐盟通過最新法案", source: "公視新聞", date: "2026-05-03", category: "國際", ai_tags: ["AI法案", "法規保護"], content: "法律框架正式確立，開發商需遵守更嚴格的透明度規範，確保人工智慧技術不會威脅人權..." },
  { id: 5, title: "新一代摺疊機發佈，關鍵技術在轉軸", source: "科技新報", date: "2026-05-02", category: "科技", ai_tags: ["摺疊手機", "硬體"], content: "摺疊手機市場競爭白熱化，厚度與耐用度成為消費者考量的主要因素，台系供應鏈積極卡位..." },
];

export default function App() {
  // --- 狀態管理 ---
  const [page, setPage] = useState('login');
  const [isRegistered, setIsRegistered] = useState(false); 
  const [user, setUser] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginInput, setLoginInput] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [playerReferrer, setPlayerReferrer] = useState('home');

  // 興趣
  const [selectedCats, setSelectedCats] = useState([]); 
  const [selectedSubs, setSelectedSubs] = useState([]); 
  const [customInterests, setCustomInterests] = useState([]);
  const [expandedCats, setExpandedCats] = useState([]);
  const [interestInput, setInterestInput] = useState('');

  // 搜尋
  const [searchKey, setSearchKey] = useState('');
  const [browseFilter, setBrowseFilter] = useState('全部');

  // 情境模板
  const [templates, setTemplates] = useState([
    { id: 1, name: "早晨通勤", emoji: "☀️", time: "07:30", duration: "15 min", types: ["財經", "科技"], active: true, status: "READY", articles: [1, 2, 5], days: ["一", "二", "三", "四", "五"] },
    { id: 2, name: "午休快訊", emoji: "🍱", time: "12:00", duration: "10 min", types: ["國際", "科技"], active: true, status: "PENDING", articles: [4, 5], days: ["一", "三", "五"] },
  ]);
  const [tempTemplate, setNewTemp] = useState({ id: null, name: '', time: '08:00', duration: 15, types: [], style: '輕鬆聊天', days: ["一", "二", "三", "四", "五"] });
  const [errorHint, setErrorHint] = useState('');

  // 收藏夾
  const [favorites, setFavorites] = useState([1, 2, 3, 4, 5]);
  const [folders, setFolders] = useState(["預設收藏", "期末專案", "股市筆記", "已生成播客新聞"]);
  const [articleToFolder, setArticleToFolder] = useState({ 1: "預設收藏", 2: "預設收藏", 3: "期末專案", 4: "預設收藏", 5: "股市筆記" }); 
  const [collapsedFolders, setCollapsedFolders] = useState([]);
  const [showFolderSheet, setShowFolderSheet] = useState(null); 
  const [selectedForGen, setSelectedForGen] = useState([]);

  // 彈窗
  const [articleDetail, setArticleDetail] = useState(null);
  const [previewSchedule, setPreviewSchedule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', data: null, titleText: '', subText: '' });
  const [showFolderEditor, setShowFolderEditor] = useState({ isOpen: false, mode: '', originalName: '', inputName: '' });
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualAddFolder, setManualAddFolder] = useState(null); 

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);

  // 收聽紀錄
  const [playHistory, setHistory] = useState([
    { id: 101, title: "週末體育與科技特輯", date: "5月3日", progress: 65, duration: "12:00", emoji: "🎧" },
    { id: 102, title: "國際局勢深度分析", date: "5月2日", progress: 100, duration: "18:30", emoji: "🌍" },
  ]);

  // --- 導覽邏輯 ---
  const navigate = (p) => {
    if (p === 'player') setPlayerReferrer(page);
    setPage(p);
    setErrorHint('');
  };

  // --- 邏輯函數 ---
  const handleRegister = () => {
    if (!user.name || !user.password) return alert("請填寫稱呼與密碼");
    if (user.password !== user.confirmPassword) return alert("密碼與確認密碼不一致");
    navigate('interests');
  };

  const handleLogin = () => {
    if (isRegistered && loginInput.password === user.password) navigate('home');
    else setLoginError('密碼錯誤或尚未註冊');
  };

  const toggleCategory = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
      const subsOfCat = INTEREST_DATA[cat] || [];
      setSelectedSubs(selectedSubs.filter(s => !subsOfCat.includes(s)));
      setExpandedCats(expandedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
      setExpandedCats([...expandedCats, cat]);
    }
  };

  const toggleSub = (cat, sub) => {
    if (!selectedCats.includes(cat)) setSelectedCats([...selectedCats, cat]);
    setSelectedSubs(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const addCustomInterest = () => {
    const term = interestInput.trim();
    if (term && !customInterests.includes(term)) {
      setCustomInterests([...customInterests, term]);
      setInterestInput('');
    } else if (customInterests.includes(term)) alert("此標籤已存在！");
  };

  const moveType = (index, direction) => {
    const newTypes = [...tempTemplate.types];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTypes.length) return;
    [newTypes[index], newTypes[targetIndex]] = [newTypes[targetIndex], newTypes[index]];
    setNewTemp({ ...tempTemplate, types: newTypes });
  };

  const toggleDay = (day) => {
    const nextDays = tempTemplate.days.includes(day) 
      ? tempTemplate.days.filter(d => d !== day) 
      : [...tempTemplate.days, day];
    setNewTemp({ ...tempTemplate, days: nextDays });
  };

  const saveNewTemplate = () => {
    if (!tempTemplate.name) { setErrorHint('請輸入情境名稱'); return; }
    if (tempTemplate.types.length === 0) { setErrorHint('請至少選擇一個新聞領域'); return; }
    
    if (tempTemplate.id) {
      setTemplates(templates.map(t => t.id === tempTemplate.id ? {
        ...t, name: tempTemplate.name, time: tempTemplate.time,
        duration: `${tempTemplate.duration} min`, types: tempTemplate.types, days: tempTemplate.days
      } : t));
    } else {
      setTemplates([...templates, {
        id: Date.now(), name: tempTemplate.name, emoji: "🎙️", time: tempTemplate.time,
        duration: `${tempTemplate.duration} min`, types: tempTemplate.types,
        active: true, status: "PENDING", articles: [1, 2], days: tempTemplate.days
      }]);
    }
    setNewTemp({ id: null, name: '', time: '08:00', duration: 15, types: [], style: '輕鬆聊天', days: ["一", "二", "三", "四", "五"] });
    navigate('templates');
  };

  const editTemplate = (t) => {
    setNewTemp({
      id: t.id, name: t.name, time: t.time, duration: parseInt(t.duration) || 15,
      types: t.types || [], style: '輕鬆聊天', days: t.days || ["一", "二", "三", "四", "五"]
    });
    navigate('new-template');
  };

  const startGeneratingPod = () => {
    const newId = Date.now();
    const generatingPod = {
      id: newId, name: "手動選取特輯", emoji: "⚡", time: "即時", duration: "5 min",
      types: ["手動選取"], active: true, status: "GENERATING", articles: [...selectedForGen], days: []
    };
    
    setTemplates([generatingPod, ...templates]);
    navigate('home');
    
    setTimeout(() => {
      setTemplates(current => current.map(t => t.id === newId ? { ...t, status: "READY" } : t));
      const updatedArticleMap = { ...articleToFolder };
      selectedForGen.forEach(id => { updatedArticleMap[id] = "已生成播客新聞"; });
      setArticleToFolder(updatedArticleMap);
      setSelectedForGen([]);
    }, 4000);
  };

  const deleteFolderFinal = (mode) => {
    const folderName = confirmDialog.data;
    if (mode === 'move') {
      const updated = { ...articleToFolder };
      for (const [id, f] of Object.entries(updated)) { if (f === folderName) updated[id] = '預設收藏'; }
      setArticleToFolder(updated);
    } else if (mode === 'purge') {
      const idsToRemove = Object.keys(articleToFolder).filter(id => articleToFolder[id] === folderName).map(Number);
      setFavorites(favorites.filter(id => !idsToRemove.includes(id)));
    }
    setFolders(folders.filter(f => f !== folderName));
    setConfirmDialog({ isOpen: false });
  };

  const submitFolderAction = () => {
    const { mode, originalName, inputName } = showFolderEditor;
    if (!inputName.trim()) return alert("名稱不能為空");
    if (mode === 'add') setFolders([...folders, inputName.trim()]);
    else {
      setFolders(folders.map(f => f === originalName ? inputName.trim() : f));
      const updated = { ...articleToFolder };
      for (let k in updated) { if (updated[k] === originalName) updated[k] = inputName.trim(); }
      setArticleToFolder(updated);
    }
    setShowFolderEditor({ isOpen: false, mode: '', originalName: '', inputName: '' });
  };

  // --- UI 元件 ---
  const BottomNav = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 border-t flex justify-around py-3 pb-8 px-2 z-40 shadow-lg">
      {[
        { id: 'home', icon: Home, label: '首頁' },
        { id: 'browse', icon: Search, label: '瀏覽' },
        { id: 'templates', icon: Layers, label: '情境' },
        { id: 'favorites', icon: Heart, label: '收藏' },
        { id: 'profile', icon: User, label: '個人' }
      ].map(item => (
        <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center transition-all ${page === item.id ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}>
          <item.icon size={22} strokeWidth={page === item.id ? 3 : 2} />
          <span className="text-[10px] mt-1 font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex justify-center items-center bg-slate-300 min-h-screen p-4 font-sans">
      <div className="w-[390px] h-[844px] bg-white rounded-[55px] shadow-2xl relative overflow-hidden border-[8px] border-gray-900">
        
        {/* Notch */}
        <div className="h-11 w-full flex justify-center items-end pb-1 relative z-50"><div className="w-32 h-7 bg-black rounded-full"></div></div>

        {/* Content Area */}
        <div className="h-[calc(100%-44px)] overflow-y-auto no-scrollbar relative z-10">
          
          {/* 1. 登入 */}
          {page === 'login' && (
            <div className="p-8 h-full flex flex-col justify-center animate-in fade-in">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl"><Headphones size={40} /></div>
                <h1 className="text-3xl font-black text-indigo-900 tracking-tight">AudioCraft</h1>
                <p className="text-indigo-400 font-medium">聽見專屬你的世界</p>
              </div>
              <div className="space-y-4">
                <input value={loginInput.email} onChange={e=>setLoginInput({...loginInput, email: e.target.value})} type="email" placeholder="Email" className="w-full p-4 rounded-2xl bg-gray-50 border outline-none" />
                <input value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} type="password" placeholder="輸入密碼" className="w-full p-4 rounded-2xl bg-gray-50 border outline-none" />
                {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
                <button onClick={handleLogin} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95">登入</button>
              </div>
              <button onClick={() => navigate('register')} className="mt-12 text-center text-sm font-bold text-gray-400">還沒有帳號？ <span className="text-indigo-600 underline">立即註冊</span></button>
            </div>
          )}

          {/* 2. 註冊 */}
          {page === 'register' && (
            <div className="p-8 pt-12 h-full flex flex-col animate-in fade-in">
              <button onClick={() => navigate('login')} className="mb-4 text-gray-400"><ChevronLeft size={24}/></button>
              <h2 className="text-3xl font-black mb-8 tracking-tight">建立帳號</h2>
              <div className="space-y-4 flex-1">
                <input value={user.name} onChange={e => setUser({...user, name: e.target.value})} type="text" placeholder="你的稱呼" className="w-full p-4 rounded-2xl bg-gray-50 outline-none border border-transparent focus:border-indigo-200" />
                <input value={user.email} onChange={e => setUser({...user, email: e.target.value})} type="email" placeholder="Email" className="w-full p-4 rounded-2xl bg-gray-50 outline-none" />
                <input value={user.password} onChange={e => setUser({...user, password: e.target.value})} type="password" placeholder="設定密碼" className="w-full p-4 rounded-2xl bg-gray-50 outline-none border border-transparent focus:border-indigo-300" />
                <input value={user.confirmPassword} onChange={e => setUser({...user, confirmPassword: e.target.value})} type="password" placeholder="確認密碼" className={`w-full p-4 rounded-2xl bg-gray-50 outline-none border ${user.confirmPassword && user.password !== user.confirmPassword ? 'border-red-300' : 'border-transparent'}`} />
              </div>
              <button onClick={handleRegister} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg mt-6">下一步：選擇興趣</button>
            </div>
          )}

          {/* 3. 興趣選擇 */}
          {page === 'interests' && (
            <div className="p-8 pt-12 h-full flex flex-col animate-in fade-in">
              <button onClick={() => isRegistered ? navigate('profile') : navigate('register')} className="mb-4 text-gray-400"><ChevronLeft size={24}/></button>
              <h2 className="text-3xl font-black mb-2 tracking-tight">探索興趣</h2>
              <p className="text-gray-400 mb-8 font-medium italic text-xs">大標取消時將一併清除下屬標籤</p>
              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-10">
                <div className="flex gap-2">
                  <input value={interestInput} onChange={e=>setInterestInput(e.target.value)} type="text" placeholder="自訂關鍵字..." className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none" />
                  <button onClick={addCustomInterest} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-md"><Plus/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customInterests.map(c => (<span key={c} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center shadow-sm">#{c} <X size={12} className="ml-2 cursor-pointer" onClick={() => setCustomInterests(customInterests.filter(i=>i!==c))}/></span>))}
                </div>
                {Object.keys(INTEREST_DATA).map(cat => (
                  <div key={cat} className="space-y-3">
                    <button onClick={() => toggleCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-sm border transition-all ${selectedCats.includes(cat) ? 'bg-indigo-600 text-white shadow-md border-indigo-600' : 'bg-white text-gray-500 border-gray-100'}`}>{cat} {selectedCats.includes(cat) && <Check size={14} className="inline ml-1"/>}</button>
                    {expandedCats.includes(cat) && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-[28px] border border-gray-100 animate-in slide-in-from-top-2">
                        {INTEREST_DATA[cat].map(sub => (<button key={sub} onClick={() => toggleSub(cat, sub)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedSubs.includes(sub) ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>{sub}</button>))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => isRegistered ? navigate('profile') : navigate('templates')} disabled={selectedCats.length === 0} className={`w-full py-4 rounded-2xl font-black shadow-xl mt-4 ${selectedCats.length > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{isRegistered ? '確認變更' : '下一步：設定排程'}</button>
            </div>
          )}

          {/* 4. 情境管理列表 */}
          {page === 'templates' && (
            <div className="p-6 pt-12 h-full flex flex-col animate-in fade-in pb-24">
              <h2 className="text-3xl font-black mb-2 tracking-tight">情境管理</h2>
              <p className="text-gray-400 mb-8 text-xs font-bold">點擊卡片可編輯排程細節</p>
              <div className="space-y-4 flex-1">
                {templates.map(tmp => (
                  <div key={tmp.id} onClick={()=>editTemplate(tmp)} className="p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 shadow-sm bg-white active:bg-indigo-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{tmp.emoji}</span>
                        <div><h4 className="font-bold text-gray-800">{tmp.name}</h4><p className="text-[10px] text-gray-400 font-bold uppercase">{tmp.time} • {tmp.duration}</p></div>
                      </div>
                      <div onClick={(e) => { e.stopPropagation(); setTemplates(templates.map(t => t.id === tmp.id ? {...t, active: !t.active} : t)); }} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${tmp.active ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${tmp.active ? 'translate-x-5' : 'translate-x-0'}`}></div></div>
                    </div>
                    <div className="flex gap-1 justify-between border-t border-gray-50 pt-2">{DAYS_OF_WEEK.map(d => (<div key={d} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${tmp.days?.includes(d) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-200'}`}>{d}</div>))}</div>
                  </div>
                ))}
                <button onClick={() => { setNewTemp({ id: null, name: '', time: '08:00', duration: 15, types: [], style: '輕鬆聊天', days: ["一", "二", "三", "四", "五"] }); navigate('new-template'); }} className="w-full p-5 rounded-3xl border-2 border-dashed border-indigo-200 text-indigo-400 font-bold flex items-center justify-center active:bg-indigo-50 mt-4"><Plus size={20} className="mr-2"/> 新增自訂情境</button>
              </div>
              {!isRegistered && <button onClick={() => { setIsRegistered(true); navigate('home'); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl mt-4">完成設定，開始使用</button>}
            </div>
          )}

          {/* 5. 新增/編輯情境 */}
          {page === 'new-template' && (
            <div className="p-8 pt-12 h-full flex flex-col animate-in fade-in">
              <button onClick={() => navigate('templates')} className="mb-4 text-gray-400"><ChevronLeft size={24}/></button>
              <h2 className="text-3xl font-black mb-8 tracking-tight">{tempTemplate.id ? '編輯情境' : '新增情境'}</h2>
              <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10">
                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">情境名稱</label><input value={tempTemplate.name} onChange={e=>{setNewTemp({...tempTemplate, name: e.target.value}); setErrorHint('')}} type="text" placeholder="例如：通勤早報" className={`w-full bg-gray-50 p-4 rounded-2xl outline-none border transition-all ${errorHint === '請輸入情境名稱' ? 'border-red-300' : 'border-transparent focus:border-indigo-100'}`} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2">目標時間</label><input value={tempTemplate.time} onChange={e=>setNewTemp({...tempTemplate, time: e.target.value})} type="time" className="w-full bg-gray-50 p-4 rounded-2xl outline-none" /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2">預計時長</label><select value={tempTemplate.duration} onChange={e=>setNewTemp({...tempTemplate, duration: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none appearance-none font-bold">{[...Array(60)].map((_, i) => <option key={i+1} value={i+1}>{i+1} min</option>)}</select></div>
                </div>
                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-3">執行週期</label><div className="flex justify-between">{DAYS_OF_WEEK.map(d => (<button key={d} onClick={() => toggleDay(d)} className={`w-10 h-10 rounded-full font-black text-xs transition-all border ${tempTemplate.days.includes(d) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}>{d}</button>))}</div></div>
                <div><label className={`text-[10px] font-black uppercase block mb-2 tracking-widest ${errorHint === '請至少選擇一個新聞領域' ? 'text-red-500 font-black' : 'text-gray-400'}`}>優先領域排序 (必選)</label><div className="flex flex-wrap gap-2 mb-4">{selectedCats.map(cat => (<button key={cat} onClick={() => !tempTemplate.types.includes(cat) && setNewTemp({...tempTemplate, types: [...tempTemplate.types, cat], errorHint: ''})} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${tempTemplate.types.includes(cat) ? 'bg-indigo-50 border-indigo-200 text-indigo-300' : 'bg-white border-gray-200 text-gray-500'}`}>{cat}</button>))}</div>
                  <div className="space-y-3">{tempTemplate.types.map((type, idx) => (<div key={type} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"><div className="flex items-center gap-3"><span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span><span className="font-bold text-gray-700">{type}</span></div><div className="flex gap-2 text-gray-400"><button onClick={()=>moveType(idx, 'up')} className="p-1 active:text-indigo-600"><ArrowUp size={16}/></button><button onClick={()=>moveType(idx, 'down')} className="p-1 active:text-indigo-600"><ArrowDown size={16}/></button><button onClick={()=>setNewTemp({...tempTemplate, types: tempTemplate.types.filter(t=>t!==type)})} className="p-1 active:text-red-400"><X size={16}/></button></div></div>))}</div>
                </div>
                {errorHint && <p className="text-red-400 text-xs font-bold animate-pulse text-center">⚠️ {errorHint}</p>}
              </div>
              <button onClick={saveNewTemplate} className="w-full bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-all">{tempTemplate.id ? '儲存變更' : '建立排程'}</button>
            </div>
          )}

          {/* 6. 首頁 */}
          {page === 'home' && (
            <div className="p-6 pt-12 animate-in fade-in pb-24">
              <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black text-indigo-900 tracking-tighter">Hi, {user.name || '新用戶'}</h2><button onClick={() => navigate('profile')} className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-600 shadow-inner">{user.name[0] || '?'}</button></div>
              <div className="mb-10"><h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[2px]">最新播客</h3>
                {templates.filter(t => t.status === 'READY' || t.status === 'GENERATING').map(t => (
                  <div key={t.id} className={`${t.status === 'READY' ? 'bg-indigo-600' : 'bg-slate-800'} rounded-[36px] p-6 text-white shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer mb-4`} onClick={() => t.status === 'READY' && navigate('player')}>
                    <div className={`absolute -right-6 -top-6 w-32 h-32 ${t.status === 'READY' ? 'bg-white/10' : 'bg-indigo-500/10'} rounded-full`}></div>
                    <div className="relative z-10"><span className={`${t.status === 'READY' ? 'bg-white/20' : 'bg-amber-500/20 text-amber-400'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>{t.status === 'READY' ? `Ready at ${t.time}` : '正在轉譯中...'}</span>
                      <h3 className="text-2xl font-black mt-4">{t.name}專刊</h3>
                      <div className="mt-8 flex items-center">{t.status === 'READY' ? (<div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Play fill="currentColor" size={24}/></div>) : (<div className="w-12 h-12 bg-slate-700 text-amber-500 rounded-2xl flex items-center justify-center animate-pulse"><Clock size={24}/></div>)}
                        <div className="ml-4"><p className={`text-xs font-bold ${t.status === 'READY' ? 'text-indigo-100' : 'text-slate-400'}`}>{t.status === 'READY' ? `已自動整合 ${t.articles?.length || 0} 篇新聞` : '整合新聞與 AI 語音轉譯中'}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div><h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[2px]">提前準備中</h3><div className="space-y-3">{templates.filter(t => t.status === 'PENDING').map(t => (<div key={t.id} onClick={() => setPreviewSchedule(t)} className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors shadow-sm"><div className="flex items-center"><div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-amber-500 mr-4 animate-pulse"><Clock size={20}/></div><div><h4 className="font-bold text-gray-800 text-sm">{t.name}</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">預計 {t.time} 就緒</p></div></div><ChevronRight size={16} className="text-gray-300" /></div>))}</div></div>
            </div>
          )}

          {/* 7. 瀏覽 */}
          {page === 'browse' && (
            <div className="p-6 pt-12 h-full flex flex-col animate-in fade-in pb-24">
              <div className="mb-8 space-y-4"><div className="relative"><Search className="absolute left-4 top-4 text-gray-300" size={20}/><input value={searchKey} onChange={e=>setSearchKey(e.target.value)} type="text" placeholder="搜尋台積電、AI..." className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none" /></div><div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{['全部', '財經', '科技', '體育', '國際'].map(f => (<button key={f} onClick={() => setBrowseFilter(f)} className={`px-5 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${browseFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400'}`}>{f}</button>))}</div></div>
              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                {MOCK_NEWS.filter(n => (browseFilter === '全部' || n.category === browseFilter) && n.title.includes(searchKey)).map(news => (
                  <div key={news.id} onClick={() => setArticleDetail(news)} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm relative active:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3"><div className="flex gap-1 flex-wrap"><span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{news.category}</span>{news.ai_tags.map(t => <span key={t} className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded">#{t}</span>)}</div>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        const title = news.title;
                        if(favorites.includes(news.id)) { 
                          setConfirmDialog({ isOpen: true, type: 'unfav', data: news.id, titleText: title }); 
                        } else { 
                          setShowFolderSheet(news.id); 
                        } 
                      }} className="p-1"><Heart size={22} className={favorites.includes(news.id) ? "fill-red-500 text-red-500" : "text-gray-300"} /></button>
                    </div><h4 className="font-bold text-gray-800 leading-tight mb-2 pr-4">{news.title}</h4><p className="text-[10px] text-gray-400 font-bold uppercase">{news.source} • {news.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. 收藏夾 */}
          {page === 'favorites' && (
            <div className="p-6 pt-12 h-full flex flex-col animate-in fade-in pb-24">
              <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black tracking-tight">我的收藏庫</h2><button onClick={()=>setShowFolderEditor({isOpen: true, mode: 'add', inputName: '', originalName: ''})} className="text-indigo-600 p-2 bg-indigo-50 rounded-full shadow-sm"><FolderPlus size={20}/></button></div>
              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                {[...folders.filter(f=>f!=='已生成播客新聞'), ...folders.filter(f=>f==='已生成播客新聞')].map(folder => (
                  <div key={folder} className={`p-2 rounded-[32px] border ${folder === '已生成播客新聞' ? 'bg-amber-50 border-amber-100 shadow-inner' : 'bg-gray-50/50 border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center cursor-pointer" onClick={() => setCollapsedFolders(prev => prev.includes(folder) ? prev.filter(f=>f!==folder) : [...prev, folder])}>
                        <Folder className={`mr-3 ${collapsedFolders.includes(folder) ? 'text-gray-300' : (folder === '已生成播客新聞' ? 'text-amber-500' : 'text-indigo-400')}`} fill="currentColor" size={18}/><h3 className={`font-bold text-sm ${folder === '已生成播客新聞' ? 'text-amber-700' : 'text-gray-800'}`}>{folder}</h3>
                        <span className="ml-2 text-[10px] bg-white text-gray-400 px-2 py-0.5 rounded-full font-black">{Object.keys(articleToFolder).filter(id => articleToFolder[id] === folder && favorites.includes(parseInt(id))).length}</span>
                      </div>
                      <div className="flex gap-2">
                        {folder !== '預設收藏' && folder !== '已生成播客新聞' && (
                          <><button onClick={()=>setShowFolderEditor({isOpen: true, mode: 'rename', originalName: folder, inputName: folder})} className="text-gray-300 p-1"><Edit2 size={14}/></button>
                            <button onClick={()=>setConfirmDialog({isOpen: true, type: 'deleteFolder', data: folder, titleText: folder})} className="text-gray-300 hover:text-red-400 transition-colors p-1"><Trash2 size={14}/></button></>
                        )}
                      </div>
                    </div>
                    {!collapsedFolders.includes(folder) && (
                      <div className="mt-2 space-y-2 px-2 pb-2">
                        {MOCK_NEWS.filter(n => articleToFolder[n.id] === folder && favorites.includes(n.id)).map(news => (
                          <div key={news.id} className="bg-white p-3 rounded-2xl flex items-center shadow-sm active:scale-[0.98] transition-all">
                             <input type="checkbox" checked={selectedForGen.includes(news.id)} onChange={()=>setSelectedForGen(prev => prev.includes(news.id) ? prev.filter(i=>i!==news.id) : [...prev, news.id])} className="w-5 h-5 rounded-full accent-indigo-600 mr-3 border-gray-200" />
                             <p onClick={()=>setArticleDetail(news)} className="text-xs font-bold truncate flex-1 cursor-pointer text-gray-700">{news.title}</p>
                             <button onClick={()=>setShowFolderSheet(news.id)} className="text-gray-300 ml-2 p-1"><Move size={16}/></button>
                             <button onClick={() => setConfirmDialog({ isOpen: true, type: 'unfav', data: news.id, titleText: news.title })} className="text-red-300 ml-2 p-1"><Heart size={14} fill="currentColor"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedForGen.length > 0 && (
                <div className="absolute bottom-24 left-6 right-6 animate-in slide-in-from-bottom-5 z-50">
                   <div className="bg-white p-4 rounded-[32px] shadow-2xl border border-indigo-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center px-2">
                         <p className="text-xs font-black text-indigo-600">已選取 {selectedForGen.length} 篇素材</p>
                         <button onClick={()=>setSelectedForGen([])} className="text-gray-300"><X size={16}/></button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, type: 'bulkGen', data: selectedForGen, titleText: `這 ${selectedForGen.length} 篇新聞`, subText: '整合選中的新聞並生成一次性的專屬特輯。' })} 
                          className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                        >
                          <Wand2 size={16}/> 製作特輯
                        </button>
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, type: 'bulkUnfav', data: selectedForGen, titleText: `這 ${selectedForGen.length} 篇新聞`, subText: '將選中的新聞從收藏庫中移除。' })}
                          className="px-6 bg-red-50 text-red-600 font-black py-4 rounded-3xl flex items-center justify-center active:scale-95 transition-all"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* 9. 個人中心 */}
          {page === 'profile' && (
            <div className="p-6 pt-12 h-full flex flex-col animate-in fade-in pb-24">
              <div className="text-center mb-10"><div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-600 font-black text-3xl shadow-inner border-4 border-white shadow-indigo-100">{user.name[0] || '?'}</div><h2 className="text-2xl font-black text-indigo-900 tracking-tight">{user.name || '未登入'}</h2></div>
              <div className="space-y-3 flex-1">
                <button onClick={()=>navigate('interests')} className="w-full p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between active:bg-indigo-50 transition-all shadow-sm"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Settings size={20}/></div><span className="font-bold text-gray-700">重新設定我的興趣</span></div><ChevronRight size={20} className="text-gray-300"/></button>
                <button onClick={()=>navigate('history')} className="w-full p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between active:bg-indigo-50 transition-all shadow-sm"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><History size={20}/></div><span className="font-bold text-gray-700">歷史收聽紀錄</span></div><ChevronRight size={20} className="text-gray-300"/></button>
                <button onClick={() => { setIsRegistered(false); navigate('login'); }} className="w-full p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between text-red-500 font-bold mt-12 active:bg-red-50 transition-all shadow-sm"><span>登出此帳號</span><X size={20}/></button>
              </div>
            </div>
          )}

          {/* 10. 收聽紀錄 */}
          {page === 'history' && (
            <div className="p-6 pt-12 h-full flex flex-col animate-in fade-in pb-24">
              <div className="flex items-center gap-3 mb-8"><button onClick={()=>navigate('profile')}><ChevronLeft/></button><h2 className="text-2xl font-black tracking-tight">收聽紀錄</h2></div>
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">{playHistory.map(item => (<div key={item.id} onClick={()=>navigate('player')} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center active:bg-gray-50 transition-all shadow-sm cursor-pointer"><div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mr-4">{item.emoji}</div><div className="flex-1 min-w-0"><h4 className="font-bold text-gray-800 truncate text-sm">{item.title}</h4><div className="flex items-center gap-3 mt-1"><p className="text-[10px] text-gray-400 font-bold uppercase">{item.date} • {item.duration}</p><div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{width: `${item.progress}%`}}></div></div><span className="text-[10px] font-black text-indigo-600">{item.progress}%</span></div></div><div className="ml-4 text-indigo-600"><Play fill="currentColor" size={20}/></div></div>))}</div>
            </div>
          )}

          {/* 11. 播放頁 */}
          {page === 'player' && (
            <div className="h-full bg-slate-900 text-white animate-in slide-in-from-right flex flex-col relative overflow-y-auto no-scrollbar pb-32">
               <div className="p-8 flex items-center justify-between sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md"><button onClick={()=>navigate(playerReferrer)} className="p-2"><ChevronLeft size={24}/></button><div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AudioCraft Player</p></div><button onClick={(e)=>{e.stopPropagation(); setShowPlayerMenu(!showPlayerMenu)}} className="p-2 text-slate-400 active:text-indigo-400"><MoreVertical size={24}/></button></div>
               {showPlayerMenu && <div className="absolute top-20 right-8 bg-slate-800 p-4 rounded-2xl z-[100] shadow-2xl border border-slate-700 w-48 animate-in fade-in zoom-in-95" onClick={e=>e.stopPropagation()}><div className="space-y-4"><button className="flex items-center gap-3 text-sm font-bold text-slate-300 w-full text-left active:text-indigo-400"><Sliders size={18}/> 播放速度</button><button className="flex items-center gap-3 text-sm font-bold text-slate-300 w-full text-left active:text-indigo-400"><FileText size={18}/> 查看逐字稿</button><button className="flex items-center gap-3 text-sm font-bold text-slate-300 w-full text-left active:text-indigo-400"><Share2 size={18}/> 分享此集</button></div></div>}
               <div className="px-8 flex flex-col items-center"><div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[40px] mb-8 flex items-center justify-center text-8xl shadow-2xl">🎙️</div><h2 className="text-2xl font-black mb-1 text-center">今日科技與財經重點</h2><div className="w-full h-1.5 bg-slate-800 rounded-full mt-10 mb-8 overflow-hidden"><div className="h-full w-1/3 bg-indigo-500"></div></div><div className="flex items-center justify-around w-full mb-12"><SkipBack className="text-slate-500" size={32}/><div className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl cursor-pointer" onClick={()=>setIsPlaying(!isPlaying)}>{isPlaying ? <Pause fill="currentColor" size={36}/> : <Play className="ml-1" fill="currentColor" size={36}/>}</div><SkipForward className="text-slate-500" size={32}/></div><div className="w-full border-t border-slate-800 pt-8"><h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={14}/> 本集依據文章</h4><div className="space-y-4">{MOCK_NEWS.slice(0, 3).map(n => (<div key={n.id} onClick={()=>setArticleDetail(n)} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 active:bg-slate-800 transition-colors cursor-pointer group"><div className="flex items-center justify-between mb-2"><span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{n.source}</span><ChevronRight size={14} className="text-slate-600 group-active:text-white"/></div><p className="text-sm font-bold text-slate-200">{n.title}</p></div>))}</div></div></div>
            </div>
          )}

        </div> {/* Content End */}

        {/* --- 絕對定位彈窗 --- */}

        {/* 1. 生成進度預覽 */}
        {previewSchedule && (
          <div className="absolute inset-0 bg-black/60 z-[200] flex items-end animate-in fade-in" onClick={()=>setPreviewSchedule(null)}>
            <div className="w-full bg-white rounded-t-[40px] p-8 max-h-[90%] overflow-y-auto animate-in slide-in-from-bottom-10" onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-gray-900">生成進度預覽</h3><button onClick={()=>setPreviewSchedule(null)} className="p-2 bg-gray-50 rounded-full"><X size={20}/></button></div>
              <div className="bg-indigo-600 p-5 rounded-3xl mb-8 shadow-lg shadow-indigo-100">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">預計納入領域</p>
                <div className="flex flex-wrap gap-2">{previewSchedule.types?.map(t=>(<span key={t} className="bg-white/20 px-3 py-1 rounded-full text-xs font-black text-white backdrop-blur-sm">#{t}</span>))}</div>
                <div className="mt-4 flex items-center justify-between text-white"><p className="text-xl font-black">{previewSchedule.time}</p><p className="text-xs font-bold opacity-80 italic">自動轉譯準備中...</p></div>
              </div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">預計採用文章 ({previewSchedule.articles?.length || 0})<button onClick={()=>setShowManualAdd(true)} className="text-indigo-600 flex items-center text-[10px] font-black tracking-wider bg-indigo-50 px-3 py-1.5 rounded-full">+ 手動加入</button></h4>
              <div className="space-y-3 mb-10">{previewSchedule.articles?.map(id => { const n = MOCK_NEWS.find(news => news.id === id); return (<div key={id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group"><div className="flex-1 min-w-0" onClick={()=>setArticleDetail(n)}><p className="text-xs font-bold text-gray-800 truncate">{n?.title}</p><p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{n?.source}</p></div><button onClick={() => setConfirmDialog({ isOpen: true, type: 'deleteArticle', data: id, titleText: n?.title })} className="text-gray-300 ml-4 hover:text-red-400"><Trash2 size={16}/></button></div>); })}</div>
              <button onClick={()=>setPreviewSchedule(null)} className="w-full py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-xl">關閉</button>
            </div>
          </div>
        )}

        {/* 2. 三向確認對話框 */}
        {confirmDialog.isOpen && (
          <div className="absolute inset-0 bg-black/70 z-[300] flex items-center justify-center p-8 animate-in fade-in">
             <div className="bg-white rounded-[32px] p-6 w-full shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-black mb-3 text-gray-900">
                  {confirmDialog.type === 'deleteFolder' ? '刪除資料夾' : 
                   confirmDialog.type === 'unfav' ? '取消收藏？' : 
                   confirmDialog.type === 'bulkGen' ? '製作特輯？' :
                   confirmDialog.type === 'bulkUnfav' ? '批量取消收藏？' : '移除這篇文章？'}
                </h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  {confirmDialog.type === 'deleteFolder' ? `請確認「${confirmDialog.titleText}」的內容處理方式：` : 
                   confirmDialog.type === 'unfav' ? `確定要將「${confirmDialog.titleText}」從收藏中移除嗎？` :
                   confirmDialog.type === 'bulkGen' ? `確定要將選中的這 ${selectedForGen.length} 篇新聞製作成專屬特輯嗎？` :
                   confirmDialog.type === 'bulkUnfav' ? `確定要將選中的這 ${selectedForGen.length} 篇新聞從收藏庫中全部移除嗎？` :
                   `確定要從生成清單中移除「${confirmDialog.titleText}」嗎？`}
                </p>
                {confirmDialog.type === 'deleteFolder' ? (
                  <div className="space-y-3"><button onClick={()=>deleteFolderFinal('move')} className="w-full py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg text-sm">內容移至「預設收藏」</button><button onClick={()=>deleteFolderFinal('purge')} className="w-full py-3.5 bg-red-100 text-red-600 font-black rounded-2xl text-sm">全部取消收藏</button><button onClick={()=>setConfirmDialog({isOpen: false})} className="w-full py-3.5 text-gray-400 font-bold text-sm">先不要</button></div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={()=>setConfirmDialog({isOpen: false})} className="flex-1 py-3.5 bg-gray-100 font-bold rounded-2xl text-gray-600">返回</button>
                    <button onClick={() => { 
                      if(confirmDialog.type === 'unfav') { setFavorites(favorites.filter(id=>id!==confirmDialog.data)); } 
                      if(confirmDialog.type === 'deleteArticle') { const next = previewSchedule.articles.filter(id=>id!==confirmDialog.data); setTemplates(templates.map(t=>t.id===previewSchedule.id ? {...t, articles: next} : t)); setPreviewSchedule({...previewSchedule, articles: next}); } 
                      if(confirmDialog.type === 'bulkGen') { startGeneratingPod(); }
                      if(confirmDialog.type === 'bulkUnfav') { setFavorites(favorites.filter(id=>!selectedForGen.includes(id))); setSelectedForGen([]); }
                      setConfirmDialog({isOpen: false}); 
                    }} className={`flex-1 py-3.5 ${confirmDialog.type === 'bulkUnfav' || confirmDialog.type === 'unfav' ? 'bg-red-500' : 'bg-indigo-600'} font-black rounded-2xl text-white shadow-lg`}>確認執行</button>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* 3. 文章詳情 */}
        {articleDetail && (<div className="absolute inset-0 bg-black/60 z-[210] flex items-end animate-in fade-in" onClick={()=>setArticleDetail(null)}><div className="w-full bg-white rounded-t-[40px] p-8 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom-10" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-start mb-6"><div className="flex gap-2"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{articleDetail.category}</span>{articleDetail.ai_tags?.map(t=>(<span key={t} className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold">#{t}</span>))}</div><button onClick={()=>setArticleDetail(null)} className="p-2 bg-gray-100 rounded-full active:scale-90"><X size={20}/></button></div><h2 className="text-2xl font-black mb-4 text-gray-900 leading-tight">{articleDetail.title}</h2><p className="text-xs text-gray-400 font-bold uppercase mb-8">{articleDetail.source} • {articleDetail.date}</p><div className="text-sm text-gray-600 leading-relaxed mb-10"><p>{articleDetail.content}</p></div><button onClick={()=>alert('連結至原始報導...')} className="w-full py-4 bg-gray-100 text-gray-800 font-black rounded-3xl mb-8 flex items-center justify-center gap-2 active:bg-gray-200 transition-colors"><ExternalLink size={18}/> 閱讀原文資料</button></div></div>)}

        {/* 4. 資料夾編輯器 */}
        {showFolderEditor.isOpen && (<div className="absolute inset-0 bg-black/60 z-[220] flex items-center justify-center p-8 animate-in fade-in"><div className="bg-white rounded-[36px] p-6 w-full shadow-2xl"><h3 className="text-xl font-black mb-4">{showFolderEditor.mode === 'add' ? '新增資料夾' : '重新命名'}</h3><input autoFocus value={showFolderEditor.inputName} onChange={e => setShowFolderEditor({...showFolderEditor, inputName: e.target.value})} type="text" placeholder="輸入名稱..." className="w-full bg-gray-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 mb-6 font-bold" /><div className="flex gap-3"><button onClick={() => setShowFolderEditor({isOpen: false, mode: '', originalName: '', inputName: ''})} className="flex-1 py-4 bg-gray-100 font-bold rounded-2xl text-gray-600 text-sm">取消</button><button onClick={submitFolderAction} className="flex-1 py-4 bg-indigo-600 font-black rounded-2xl text-white shadow-lg text-sm">儲存確認</button></div></div></div>)}

        {/* 5. 手動加入新聞 (分層) */}
        {showManualAdd && (<div className="absolute inset-0 bg-black/60 z-[250] flex items-end animate-in fade-in" onClick={()=>setShowManualAdd(false)}><div className="w-full bg-white rounded-t-[40px] p-8 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom-10" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-center mb-8"><div className="flex items-center gap-2">{manualAddFolder && <button onClick={()=>setManualAddFolder(null)} className="p-1"><ChevronLeft/></button>} <h3 className="text-xl font-black text-sm">{manualAddFolder ? `從「${manualAddFolder}」挑選` : '選擇資料夾'}</h3></div><button onClick={()=>setShowManualAdd(false)}><X/></button></div><div className="space-y-3 pb-8">{!manualAddFolder ? folders.map(f => (<button key={f} onClick={()=>setManualAddFolder(f)} className="w-full p-5 bg-gray-50 rounded-2xl flex items-center justify-between active:bg-indigo-50"><div className="flex items-center gap-3"><Folder className="text-amber-400" size={18} fill="currentColor"/> <span className="font-bold text-gray-700">{f}</span></div><ChevronRight size={16} className="text-gray-300"/></button>)) : MOCK_NEWS.filter(n => articleToFolder[n.id] === manualAddFolder && favorites.includes(n.id)).map(n => { const isAdded = previewSchedule.articles?.includes(n.id); return (<div key={n.id} className={`p-4 rounded-2xl flex items-center justify-between border ${isAdded ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-transparent'}`}><p className={`text-xs font-bold truncate flex-1 ${isAdded ? 'text-indigo-600' : 'text-gray-700'}`}>{n.title}</p><button onClick={()=>{ const next = isAdded ? previewSchedule.articles.filter(aid=>aid!==n.id) : [...(previewSchedule.articles || []), n.id]; setTemplates(templates.map(t=>t.id===previewSchedule.id ? {...t, articles: next} : t)); setPreviewSchedule({...previewSchedule, articles: next}); }} className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdded ? 'bg-indigo-600 text-white' : 'bg-white text-gray-300 border'}`}>{isAdded ? <Check size={16}/> : <Plus size={16}/>}</button></div>); })}</div></div></div>)}

        {/* 6. 移動資料夾 Sheet */}
        {showFolderSheet && (<div className="absolute inset-0 bg-black/60 z-[110] flex items-end animate-in fade-in" onClick={()=>setShowFolderSheet(null)}><div className="w-full bg-white rounded-t-[40px] p-8 animate-in slide-in-from-bottom-10 max-h-[400px]" onClick={e=>e.stopPropagation()}><h3 className="text-xl font-black mb-8 text-center text-gray-900">移動至資料夾</h3><div className="space-y-3 pb-8">{folders.map(f => (<button key={f} onClick={() => { setArticleToFolder({...articleToFolder, [showFolderSheet]: f}); setFavorites([...new Set([...favorites, showFolderSheet])]); setShowFolderSheet(null); }} className="w-full p-5 text-left font-bold text-gray-700 bg-gray-50 rounded-2xl flex items-center active:bg-indigo-50"><Folder className="mr-3 text-amber-400" fill="currentColor" size={18}/> {f}</button>))}</div></div></div>)}

        {['home', 'browse', 'templates', 'favorites', 'profile', 'history'].includes(page) && <BottomNav />}
        <div className="absolute bottom-1 w-32 h-1 bg-black/10 rounded-full left-1/2 -translate-x-1/2 z-50"></div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        .animate-loading-bar { animation: loadingBar 2s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}