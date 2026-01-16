'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [femaleName, setFemaleName] = useState('');
  const [maleName, setMaleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await api.createSession({ email, femaleName, maleName });
      router.push(`/analyze/${session.id}`);
    } catch (err) {
      setError('Не удалось создать сессию. Попробуйте ещё раз.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
                <span className="text-gradient-female">V</span>
                <span className="text-white">o</span>
                <span className="text-gradient-male">x</span>
              </h1>
              <p className="mt-2 text-gray-400 text-lg">
                Голосовая совместимость
              </p>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-12 max-w-lg mx-auto">
              Узнайте, насколько совпадают ваши стили общения. 
              Загрузите голосовые записи и получите детальный анализ совместимости.
            </p>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-6 md:p-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 text-left">
                    Email для получения результатов
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-female-400 mb-2 text-left">
                      Её имя
                    </label>
                    <input
                      type="text"
                      value={femaleName}
                      onChange={(e) => setFemaleName(e.target.value)}
                      placeholder="Анна"
                      required
                      className="w-full px-4 py-3 bg-female-500/10 border border-female-500/20 rounded-xl text-white placeholder-female-300/50 focus:outline-none focus:border-female-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-male-400 mb-2 text-left">
                      Его имя
                    </label>
                    <input
                      type="text"
                      value={maleName}
                      onChange={(e) => setMaleName(e.target.value)}
                      placeholder="Иван"
                      required
                      className="w-full px-4 py-3 bg-male-500/10 border border-male-500/20 rounded-xl text-white placeholder-male-300/50 focus:outline-none focus:border-male-500/50 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-female-500 to-male-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Создание...' : 'Начать анализ'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">
            Как это работает
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Запишите голос',
                description: 'Каждый записывает 1-3 минуты спонтанной речи о себе',
              },
              {
                step: '02',
                title: 'Анализ',
                description: 'ИИ анализирует 8 параметров речи: темп, паузы, лексику',
              },
              {
                step: '03',
                title: 'Результат',
                description: 'Получите детальный отчёт о совместимости на email',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-white/10 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

