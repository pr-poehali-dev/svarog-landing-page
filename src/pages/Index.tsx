import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

const NAV = [
  { id: 'hero', label: 'Главная' },
  { id: 'register', label: 'Регистрация' },
  { id: 'calc', label: 'Калькулятор' },
  { id: 'pricing', label: 'Тарифы' },
  { id: 'chat', label: 'Чат' },
  { id: 'faq', label: 'Вопросы' },
  { id: 'contacts', label: 'Контакты' },
];

const SERVICES = [
  { icon: 'Globe', name: 'Домен', price: 1200, unit: '/год' },
  { icon: 'Server', name: 'Хостинг', price: 6000, unit: '/год' },
  { icon: 'Database', name: 'База данных', price: 4800, unit: '/год' },
  { icon: 'Bug', name: 'Тестировщик', price: 25000, unit: '/мес' },
  { icon: 'Palette', name: 'Дизайнер', price: 35000, unit: '/мес' },
  { icon: 'ShieldCheck', name: 'Поддержка 24/7', price: 15000, unit: '/мес' },
];

const TARIFFS = [
  {
    name: 'Старт',
    price: '49 000',
    accent: 'cyan',
    features: ['Лендинг до 5 экранов', 'Базовый AI-чат', '1 интеграция', 'Поддержка 1 месяц'],
  },
  {
    name: 'Бизнес',
    price: '149 000',
    accent: 'violet',
    popular: true,
    features: ['Веб-приложение', 'AI Сварог + расчёт заказов', 'До 5 интеграций', 'Тестировщик в команде', 'Поддержка 6 месяцев'],
  },
  {
    name: 'Корпорация',
    price: 'от 500 000',
    accent: 'pink',
    features: ['Сложная система под ключ', 'Выделенная команда', 'Безлимит интеграций', 'SLA 24/7', 'Поддержка 12 месяцев'],
  },
];

