import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { authRequest, adminRequest, saveSession, getUser, clearSession, Order } from '@/lib/api';

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  new: { text: 'Новый', cls: 'bg-muted text-muted-foreground' },
  analyzed: { text: 'Обсуждение', cls: 'bg-primary/15 text-primary' },
  awaiting_admin: { text: 'Ждёт решения', cls: 'bg-secondary/15 text-secondary' },
  approved: { text: 'Одобрен', cls: 'bg-green-500/15 text-green-400' },
  rejected: { text: 'Отклонён', cls: 'bg-destructive/15 text-destructive' },
};

const Admin = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [authed, setAuthed] = useState(!!user?.is_admin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);

  useEffect(() => {
    if (authed) load();
     
  }, [authed]);

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

  const act = async (order_id: number, action: string) => {
    const { ok, data } = await adminRequest('POST', { action, order_id });
    if (!ok) { toast.error(data.error); return; }
    toast.success(action === 'approve' ? 'Заказ одобрен' : 'Заказ отклонён');
    load();
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
        <Card className="glass neon-border w-full max-w-md p-8 relative animate-fade-in">
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
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
              <Icon name="ShieldCheck" size={18} />
            </span>
            Админ · Никита
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <Icon name="LogOut" size={16} className="mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Все заказы</h1>
          {paidCount > 0 && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 flex items-center gap-1">
              <Icon name="BadgeCheck" size={16} /> {paidCount} согласны на оплату
            </span>
          )}
        </div>

        <div className="space-y-4">
          {orders.length === 0 && <p className="text-muted-foreground">Заказов пока нет.</p>}
          {orders.map((o) => {
            const st = STATUS_LABEL[o.status] || STATUS_LABEL.new;
            return (
              <Card key={o.id} className={`glass p-5 ${o.payment_confirmed ? 'neon-border' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">#{o.id}</span>
                      <span className="font-display text-lg font-semibold">{o.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
                      {o.payment_confirmed && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                          <Icon name="BadgeCheck" size={13} /> Согласие на оплату
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {o.user_name} · {o.user_email}
                    </p>
                    <p className="text-sm mb-3 line-clamp-2">{o.description}</p>
                    {o.ai_analysis && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary">Анализ Сварога</summary>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{o.ai_analysis}</p>
                      </details>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col">
                    <Button size="sm" onClick={() => act(o.id, 'approve')} className="bg-green-500 hover:bg-green-600 text-white">
                      <Icon name="Check" size={15} className="mr-1" /> Одобрить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => act(o.id, 'reject')} className="border-destructive text-destructive">
                      <Icon name="X" size={15} className="mr-1" /> Отклонить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => genPrompt(o.id)} className="border-primary text-primary">
                      <Icon name="Code2" size={15} className="mr-1" /> Промт для IDE
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

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
              <Button
                onClick={() => { navigator.clipboard.writeText(prompt || ''); toast.success('Скопировано!'); }}
                className="w-full"
              >
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
