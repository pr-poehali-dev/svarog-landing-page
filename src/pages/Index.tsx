import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { getUser } from '@/lib/api';

const NAV = [
  { id: 'hero', label: 'Главная' },
  { id: 'flow', label: 'Как это работает' },
  { id: 'faq', label: 'Вопросы' },
  { id: 'contacts', label: 'Контакты' },
];

const FLOW = [
  { icon: 'UserPlus', t: 'Регистрация', d: 'Создаёте аккаунт без подтверждений и сразу попадаете в кабинет' },
  { icon: 'FileText', t: 'Описание программы', d: 'Прописываете, что должна делать ваша программа' },
  { icon: 'Sparkles', t: 'AI-анализ', d: 'Сварог анализирует задачу и подбирает всё необходимое' },
  { icon: 'MessagesSquare', t: 'Переговоры о цене', d: 'В чате обсуждаете стоимость разработки со Сварогом' },
  { icon: 'BadgeCheck', t: 'Согласие на оплату', d: 'Подтверждаете — заказ попадает к оператору Никите' },
  { icon: 'Rocket', t: 'Старт разработки', d: 'Никита подтверждает оплату и согласует сроки и этапы' },
];

const FAQ = [
  { q: 'Как AI Сварог обрабатывает заказ?', a: 'Сварог анализирует ваше описание, подбирает технологии, домены, хостинг и специалистов, рассчитывает стоимость и ведёт переговоры о цене прямо в чате вашего кабинета.' },
  { q: 'Что происходит после согласия на оплату?', a: 'У администратора Никиты появляется галочка, что вы подтвердили оплату. Дальше он лично согласует с вами оплату, сроки и этапы разработки.' },
  { q: 'Что входит в расчёт стоимости?', a: 'Домены, хостинг, базы данных, подписки на сервисы и привлекаемые специалисты — тестировщики, дизайнеры, аналитики.' },
  { q: 'Сколько занимает разработка?', a: 'От 3 дней для лендинга до нескольких недель для сложных систем. Точный срок Сварог называет после анализа проекта.' },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Index = () => {
  const navigate = useNavigate();
  const user = getUser();
  const goCabinet = () => navigate(user ? (user.is_admin ? '/admin' : '/dashboard') : '/auth');

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
              <button key={n.id} onClick={() => scrollTo(n.id)} className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors font-display uppercase tracking-wide">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin')} className="hidden sm:block text-xs text-muted-foreground hover:text-secondary px-2">
              Админ
            </button>
            <Button onClick={goCabinet} className="font-display uppercase tracking-wide">
              {user ? 'Кабинет' : 'Начать'}
            </Button>
          </div>
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
              Зарегистрируйтесь, опишите программу — Сварог проанализирует задачу
              и обсудит с вами стоимость разработки прямо в личном кабинете.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={goCabinet} className="font-display uppercase tracking-wide text-base h-14 px-8">
                <Icon name="Rocket" size={20} className="mr-2" />
                {user ? 'Перейти в кабинет' : 'Зарегистрироваться'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('flow')} className="font-display uppercase tracking-wide text-base h-14 px-8 border-secondary text-secondary hover:bg-secondary/10">
                <Icon name="PlayCircle" size={20} className="mr-2" />
                Как это работает
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
            {[{ n: '180+', l: 'проектов' }, { n: '24/7', l: 'AI-поддержка' }, { n: '3 дня', l: 'до запуска' }, { n: '99%', l: 'довольных' }].map((s) => (
              <Card key={s.l} className="glass p-6 text-center">
                <div className="font-display text-3xl font-bold gradient-text">{s.n}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flow" className="py-24 relative">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-display text-primary uppercase tracking-widest text-sm">Процесс</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Как это работает</h2>
            <p className="text-muted-foreground text-lg">От идеи до старта разработки — шесть шагов.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FLOW.map((f, i) => (
              <Card key={f.t} className="glass p-6 hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/15 text-primary">
                    <Icon name={f.icon} size={22} />
                  </span>
                  <span className="font-display text-3xl font-bold text-muted/40">0{i + 1}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-1">{f.t}</h3>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </Card>
            ))}
          </div>
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
                <AccordionTrigger className="font-display text-left text-lg hover:no-underline hover:text-primary">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24">
        <div className="container">
          <Card className="glass p-10 neon-border max-w-4xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Готовы начать?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Создайте аккаунт и опишите программу — Сварог уже ждёт. По вопросам пишите оператору Никите.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={goCabinet} className="font-display uppercase tracking-wide h-14 px-8">
                <Icon name="Rocket" size={20} className="mr-2" /> Начать проект
              </Button>
              <a href="mailto:ni8888kita@yandex.ru">
                <Button size="lg" variant="outline" className="font-display uppercase tracking-wide h-14 px-8 w-full">
                  <Icon name="Mail" size={20} className="mr-2" /> Написать Никите
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Icon name="Mail" size={16} /> ni8888kita@yandex.ru · Оператор Никита
            </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground"><Icon name="Hexagon" size={18} /></span>
            SVAROG<span className="text-primary">.TECH</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Svarog.Tech · Разработка ПО с AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
