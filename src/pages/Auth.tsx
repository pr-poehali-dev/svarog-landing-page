import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { authRequest, saveSession } from '@/lib/api';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { ok, data } = await authRequest(mode, { name, email, password });
    setLoading(false);
    if (!ok) {
      toast.error(data.error || 'Ошибка');
      return;
    }
    saveSession(data.token, data.user);
    toast.success(mode === 'register' ? 'Аккаунт создан!' : 'С возвращением!');
    navigate(data.user.is_admin ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      <Card className="glass neon-border w-full max-w-md p-8 relative animate-fade-in">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 font-display text-xl font-bold mb-8">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground neon-border">
            <Icon name="Hexagon" size={20} />
          </span>
          SVAROG<span className="text-primary">.TECH</span>
        </button>

        <h1 className="font-display text-3xl font-bold mb-1">
          {mode === 'register' ? 'Создать аккаунт' : 'Вход в кабинет'}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {mode === 'register' ? 'Без подтверждений — сразу в работу' : 'Рады видеть снова'}
        </p>

        <form className="space-y-4" onSubmit={submit}>
          {mode === 'register' && (
            <Input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} className="bg-input/50 h-12" />
          )}
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input/50 h-12" />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-input/50 h-12" />
          <Button type="submit" disabled={loading} className="w-full h-12 font-display uppercase tracking-wide">
            {loading ? 'Подождите...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="text-primary hover:underline"
          >
            {mode === 'register' ? 'Войти' : 'Регистрация'}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