const FAQ = [
  { q: 'Как AI Сварог обрабатывает заказ?', a: 'Сварог анализирует ваше описание, подбирает технологии, рассчитывает стоимость домена, хостинга и специалистов, а затем формирует готовое коммерческое предложение и промт для разработки в IDE.' },
  { q: 'Можно ли связаться с живым оператором?', a: 'Да. AI ведёт диалог, но в любой момент к чату подключается оператор Никита и продолжает общение лично.' },
  { q: 'Что входит в расчёт стоимости?', a: 'Домены, хостинг, базы данных, подписки на сервисы и привлекаемые специалисты — тестировщики, дизайнеры, аналитики.' },
  { q: 'Сколько занимает разработка?', a: 'От 3 дней для лендинга до нескольких недель для сложных систем. Точный срок Сварог называет после расчёта заказа.' },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const Index = () => {
  const [selected, setSelected] = useState<number[]>([0, 1]);
  const [complexity, setComplexity] = useState([3]);
  const [rush, setRush] = useState(false);

  const base = selected.reduce((sum, i) => sum + SERVICES[i].price, 0);
  const total = Math.round(base * (1 + complexity[0] * 0.25) * (rush ? 1.4 : 1));

  const toggle = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 font-display text-xl font-bold tracking-wide">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground neon-border">
              <Icon name="Hexagon" size={20} />
            </span>
            SVAROG<span className="text-primary">.TECH</span>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors font-display uppercase tracking-wide"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <Button onClick={() => scrollTo('register')} className="font-display uppercase tracking-wide">
            Начать
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section id="hero" className="relative pt-32 pb-24 grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary mb-6 neon-border">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              AI Сварог онлайн · готов рассчитать заказ
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              РАЗРАБОТКА ПО,<br />
              <span className="gradient-text neon-text">УСИЛЕННАЯ AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Опишите идею — искусственный интеллект Сварог подберёт технологии,
              рассчитает стоимость и подготовит проект к запуску.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => scrollTo('calc')} className="font-display uppercase tracking-wide text-base h-14 px-8">
                <Icon name="Calculator" size={20} className="mr-2" />
                Рассчитать заказ
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('chat')} className="font-display uppercase tracking-wide text-base h-14 px-8 border-secondary text-secondary hover:bg-secondary/10">
                <Icon name="MessagesSquare" size={20} className="mr-2" />
                Чат со Сварогом
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
            {[
              { n: '180+', l: 'проектов' },
              { n: '24/7', l: 'AI-поддержка' },
              { n: '3 дня', l: 'до запуска' },
              { n: '99%', l: 'довольных' },
            ].map((s) => (
              <Card key={s.l} className="glass p-6 text-center">
                <div className="font-display text-3xl font-bold gradient-text">{s.n}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTER */}
      <section id="register" className="py-24 relative">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-display text-primary uppercase tracking-widest text-sm">Шаг 1</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">Регистрация на платформе</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Создайте аккаунт, чтобы отслеживать заказы, общаться со Сварогом
              и получать готовые промты для разработки.
            </p>
            <ul className="space-y-4">
              {['Личный кабинет с историей заказов', 'Прямой доступ к AI-чату', 'Уведомления о статусе проекта'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-primary/15 text-primary">
                    <Icon name="Check" size={14} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="glass p-8 neon-border">
            <h3 className="font-display text-2xl font-bold mb-6">Создать аккаунт</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Имя</label>
                <Input placeholder="Как к вам обращаться?" className="bg-input/50 h-12" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input type="email" placeholder="you@mail.ru" className="bg-input/50 h-12" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Пароль</label>
                <Input type="password" placeholder="••••••••" className="bg-input/50 h-12" />
              </div>
              <Button className="w-full h-12 font-display uppercase tracking-wide text-base">
                Зарегистрироваться
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Уже есть аккаунт? <span className="text-primary cursor-pointer">Войти</span>
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calc" className="py-24 relative grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="container relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-display text-secondary uppercase tracking-widest text-sm">Шаг 2</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Калькулятор заказа</h2>
            <p className="text-muted-foreground text-lg">
              Соберите состав проекта — Сварог мгновенно посчитает итоговую стоимость.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {SERVICES.map((s, i) => {
                const on = selected.includes(i);
                return (
                  <button
                    key={s.name}
                    onClick={() => toggle(i)}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      on ? 'border-primary bg-primary/5 neon-border' : 'border-border glass hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`grid place-items-center w-11 h-11 rounded-lg ${on ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'}`}>
                        <Icon name={s.icon} size={22} />
                      </span>
                      <span className={`w-5 h-5 rounded-md border grid place-items-center ${on ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {on && <Icon name="Check" size={14} className="text-primary-foreground" />}
                      </span>
                    </div>
                    <div className="font-display font-semibold text-lg">{s.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {s.price.toLocaleString('ru')} ₽<span className="text-xs">{s.unit}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <Card className="glass p-6 neon-border-violet h-fit lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                  <Icon name="Sparkles" size={18} />
                </span>
                <span className="font-display font-bold">Расчёт Сварога</span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Сложность проекта</span>
                  <span className="text-primary font-medium">{complexity[0]} / 5</span>
                </div>
                <Slider value={complexity} onValueChange={setComplexity} min={1} max={5} step={1} />
              </div>

              <div className="flex items-center justify-between py-3 border-y border-border mb-6">
                <span className="text-sm">Срочный запуск (+40%)</span>
                <Switch checked={rush} onCheckedChange={setRush} />
              </div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Услуг выбрано</span>
                  <span>{selected.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Базовая стоимость</span>
                  <span>{base.toLocaleString('ru')} ₽</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/10 mb-5">
                <div className="text-sm text-muted-foreground mb-1">Итого</div>
                <div className="font-display text-4xl font-bold gradient-text">
                  {total.toLocaleString('ru')} ₽
                </div>
              </div>

              <Button onClick={() => scrollTo('chat')} className="w-full h-12 font-display uppercase tracking-wide">
                Отправить Сварогу
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-display text-primary uppercase tracking-widest text-sm">Тарифы</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Выберите масштаб</h2>
            <p className="text-muted-foreground text-lg">Прозрачные пакеты под любые задачи.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TARIFFS.map((t) => (
              <Card
                key={t.name}
                className={`glass p-8 relative ${t.popular ? 'neon-border-violet scale-105 z-10' : ''}`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-display uppercase tracking-wide">
                    Популярный
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold mb-2">{t.name}</h3>
                <div className="font-display text-4xl font-bold gradient-text mb-6">{t.price} ₽</div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Icon name="Check" size={16} className="text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => scrollTo('register')}
                  variant={t.popular ? 'default' : 'outline'}
                  className="w-full h-12 font-display uppercase tracking-wide"
                >
                  Выбрать
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CHAT */}
      <section id="chat" className="py-24 relative grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-display text-secondary uppercase tracking-widest text-sm">Шаг 3</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">Диалог со Сварогом</h2>
            <p className="text-muted-foreground text-lg mb-8">
              AI ведёт переписку, уточняет детали и формирует промт для IDE.
              В любой момент к диалогу подключается оператор Никита.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'Bot', t: 'AI Сварог', d: 'Обрабатывает заказ и отвечает мгновенно' },
                { icon: 'UserCog', t: 'Оператор Никита', d: 'Подключается лично к любому чату' },
                { icon: 'Code2', t: 'Промт для IDE', d: 'Готовое техзадание для разработки' },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-4 glass rounded-xl p-4">
                  <span className="grid place-items-center w-11 h-11 rounded-lg bg-secondary/15 text-secondary shrink-0">
                    <Icon name={f.icon} size={22} />
                  </span>
                  <div>
                    <div className="font-display font-semibold">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="glass p-0 neon-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <Icon name="Hexagon" size={20} />
              </span>
              <div>
                <div className="font-display font-semibold">Сварог</div>
                <div className="text-xs text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" /> онлайн
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4 h-80 overflow-y-auto">
              <div className="max-w-[80%] glass rounded-2xl rounded-tl-sm p-3 text-sm">
                Приветствую! Я Сварог. Опишите проект — рассчитаю стоимость и подготовлю решение.
              </div>
              <div className="max-w-[80%] ml-auto bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 text-sm">
                Нужен интернет-магазин с оплатой и доставкой.
              </div>
              <div className="max-w-[85%] glass rounded-2xl rounded-tl-sm p-3 text-sm">
                Отлично! Подобрал стек, посчитал домен, хостинг и тестировщика.
                Итог — <span className="text-primary font-medium">189 000 ₽</span>. Сформировать промт для IDE?
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Input placeholder="Напишите сообщение..." className="bg-input/50 h-11" />
              <Button size="icon" className="h-11 w-11 shrink-0">
                <Icon name="Send" size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ADMIN PREVIEW */}
      <section className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-display text-primary uppercase tracking-widest text-sm">Для оператора</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Панель администратора</h2>
            <p className="text-muted-foreground text-lg">
              Никита одобряет, отклоняет заказы и генерирует промты в один клик.
            </p>
          </div>
          <Card className="glass p-6 neon-border max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-display font-bold">Н</span>
                <div>
                  <div className="font-display font-semibold">Никита · Оператор</div>
                  <div className="text-xs text-muted-foreground">ni8888kita@yandex.ru</div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-mono">3 новых заказа</span>
            </div>
            <div className="space-y-3">
              {[
                { id: '#1042', name: 'Интернет-магазин', sum: '189 000 ₽', status: 'Новый' },
                { id: '#1041', name: 'CRM для клиники', sum: '420 000 ₽', status: 'В работе' },
                { id: '#1040', name: 'Лендинг услуг', sum: '49 000 ₽', status: 'Готов' },
              ].map((o) => (
                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl glass">
                  <span className="font-mono text-sm text-muted-foreground w-16">{o.id}</span>
                  <span className="font-display font-semibold flex-1">{o.name}</span>
                  <span className="text-primary font-medium">{o.sum}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-primary text-primary h-9">
                      <Icon name="Check" size={15} className="mr-1" /> Одобрить
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive h-9">
                      <Icon name="X" size={15} className="mr-1" /> Отклонить
                    </Button>
                    <Button size="sm" className="h-9">
                      <Icon name="Code2" size={15} className="mr-1" /> Промт
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 relative grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="container relative max-w-3xl">
          <div className="text-center mb-14">
            <span className="font-display text-secondary uppercase tracking-widest text-sm">FAQ</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Вопросы и ответы</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-xl px-5 border-border">
                <AccordionTrigger className="font-display text-left text-lg hover:no-underline hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <span className="font-display text-primary uppercase tracking-widest text-sm">Контакты</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">Свяжитесь с нами</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Остались вопросы? Напишите — ответит Сварог или оператор Никита.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'Mail', t: 'Почта', d: 'ni8888kita@yandex.ru' },
                { icon: 'User', t: 'Оператор', d: 'Никита' },
                { icon: 'Clock', t: 'Режим работы', d: 'AI — 24/7, оператор — с 9 до 21' },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-4 glass rounded-xl p-4">
                  <span className="grid place-items-center w-11 h-11 rounded-lg bg-primary/15 text-primary shrink-0">
                    <Icon name={c.icon} size={22} />
                  </span>
                  <div>
                    <div className="text-sm text-muted-foreground">{c.t}</div>
                    <div className="font-display font-semibold">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="glass p-8 neon-border">
            <h3 className="font-display text-2xl font-bold mb-6">Написать сообщение</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Ваше имя" className="bg-input/50 h-12" />
              <Input type="email" placeholder="Email" className="bg-input/50 h-12" />
              <Textarea placeholder="Расскажите о вашем проекте..." className="bg-input/50 min-h-32" />
              <Button className="w-full h-12 font-display uppercase tracking-wide">Отправить</Button>
            </form>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Icon name="Hexagon" size={18} />
            </span>
            SVAROG<span className="text-primary">.TECH</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Svarog.Tech · Разработка ПO с AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
