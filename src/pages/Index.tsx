import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);

  const tools = [
    { id: 'animate', icon: 'Sparkles', label: 'Анимация', color: 'text-purple-400' },
    { id: 'draw', icon: 'Pencil', label: 'Рисование', color: 'text-blue-400' },
    { id: 'filters', icon: 'Contrast', label: 'Фильтры', color: 'text-pink-400' },
    { id: 'effects', icon: 'Wand2', label: 'Эффекты', color: 'text-green-400' },
    { id: 'stickers', icon: 'Smile', label: 'Стикеры', color: 'text-yellow-400' },
    { id: 'ai', icon: 'Brain', label: 'AI Tools', color: 'text-cyan-400' },
  ];

  const filters = [
    { name: 'Оригинал', filter: 'none' },
    { name: 'Черно-белое', filter: 'grayscale(100%)' },
    { name: 'Сепия', filter: 'sepia(100%)' },
    { name: 'Винтаж', filter: 'sepia(50%) contrast(120%)' },
    { name: 'Яркость', filter: 'brightness(120%) saturate(130%)' },
    { name: 'Холод', filter: 'hue-rotate(180deg)' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <Card className="w-full max-w-md glass-panel-strong border-white/20 animate-scale-in relative z-10">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-glow">
                <Icon name="Image" size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                AI Photo Studio
              </h1>
              <p className="text-gray-400">Создавайте магию с помощью AI</p>
            </div>

            <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-panel mb-6">
                <TabsTrigger value="login" onClick={() => setIsLogin(true)}>Вход</TabsTrigger>
                <TabsTrigger value="register" onClick={() => setIsLogin(false)}>Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+7 (999) 123-45-67" 
                    className="glass-panel border-white/20"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                  onClick={() => setIsAuthenticated(true)}
                >
                  Войти
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Иван" 
                    className="glass-panel border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Иванов" 
                    className="glass-panel border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneReg">Номер телефона</Label>
                  <Input 
                    id="phoneReg" 
                    type="tel" 
                    placeholder="+7 (999) 123-45-67" 
                    className="glass-panel border-white/20"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                  onClick={() => setIsAuthenticated(true)}
                >
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-panel-strong border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Icon name="Image" size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">AI Photo Studio</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="glass-panel">
              <Icon name="Upload" size={18} className="mr-2" />
              Загрузить фото
            </Button>
            <Button variant="ghost" size="icon" className="glass-panel">
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-20 glass-panel-strong border-r border-white/10 flex flex-col items-center py-6 gap-4">
          {[
            { id: 'editor', icon: 'Sparkles', label: 'Редактор' },
            { id: 'gallery', icon: 'LayoutGrid', label: 'Галерея' },
            { id: 'settings', icon: 'Settings', label: 'Настройки' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all',
                activeTab === item.id
                  ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                  : 'glass-panel hover:bg-white/10'
              )}
            >
              <Icon name={item.icon} size={24} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 flex">
          {activeTab === 'editor' && (
            <>
              <div className="w-80 glass-panel-strong border-r border-white/10 p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Инструменты</h2>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={cn(
                        'p-4 rounded-xl flex flex-col items-center gap-2 transition-all',
                        selectedTool === tool.id
                          ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-2 border-purple-500'
                          : 'glass-panel hover:bg-white/10'
                      )}
                    >
                      <Icon name={tool.icon} size={28} className={tool.color} />
                      <span className="text-sm">{tool.label}</span>
                    </button>
                  ))}
                </div>

                {selectedTool === 'filters' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold mb-3">Настройки</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Яркость: {brightness[0]}%</Label>
                        <Slider 
                          value={brightness} 
                          onValueChange={setBrightness}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Контраст: {contrast[0]}%</Label>
                        <Slider 
                          value={contrast} 
                          onValueChange={setContrast}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Насыщенность: {saturation[0]}%</Label>
                        <Slider 
                          value={saturation} 
                          onValueChange={setSaturation}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-sm font-semibold mb-3">Пресеты</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {filters.map((filter) => (
                          <button
                            key={filter.name}
                            className="p-2 rounded-lg glass-panel hover:bg-white/10 text-xs transition-all"
                          >
                            {filter.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTool === 'ai' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold mb-3">AI Инструменты</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start glass-panel hover:bg-white/10" variant="ghost">
                        <Icon name="Sparkles" size={18} className="mr-2" />
                        Улучшить качество
                      </Button>
                      <Button className="w-full justify-start glass-panel hover:bg-white/10" variant="ghost">
                        <Icon name="Eraser" size={18} className="mr-2" />
                        Удалить фон
                      </Button>
                      <Button className="w-full justify-start glass-panel hover:bg-white/10" variant="ghost">
                        <Icon name="Zap" size={18} className="mr-2" />
                        Автокоррекция
                      </Button>
                      <Button className="w-full justify-start glass-panel hover:bg-white/10" variant="ghost">
                        <Icon name="Wand2" size={18} className="mr-2" />
                        Стилизация
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-950/20 via-blue-950/20 to-cyan-950/20">
                <div className="relative">
                  <div className="w-[600px] h-[400px] rounded-2xl glass-panel-strong flex items-center justify-center border-2 border-dashed border-white/20">
                    <div className="text-center">
                      <Icon name="Upload" size={64} className="mx-auto mb-4 text-gray-500" />
                      <p className="text-lg mb-2">Загрузите фото для редактирования</p>
                      <p className="text-sm text-gray-500">PNG, JPG или GIF до 10MB</p>
                      <Button className="mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                        Выбрать файл
                      </Button>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -right-4 glass-panel-strong rounded-xl p-4 flex gap-2">
                    <Button size="icon" variant="ghost" className="hover:bg-white/10">
                      <Icon name="RotateCcw" size={20} />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-white/10">
                      <Icon name="Download" size={20} />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-white/10">
                      <Icon name="Share2" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'gallery' && (
            <div className="flex-1 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Ваши проекты</h2>
                <p className="text-gray-400">Все созданные изображения в одном месте</p>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card 
                    key={i}
                    className="glass-panel overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-cyan-900/30 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity glass-panel-strong">
                        <Icon name="Eye" size={32} className="text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">Проект {i}</p>
                      <p className="text-xs text-gray-500">2 дня назад</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 p-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">Настройки</h2>
                
                <div className="space-y-6">
                  <Card className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">Профиль</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Имя</Label>
                        <Input className="glass-panel border-white/20 mt-2" defaultValue="Иван" />
                      </div>
                      <div>
                        <Label>Фамилия</Label>
                        <Input className="glass-panel border-white/20 mt-2" defaultValue="Иванов" />
                      </div>
                      <div>
                        <Label>Телефон</Label>
                        <Input className="glass-panel border-white/20 mt-2" defaultValue="+7 (999) 123-45-67" disabled />
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">Настройки редактора</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Автосохранение</p>
                          <p className="text-sm text-gray-500">Сохранять изменения автоматически</p>
                        </div>
                        <Button variant="outline" size="sm" className="glass-panel">
                          Включено
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Качество экспорта</p>
                          <p className="text-sm text-gray-500">Максимальное качество изображений</p>
                        </div>
                        <Button variant="outline" size="sm" className="glass-panel">
                          Высокое
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Button 
                    variant="destructive" 
                    onClick={() => setIsAuthenticated(false)}
                    className="w-full"
                  >
                    Выйти из аккаунта
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
