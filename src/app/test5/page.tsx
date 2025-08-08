'use client'
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Home, Target, Award, Plus, X } from 'lucide-react';

const HouseBuildingGame = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Составить план на день', type: 'foundation', completed: false },
    { id: 2, text: 'Выполнить рабочий проект', type: 'walls', completed: false },
    { id: 3, text: 'Заниматься спортом 30 мин', type: 'fence', completed: false },
    { id: 4, text: 'Прочитать 20 страниц книги', type: 'windows', completed: false },
    { id: 5, text: 'Связаться с друзьями', type: 'door', completed: false },
    { id: 6, text: 'Завершить недельный проект', type: 'roof', completed: false },
    { id: 7, text: 'Заняться хобби 1 час', type: 'garden', completed: false },
  ]);

  const [newTask, setNewTask] = useState('');
  const [selectedType, setSelectedType] = useState('walls');

  const taskTypes = [
    { value: 'foundation', label: '🏗️ Планирование', element: 'Фундамент' },
    { value: 'walls', label: '💼 Работа', element: 'Стены' },
    { value: 'roof', label: '🎯 Проекты', element: 'Крыша' },
    { value: 'windows', label: '📚 Обучение', element: 'Окна' },
    { value: 'door', label: '👥 Общение', element: 'Дверь' },
    { value: 'fence', label: '💪 Здоровье', element: 'Забор' },
    { value: 'garden', label: '🎨 Хобби', element: 'Сад' }
  ];

  const getBuiltElements = () => {
    const built = {};
    taskTypes.forEach(({ value }) => {
      built[value] = tasks.some(task => task.type === value && task.completed);
    });
    return built;
  };

  const builtElements = getBuiltElements();
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
      setTasks([...tasks, {
        id: newId,
        text: newTask.trim(),
        type: selectedType,
        completed: false
      }]);
      setNewTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-700 relative overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0">
        {/* Солнце/луна */}
        <div className="absolute top-16 right-20 w-24 h-24 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-80 blur-sm"></div>
        <div className="absolute top-20 right-24 w-16 h-16 bg-emerald-200 rounded-full opacity-60"></div>
        
        {/* Облака */}
        <div className="absolute top-12 left-20 w-32 h-8 bg-emerald-600 rounded-full opacity-40"></div>
        <div className="absolute top-8 left-40 w-24 h-6 bg-emerald-600 rounded-full opacity-30"></div>
        
        {/* Деревья силуэты */}
        <div className="absolute bottom-0 right-10 w-16 h-32 bg-gradient-to-t from-emerald-950 to-emerald-800 opacity-60" 
             style={{ clipPath: 'polygon(40% 100%, 60% 100%, 80% 60%, 90% 40%, 70% 20%, 50% 0%, 30% 20%, 10% 40%, 20% 60%)' }}></div>
        <div className="absolute bottom-0 right-32 w-12 h-24 bg-gradient-to-t from-emerald-950 to-emerald-800 opacity-50" 
             style={{ clipPath: 'polygon(45% 100%, 55% 100%, 75% 70%, 85% 50%, 65% 30%, 50% 10%, 35% 30%, 15% 50%, 25% 70%)' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-100 mb-4 tracking-wide">
            СТРОЙ СВОЙ ДОМ
          </h1>
          <p className="text-emerald-200 text-lg opacity-80">
            Выполняй задачи и наблюдай, как растет твой дом
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Визуализация дома */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-emerald-800/30 to-teal-900/30 backdrop-blur-sm rounded-2xl border border-emerald-400/20 p-8">
              {/* Прогресс */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-emerald-100 font-medium">Прогресс строительства</span>
                  <span className="text-emerald-200 text-sm">{completedTasks}/{totalTasks}</span>
                </div>
                <div className="w-full bg-emerald-900/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700 rounded-full shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Дом - большая атмосферная версия */}
              <div className="flex justify-center">
                <svg width="500" height="400" viewBox="0 0 500 400" className="rounded-lg">
                  {/* Фон неба */}
                  <defs>
                    <radialGradient id="skyGradient" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#047857" stopOpacity="0.1"/>
                    </radialGradient>
                    <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#065f46"/>
                      <stop offset="100%" stopColor="#064e3b"/>
                    </linearGradient>
                  </defs>
                  
                  <rect width="500" height="400" fill="url(#skyGradient)" />
                  
                  {/* Земля */}
                  <rect x="0" y="300" width="500" height="100" fill="url(#groundGradient)" />
                  
                  {/* Холмы на заднем плане */}
                  <path d="M0,280 Q100,250 200,270 T400,265 L500,275 L500,300 L0,300 Z" fill="#065f46" opacity="0.6"/>
                  
                  {/* Сад */}
                  {builtElements.garden && (
                    <g opacity="0.8">
                      <ellipse cx="100" cy="320" rx="25" ry="15" fill="#166534"/>
                      <ellipse cx="130" cy="315" rx="20" ry="12" fill="#15803d"/>
                      <ellipse cx="370" cy="325" rx="22" ry="14" fill="#166534"/>
                      <ellipse cx="400" cy="318" rx="18" ry="10" fill="#15803d"/>
                      <circle cx="110" cy="310" r="8" fill="#22c55e" opacity="0.7"/>
                      <circle cx="385" cy="312" r="6" fill="#22c55e" opacity="0.7"/>
                    </g>
                  )}

                  {/* Забор */}
                  {builtElements.fence && (
                    <g opacity="0.9">
                      {/* Левый забор */}
                      <rect x="50" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="65" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="80" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="95" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="48" y="290" width="50" height="4" fill="#0f172a"/>
                      
                      {/* Правый забор */}
                      <rect x="400" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="415" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="430" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="445" y="280" width="6" height="35" fill="#0f172a"/>
                      <rect x="398" y="290" width="50" height="4" fill="#0f172a"/>
                    </g>
                  )}

                  {/* Фундамент */}
                  {builtElements.foundation && (
                    <rect x="150" y="270" width="200" height="30" fill="#1e293b" stroke="#334155" strokeWidth="2" opacity="0.9"/>
                  )}

                  {/* Стены */}
                  {builtElements.walls && (
                    <rect x="160" y="180" width="180" height="90" fill="#0f172a" stroke="#1e293b" strokeWidth="2" opacity="0.9"/>
                  )}

                  {/* Крыша */}
                  {builtElements.roof && (
                    <polygon points="140,180 250,120 360,180" fill="#0c0a09" stroke="#1c1917" strokeWidth="2" opacity="0.9"/>
                  )}

                  {/* Дверь */}
                  {builtElements.door && (
                    <g opacity="0.9">
                      <rect x="225" y="230" width="50" height="40" fill="#1c1917"/>
                      <circle cx="260" cy="250" r="3" fill="#fbbf24"/>
                    </g>
                  )}

                  {/* Окна */}
                  {builtElements.windows && (
                    <g opacity="0.8">
                      <rect x="180" y="200" width="30" height="30" fill="#fbbf24" opacity="0.6"/>
                      <rect x="290" y="200" width="30" height="30" fill="#fbbf24" opacity="0.6"/>
                      <line x1="195" y1="200" x2="195" y2="230" stroke="#0f172a" strokeWidth="2"/>
                      <line x1="180" y1="215" x2="210" y2="215" stroke="#0f172a" strokeWidth="2"/>
                      <line x1="305" y1="200" x2="305" y2="230" stroke="#0f172a" strokeWidth="2"/>
                      <line x1="290" y1="215" x2="320" y2="215" stroke="#0f172a" strokeWidth="2"/>
                    </g>
                  )}

                  {/* Человечек рядом с домом */}
                  <g transform="translate(120,250)" opacity="0.7">
                    <circle cx="0" cy="0" r="8" fill="#dc2626"/>
                    <rect x="-4" y="8" width="8" height="20" fill="#dc2626"/>
                    <rect x="-6" y="12" width="4" height="12" fill="#dc2626"/>
                    <rect x="2" y="12" width="4" height="12" fill="#dc2626"/>
                    <rect x="-3" y="28" width="3" height="8" fill="#dc2626"/>
                    <rect x="0" y="28" width="3" height="8" fill="#dc2626"/>
                  </g>
                </svg>
              </div>

              {/* Легенда элементов */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {taskTypes.map(({ value, element }) => (
                  <div key={value} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    builtElements[value] 
                      ? 'bg-emerald-400/20 border border-emerald-400/30' 
                      : 'bg-emerald-900/20 border border-emerald-700/20'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      builtElements[value] ? 'bg-emerald-400' : 'bg-emerald-700'
                    }`}></div>
                    <span className={`text-sm ${
                      builtElements[value] ? 'text-emerald-100' : 'text-emerald-300'
                    }`}>
                      {element}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Панель задач */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-800/40 to-teal-900/40 backdrop-blur-sm rounded-2xl border border-emerald-400/20 p-6 h-full">
              <h2 className="text-2xl font-bold text-emerald-100 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Задачи
              </h2>

              {/* Добавление задачи */}
              <div className="mb-6 space-y-3">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-600/30 rounded-lg text-emerald-100 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Новая задача..."
                    className="flex-1 p-3 bg-emerald-900/50 border border-emerald-600/30 rounded-lg text-emerald-100 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                  <button
                    onClick={addTask}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Список задач */}
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {tasks.map(task => {
                  const taskType = taskTypes.find(t => t.value === task.type);
                  return (
                    <div key={task.id} className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      task.completed 
                        ? 'bg-emerald-500/20 border-emerald-400/30 shadow-lg' 
                        : 'bg-emerald-900/30 border-emerald-700/20 hover:border-emerald-600/30'
                    }`}>
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-emerald-600 hover:text-emerald-400" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          task.completed ? 'line-through text-emerald-300' : 'text-emerald-100'
                        }`}>
                          {task.text}
                        </div>
                        <div className="text-xs text-emerald-400 mt-1">
                          {taskType?.label}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-emerald-500 hover:text-red-400 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Статистика достижений */}
              {progress > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                  <div className="flex items-center gap-2 text-emerald-200 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Прогресс: {Math.round(progress)}%</span>
                  </div>
                  {progress === 100 && (
                    <div className="text-emerald-300 text-sm">
                      🎉 Дом построен! Поздравляем!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 95, 70, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 211, 153, 0.7);
        }
      `}</style>
    </div>
  );
};

export default HouseBuildingGame;