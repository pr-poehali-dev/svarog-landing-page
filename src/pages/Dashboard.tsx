import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { ordersRequest, getUser, clearSession, Order, ChatMessage } from '@/lib/api';

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  new: { text: 'Новый', cls: 'bg-muted text-muted-foreground' },
  analyzed: { text: 'Обсуждение цены', cls: 'bg-primary/15 text-primary' },
  awaiting_admin: { text: 'Ждёт подтверждения', cls: 'bg-secondary/15 text-secondary' },
  approved: { text: 'Одобрен', cls: 'bg-green-500/15 text-green-400' },
  rejected: { text: 'Отклонён', cls: 'bg-destructive/15 text-destructive' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [active, setActive] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const loadOrders = async () => {
    const { data } = await ordersRequest('GET');
    if (data.orders) setOrders(data.orders);
  };

  const openOrder = async (o: Order) => {
    setActive(o);
    const { data } = await ordersRequest('POST', { action: 'messages', order_id: o.id });
    setMessages(data.messages || []);
  };

  const createOrder = async () => {
    if (!desc.trim()) { toast.error('Опишите программу'); return; }
    setCreating(true);
    const { ok, data } = await ordersRequest('POST', { action: 'create', title: title || 'Новый проект', description: desc });
    setCreating(false);
    if (!ok) { toast.error(data.error || 'Ошибка'); return; }
    toast.success('Сварог проанализировал проект!');
    setTitle(''); setDesc('');
    await loadOrders();
    const { data: fresh } = await ordersRequest('GET');
    const created = fresh.orders?.find((o: Order) => o.id === data.order_id);
    if (created) openOrder(created);
  };

  const sendMessage = async () => {
    if (!input.trim() || !active) return;
    const text = input;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    const { data } = await ordersRequest('POST', { action: 'message', order_id: active.id, text });
    setLoading(false);
    if (data.reply) setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
  };

  const agree = async () => {
    if (!active) return;
    await ordersRequest('POST', { action: 'agree', order_id: active.id });
    toast.success('Согласие отправлено! Никита подтвердит оплату.');
    await loadOrders();
    openOrder({ ...active, payment_confirmed: true, status: 'awaiting_admin' });
  };

  const logout = () => { clearSession(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Icon name="Hexagon" size={18} />
            </span>
            SVAROG<span className="text-primary">.TECH</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <Icon name="LogOut" size={16} className="mr-1" /> Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 grid lg:grid-cols-[340px_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="space-y-4">
          <Card className="glass p-5 neon-border">
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <Icon name="Plus" size={18} className="text-primary" /> Новый проект
            </h2>
            <Input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input/50 mb-3" />
            <Textarea
              placeholder="Опишите вашу программу: что должна делать, для кого, какие функции..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-input/50 min-h-32 mb-3"
            />
            <Button onClick={createOrder} disabled={creating} className="w-full font-display uppercase tracking-wide">
              {creating ? 'Сварог анализирует...' : 'Отправить Сварогу'}
            </Button>
          </Card>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground px-1">Мои проекты</p>
            {orders.length === 0 && <p className="text-sm text-muted-foreground px-1">Пока пусто</p>}
            {orders.map((o) => {
              const st = STATUS_LABEL[o.status] || STATUS_LABEL.new;
              return (
                <button
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    active?.id === o.id ? 'border-primary bg-primary/5' : 'border-border glass hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-display font-semibold truncate">{o.title}</span>
                    {o.payment_confirmed && <Icon name="BadgeCheck" size={16} className="text-green-400 shrink-0" />}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHAT */}
        <Card className="glass neon-border flex flex-col min-h-[70vh]">
          {!active ? (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <span className="grid place-items-center w-16 h-16 rounded-2xl bg-primary/15 text-primary mx-auto mb-4">
                  <Icon name="Hexagon" size={32} />
                </span>
                <h3 className="font-display text-2xl font-bold mb-2">Опишите вашу программу</h3>
                <p className="text-muted-foreground max-w-sm">
                  Сварог проанализирует задачу, подберёт технологии и обсудит с вами стоимость разработки.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                    <Icon name="Hexagon" size={20} />
                  </span>
                  <div>
                    <div className="font-display font-semibold">Сварог · {active.title}</div>
                    <div className="text-xs text-primary">обсуждаем стоимость</div>
                  </div>
                </div>
                {active.payment_confirmed ? (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <Icon name="BadgeCheck" size={16} /> Согласие отправлено
                  </span>
                ) : (
                  <Button size="sm" onClick={agree} className="bg-green-500 hover:bg-green-600 text-white">
                    <Icon name="Check" size={16} className="mr-1" /> Согласен на оплату
                  </Button>
                )}
              </div>

              <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[55vh]">
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
                      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                        {!isUser && (
                          <span className="text-xs text-muted-foreground mb-1 px-1">
                            {isOperator ? 'Никита · оператор' : 'Сварог · AI'}
                          </span>
                        )}
                        <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : isOperator
                              ? 'bg-secondary/20 border border-secondary/30 rounded-tl-sm'
                              : 'glass rounded-tl-sm'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex gap-2">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-1">С</span>
                    <div className="glass p-3 rounded-2xl text-sm text-muted-foreground">Сварог печатает...</div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="Спросите о цене, сроках, технологиях..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="bg-input/50 h-11"
                />
                <Button size="icon" onClick={sendMessage} className="h-11 w-11 shrink-0">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;