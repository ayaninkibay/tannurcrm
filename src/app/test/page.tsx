'use client';

import React, { useRef, useState, useEffect } from 'react';
import Rive from '@rive-app/react-canvas';

const DirectStateMachineTest = () => {
  const riveRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [stateMachine, setStateMachine] = useState(null);
  const [inputs, setInputs] = useState({});

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Пытаемся получить доступ к State Machine через ref
  useEffect(() => {
    const attempts = [];
    
    const tryGetStateMachine = () => {
      if (!riveRef.current) return;
      
      try {
        // Способ 1: через rive property
        if (riveRef.current.rive) {
          const rive = riveRef.current.rive;
          addLog('Найден rive instance через .rive');
          
          // Пытаемся получить State Machine
          if (rive.stateMachineInputs) {
            try {
              const smInputs = rive.stateMachineInputs('Login Machine');
              if (smInputs) {
                setStateMachine(rive);
                setInputs(smInputs);
                addLog(`State Machine найден! Входы: ${Object.keys(smInputs).join(', ')}`);
                return;
              }
            } catch (e) {
              addLog(`Ошибка получения SM: ${e.message}`);
            }
          }
        }
        
        // Способ 2: поиск по всем свойствам ref
        const refProps = Object.getOwnPropertyNames(riveRef.current);
        addLog(`Свойства ref: ${refProps.join(', ')}`);
        
        // Ищем объекты с методами Rive
        for (const prop of refProps) {
          const obj = riveRef.current[prop];
          if (obj && typeof obj === 'object' && obj.stateMachineInputs) {
            addLog(`Найден Rive через ${prop}`);
            try {
              const smInputs = obj.stateMachineInputs('Login Machine');
              if (smInputs) {
                setStateMachine(obj);
                setInputs(smInputs);
                addLog(`State Machine найден через ${prop}! Входы: ${Object.keys(smInputs).join(', ')}`);
                return;
              }
            } catch (e) {
              addLog(`SM через ${prop} неудачно: ${e.message}`);
            }
          }
        }
        
        addLog('State Machine не найден через ref');
        
      } catch (error) {
        addLog(`Общая ошибка: ${error.message}`);
      }
    };

    // Пробуем несколько раз с задержками
    const intervals = [1000, 2000, 3000, 5000];
    intervals.forEach(delay => {
      setTimeout(tryGetStateMachine, delay);
    });

    return () => intervals.forEach(id => clearTimeout(id));
  }, []);

  // Альтернативный способ - через canvas и события
  useEffect(() => {
    const tryCanvasAccess = () => {
      if (!riveRef.current) return;

      // Ищем canvas элемент внутри компонента
      const canvasElements = riveRef.current.querySelectorAll('canvas');
      addLog(`Найдено canvas элементов: ${canvasElements.length}`);
      
      if (canvasElements.length > 0) {
        const canvas = canvasElements[0];
        addLog(`Canvas размер: ${canvas.width}x${canvas.height}`);
        
        // Пытаемся найти связанные с canvas данные
        for (const prop in canvas) {
          if (prop.includes('rive') || prop.includes('state')) {
            addLog(`Canvas свойство: ${prop}`);
          }
        }
      }
    };

    // Пробуем через MutationObserver следить за изменениями DOM
    const observer = new MutationObserver(() => {
      tryCanvasAccess();
    });

    if (riveRef.current) {
      observer.observe(riveRef.current, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      tryCanvasAccess();
    }

    return () => observer.disconnect();
  }, []);

  // Попробуем через глобальные объекты
  useEffect(() => {
    const checkGlobals = () => {
      // Проверяем window на наличие Rive объектов
      const globals = Object.keys(window).filter(key => 
        key.toLowerCase().includes('rive')
      );
      addLog(`Глобальные Rive объекты: ${globals.join(', ') || 'не найдены'}`);
      
      // Проверяем наличие Rive в модулях
      if (window.__RIVE_INSTANCES__) {
        addLog('Найден __RIVE_INSTANCES__');
      }
    };

    setTimeout(checkGlobals, 1000);
  }, []);

  // Исправленное создание instance
  useEffect(() => {
    const createRiveInstance = async () => {
      try {
        addLog('Исправляем импорт WASM...');
        
        // Правильный импорт
        const { Rive } = await import('@rive-app/canvas');
        
        // Загружаем файл
        const response = await fetch('/assets/animated_login_character.riv');
        const arrayBuffer = await response.arrayBuffer();
        
        // Создаем временный canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 300;
        
        // Создаем Rive instance
        const rive = new Rive({
          buffer: arrayBuffer,
          canvas: tempCanvas,
          autoplay: true,
          stateMachines: ['Login Machine'],
          onLoad: () => {
            addLog('Исправленный Rive instance создан');
            
            // Получаем State Machine
            try {
              if (rive.stateMachineInputs) {
                const smInputs = rive.stateMachineInputs('Login Machine');
                if (smInputs) {
                  // Получаем правильные имена входов
                  const inputNames = {};
                  for (let i = 0; i < Object.keys(smInputs).length; i++) {
                    const input = smInputs[i];
                    if (input && input.name) {
                      inputNames[input.name] = input;
                      addLog(`Вход ${i}: ${input.name} (тип: ${input.type || 'неизвестно'})`);
                    } else {
                      inputNames[`input_${i}`] = input;
                      addLog(`Вход ${i}: без имени`);
                    }
                  }
                  
                  setStateMachine(rive);
                  setInputs(inputNames);
                  addLog(`SM найден! Входы: ${Object.keys(inputNames).join(', ')}`);
                } else {
                  addLog('stateMachineInputs вернул null');
                }
              } else {
                addLog('Метод stateMachineInputs недоступен');
              }
            } catch (e) {
              addLog(`SM ошибка: ${e.message}`);
            }
          },
          onLoadError: (error) => {
            addLog(`Исправленная загрузка ошибка: ${error}`);
          }
        });
        
      } catch (error) {
        addLog(`Исправленное создание ошибка: ${error.message}`);
      }
    };

    setTimeout(createRiveInstance, 3000);
  }, []);

  // Тестирование входов
  const testInput = (inputName) => {
    if (!inputs[inputName]) {
      addLog(`Вход ${inputName} недоступен`);
      return;
    }
    
    try {
      const input = inputs[inputName];
      
      if (inputName === 'numLook') {
        input.value = 50;
        addLog(`${inputName} установлен в 50`);
      } else if (inputName.includes('trig')) {
        input.fire();
        addLog(`${inputName} активирован`);
      } else {
        input.value = !input.value;
        addLog(`${inputName} переключен в ${input.value}`);
      }
    } catch (error) {
      addLog(`Ошибка ${inputName}: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>State Machine через прямой импорт</h1>
      
      {/* Rive компонент */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Rive анимация</h3>
        <div style={{ 
          width: '400px', 
          height: '300px', 
          border: '1px solid #ccc', 
          margin: '0 auto' 
        }}>
          <Rive 
            ref={riveRef}
            src="/assets/animated_login_character.riv"
            stateMachines="Login Machine"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Статус */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Статус</h3>
        <p>State Machine: {stateMachine ? 'Найден' : 'Не найден'}</p>
        <p>Входы: {Object.keys(inputs).join(', ') || 'Нет'}</p>
      </div>

      {/* Кнопки тестирования */}
      {Object.keys(inputs).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Управление</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.keys(inputs).map(inputName => (
              <button 
                key={inputName}
                onClick={() => testInput(inputName)}
                style={{ padding: '10px', cursor: 'pointer' }}
              >
                {inputName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Интерактивные поля */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Интерактивный тест</h3>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => {
              if (inputs.numLook) {
                inputs.numLook.value = Math.min(e.target.value.length * 10, 100);
                addLog(`numLook установлен в ${inputs.numLook.value}`);
              }
            }}
            onFocus={() => {
              if (inputs.isChecking) {
                inputs.isChecking.value = true;
                addLog('isChecking включен');
              }
            }}
            onBlur={() => {
              if (inputs.isChecking) {
                inputs.isChecking.value = false;
                addLog('isChecking выключен');
              }
            }}
            style={{ padding: '10px', border: '1px solid #ccc' }}
          />
          
          <input
            type="password"
            placeholder="Password"
            onFocus={() => {
              if (inputs.isHandsUp) {
                inputs.isHandsUp.value = true;
                addLog('isHandsUp включен');
              }
            }}
            onBlur={() => {
              if (inputs.isHandsUp) {
                inputs.isHandsUp.value = false;
                addLog('isHandsUp выключен');
              }
            }}
            style={{ padding: '10px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {/* Логи */}
      <div>
        <h3>Логи</h3>
        <div style={{ 
          height: '300px', 
          overflow: 'auto', 
          background: '#f5f5f5', 
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #ccc'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <button 
          onClick={() => setLogs([])} 
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Очистить
        </button>
      </div>
    </div>
  );
};

export default DirectStateMachineTest;