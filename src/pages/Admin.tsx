import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { authRequest, adminRequest, saveSession, getUser, clearSession, Order, ChatMessage } from '@/lib/api';

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  new: { text: 'Новый', cls: 'bg-muted text-muted-foreground' },
  analyzed: { text: 'Обсуждение', cls: 'bg-primary/15 text-primary' },
  awaiting_admin: { text: 'Ждёт решения', cls: 'bg-secondary/15 text-secondary' },
  approved: { text: 'Одобрен', cls: 'bg-green-500/15 text-green-400' },
  rejected: { text: 'Отклонён', cls: 'bg-destructive/15 text-destructive' },
};

const ROLE_LABEL: Record<string, string> = {
  assistant: 'Сварог',
  operator: 'Никита',
  user: '',
};

const Admin = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [authed, setAuthed] = useState(!!user?.is_admin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (authed) load(); }, [authed]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const load = async () => {
    const { ok, data } = await adminRequest('GET');
    if (ok && data.orders) setOrders(data.orders);
    else if (!ok) toast.error(data.error || 'Нет доступа');
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, data } = await authRequest('login', { email, password });
    if (!ok) { toast.error(data.error || 'Ошибка'); return; }
    if (!data.user.is_admin) { toast.error('Это не админ-аккаунт'); return; }
    saveSession(data.token, data.user);
    setAuthed(true);
    toast.success('Добро пожаловать, Никита!');
  };

  const openChat = async (o: Order) => {
    setActiveOrder(o);
    setMessages([]);
    const { data } = await adminRequest('POST', { action: 'messages', order_id: o.id });
    setMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeOrder) return;
    const text = msgInput;
    setMsgInput('');
    setSending(true);
    setMessages((m) => [...m, { role: 'operator', content: text }]);
    await adminRequest('POST', { action: 'send', order_id: activeOrder.id, text });
    setSending(false);
  };

  const act = async (order_id: number, action: string) => {
    const { ok, data } = await adminRequest('POST', { action, order_id });
    if (!ok) { toast.error(data.error); return; }
    toast.success(action === 'approve' ? 'Заказ одобрен' : 'Заказ отклонён');
    load();
    if (activeOrder?.id === order_id) {
      setActiveOrder((o) => o ? { ...o, status: action === 'approve' ? 'approved' : 'rejected' } : o);
    }
  };

  const genPrompt = async (order_id: number) => {
    setPrompt(''); setPromptLoading(true);
    const { data } = await adminRequest('POST', { action: 'prompt', order_id });
    setPromptLoading(false);
    setPrompt(data.prompt || data.error || 'Пусто');
  };

  const logout = () => { clearSession(); setAuthed(false); navigate('/'); };

  if (!authed) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center p-4">
        <Card className="glass neon-border w-full max-w-md p-8 animate-fade-in">
          <div className="flex items-center gap-2 font-display text-xl font-bold mb-2">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-secondary text-secondary-foreground">
              <Icon name="ShieldCheck" size={20} />
            </span>
            Панель администратора
          </div>
          <p className="text-muted-foreground text-sm mb-6">Вход для оператора Никиты</p>
          <form className="space-y-4" onSubmit={login}>
            <Input type="email" placeholder="Email админа" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input/50 h-12" />
            <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-input/50 h-12" />
            <Button type="submit" className="w-full h-12 font-display uppercase tracking-wide">Войти</Button>
          </form>
        </Card>
      </div>
    );
  }

  const paidCount = orders.filter((o) => o.payment_confirmed && o.status === 'awaiting_admin').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
              <Icon name="ShieldCheck" size={18} />
            </span>
            Админ · Никита
            {paidCount > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 flex items-center gap-1">
                <Icon name="BadgeCheck" size={13} /> {paidCount} ждут
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <Icon name="LogOut" size={16} className="mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* ORDERS LIST */}
        <div className="w-80 shrink-0 border-r border-border overflow-y-auto p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-1 mb-3">Заказы</p>
          {orders.length === 0 && <p className="text-sm text-muted-foreground px-1">Пока нет заказов</p>}
          {orders.map((o) => {
            const st = STATUS_LABEL[o.status] || STATUS_LABEL.new;
            return (
              <button
                key={o.id}
                onClick={() => openChat(o)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  activeOrder?.id === o.id ? 'border-primary bg-primary/5' : 'border-border glass hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-1 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">#{o.id}</span>
                  {o.payment_confirmed && <Icon name="BadgeCheck" size={14} className="text-green-400" />}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${st.cls}`}>{st.text}</span>
                </div>
                <div className="font-display font-semibold text-sm truncate">{o.title}</div>
                <div className="text-xs text-muted-foreground truncate">{o.user_name} · {o.user_email}</div>
              </button>
            );
          })}
        </div>

        {/* CHAT PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeOrder ? (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <span className="grid place-items-center w-16 h-16 rounded-2xl bg-secondary/15 text-secondary mx-auto mb-4">
                  <Icon name="MessagesSquare" size={32} />
                </span>
                <h3 className="font-display text-2xl font-bold mb-2">Выберите заказ</h3>
                <p className="text-muted-foreground max-w-xs">Нажмите на заказ слева, чтобы открыть чат с клиентом</p>
              </div>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold truncate">{activeOrder.title}</span>
                    {activeOrder.payment_confirmed && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                        <Icon name="BadgeCheck" size={13} /> Согласие на оплату
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{activeOrder.user_name} · {activeOrder.user_email}</p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <Button size="sm" onClick={() => act(activeOrder.id, 'approve')} className="bg-green-500 hover:bg-green-600 text-white h-8">
                    <Icon name="Check" size={14} className="mr-1" /> Одобрить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(activeOrder.id, 'reject')} className="border-destructive text-destructive h-8">
                    <Icon name="X" size={14} className="mr-1" /> Отклонить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => genPrompt(activeOrder.id)} className="border-primary text-primary h-8">
                    <Icon name="Code2" size={14} className="mr-1" /> Промт для IDE
                  </Button>
                </div>
              </div>

              {/* MESSAGES */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm pt-8">История переписки пуста</p>
                )}
                {messages.map((m, i) => {
                  const isUser = m.role === 'user';
                  const isOperator = m.role === 'operator';
                  return (
                    <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <span className={`grid place-items-center w-7 h-7 rounded-full shrink-0 text-xs font-bold mt-1 ${
                          isOperator ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
                        }`}>
                          {isOperator ? 'Н' : 'С'}
                        </span>
                      )}
                      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isUser && (
                          <span className="text-xs text-muted-foreground mb-1 px-1">
                            {ROLE_LABEL[m.role] || m.role}
                          </span>
                        )}
                        <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                          isUser
                            ? 'bg-muted text-foreground rounded-tr-sm'
                            : isOperator
                              ? 'bg-secondary text-secondary-foreground rounded-tl-sm'
                              : 'glass rounded-tl-sm'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INPUT */}
              <div className="border-t border-border p-4 flex gap-2 items-center">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shrink-0">Н</span>
                <Input
                  placeholder="Написать клиенту от имени Никиты..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && sendMessage()}
                  className="bg-input/50 h-11"
                />
                <Button size="icon" onClick={sendMessage} disabled={sending} className="h-11 w-11 shrink-0">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PROMPT DIALOG */}
      <Dialog open={prompt !== null} onOpenChange={(v) => !v && setPrompt(null)}>
        <DialogContent className="glass max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Icon name="Code2" size={20} className="text-primary" /> Промт для IDE
            </DialogTitle>
          </DialogHeader>
          {promptLoading ? (
            <p className="text-muted-foreground py-8 text-center">Сварог генерирует промт...</p>
          ) : (
            <>
              <pre className="font-mono text-sm bg-input/50 rounded-xl p-4 max-h-[50vh] overflow-auto whitespace-pre-wrap">{prompt}</pre>
              <Button onClick={() => { navigator.clipboard.writeText(prompt || ''); toast.success('Скопировано!'); }} className="w-full">
                <Icon name="Copy" size={16} className="mr-1" /> Скопировать
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
