import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { User, Project } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const THEMES = [
  { id: 'default', name: 'Обычная', colors: ['#8B5CF6', '#0EA5E9'] },
  { id: 'red', name: 'Красная', colors: ['#DC2626', '#EF4444'] },
  { id: 'blue', name: 'Синяя', colors: ['#2563EB', '#3B82F6'] },
  { id: 'yellow', name: 'Жёлтая', colors: ['#CA8A04', '#EAB308'] },
  { id: 'pink', name: 'Розовая', colors: ['#DB2777', '#EC4899'] },
  { id: 'green', name: 'Зелёная', colors: ['#16A34A', '#22C55E'] },
  { id: 'kids', name: 'Для детей 🌈', colors: ['#A855F7', '#F97316'] },
];

const STICKERS = [
  { emoji: '😊', name: 'Смайлик' },
  { emoji: '❤️', name: 'Сердце' },
  { emoji: '⭐', name: 'Звезда' },
  { emoji: '🔥', name: 'Огонь' },
  { emoji: '🌈', name: 'Радуга' },
  { emoji: '☁️', name: 'Облако' },
  { emoji: '🦋', name: 'Бабочка' },
  { emoji: '🎨', name: 'Палитра' },
  { emoji: '✨', name: 'Магия' },
  { emoji: '🚀', name: 'Ракета' },
];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isChildAccount, setIsChildAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [familyCode, setFamilyCode] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [inputFamilyCode, setInputFamilyCode] = useState('');
  const [childrenProjects, setChildrenProjects] = useState<Project[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#8B5CF6');
  const [drawWidth, setDrawWidth] = useState(5);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('photoStudioUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadProjects(parsedUser.id);
      if (parsedUser.isChild) {
        loadFamilyCode(parsedUser.id);
      } else {
        loadChildren(parsedUser.id);
        loadChildrenProjects(parsedUser.id);
      }
      document.documentElement.setAttribute('data-theme', parsedUser.theme || 'default');
    }
  }, []);

  const loadProjects = async (userId: number) => {
    const data = await api.projects.list(userId);
    if (data.projects) setProjects(data.projects);
  };

  const loadFamilyCode = async (userId: number) => {
    const data = await api.family.getCode(userId);
    if (data.familyCode) setFamilyCode(data.familyCode);
  };

  const loadChildren = async (userId: number) => {
    const data = await api.family.getChildren(userId);
    if (data.children) setChildren(data.children);
  };

  const loadChildrenProjects = async (userId: number) => {
    const data = await api.projects.getChildrenProjects(userId);
    if (data.projects) setChildrenProjects(data.projects);
  };

  const handleLogin = async () => {
    try {
      const data = await api.auth.login(phone);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('photoStudioUser', JSON.stringify(data.user));
        loadProjects(data.user.id);
        document.documentElement.setAttribute('data-theme', data.user.theme || 'default');
        if (data.user.isChild) {
          loadFamilyCode(data.user.id);
        } else {
          loadChildren(data.user.id);
          loadChildrenProjects(data.user.id);
        }
      }
    } catch (error) {
      alert('Пользователь не найден');
    }
  };

  const handleRegister = async () => {
    try {
      const data = await api.auth.register(phone, firstName, lastName, isChildAccount);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('photoStudioUser', JSON.stringify(data.user));
        if (data.user.familyCode) {
          setFamilyCode(data.user.familyCode);
        }
        document.documentElement.setAttribute('data-theme', data.user.theme || 'default');
      }
    } catch (error) {
      alert('Ошибка регистрации');
    }
  };

  const handleThemeChange = async (themeId: string) => {
    if (!user) return;
    await api.users.updateTheme(user.id, themeId);
    const updatedUser = { ...user, theme: themeId };
    setUser(updatedUser);
    localStorage.setItem('photoStudioUser', JSON.stringify(updatedUser));
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCurrentImage(base64);
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = 800;
          canvas.height = 600;
          ctx?.drawImage(img, 0, 0, 800, 600);
        };
        img.src = base64;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProject = async () => {
    if (!user) return;
    const data = await api.projects.create(user.id, 'Новый проект');
    if (data.project) {
      loadProjects(user.id);
    }
  };

  const handleActivateFamilyCode = async () => {
    if (!user) return;
    try {
      await api.family.activateCode(user.id, inputFamilyCode);
      loadChildren(user.id);
      loadChildrenProjects(user.id);
      setShowFamilyDialog(false);
      setInputFamilyCode('');
      alert('Ребенок успешно добавлен!');
    } catch (error) {
      alert('Неверный код');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'draw') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addStickerToCanvas = (emoji: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.font = '80px Arial';
    ctx.fillText(emoji, Math.random() * 600, Math.random() * 500);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await api.users.delete(user.id);
    localStorage.removeItem('photoStudioUser');
    setUser(null);
    setShowDeleteDialog(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('photoStudioUser');
    setUser(null);
    setProjects([]);
    setChildren([]);
    setChildrenProjects([]);
    setCurrentImage(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        <Card className="w-full max-w-md glass-panel-strong border-white/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  onClick={handleLogin}
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Иванов" 
                    className="glass-panel border-white/20"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneReg">Номер телефона</Label>
                  <Input 
                    id="phoneReg" 
                    type="tel" 
                    placeholder="+7 (999) 123-45-67" 
                    className="glass-panel border-white/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isChild"
                    checked={isChildAccount}
                    onChange={(e) => setIsChildAccount(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isChild">Детский аккаунт</Label>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  onClick={handleRegister}
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-panel">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel-strong w-48">
              <DropdownMenuItem onClick={() => setActiveTab('home')}>
                <Icon name="Home" size={16} className="mr-2" />
                Главная
              </DropdownMenuItem>
              {!user.isChild && (
                <DropdownMenuItem onClick={() => setActiveTab('family')}>
                  <Icon name="Users" size={16} className="mr-2" />
                  Семья
                </DropdownMenuItem>
              )}
              {user.isChild && (
                <DropdownMenuItem onClick={() => setActiveTab('family')}>
                  <Icon name="Users" size={16} className="mr-2" />
                  Код семьи
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'home' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Мои проекты</h2>
                <p className="text-gray-400">Все ваши фото в одном месте</p>
              </div>
              <Button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-purple-500 to-cyan-500"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Создать проект
              </Button>
            </div>

            {currentImage && (
              <Card className="glass-panel-strong p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { id: 'draw', icon: 'Pencil', label: 'Рисование' },
                      { id: 'stickers', icon: 'Smile', label: 'Стикеры' },
                      { id: 'filters', icon: 'Contrast', label: 'Фильтры' },
                      { id: 'effects', icon: 'Wand2', label: 'Эффекты' },
                    ].map((tool) => (
                      <Button
                        key={tool.id}
                        variant={selectedTool === tool.id ? 'default' : 'outline'}
                        onClick={() => setSelectedTool(tool.id)}
                        className="glass-panel"
                      >
                        <Icon name={tool.icon} size={18} className="mr-2" />
                        {tool.label}
                      </Button>
                    ))}
                  </div>

                  {selectedTool === 'draw' && (
                    <div className="glass-panel p-4 space-y-3">
                      <div>
                        <Label>Цвет</Label>
                        <div className="flex gap-2 mt-2">
                          {['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'].map((color) => (
                            <button
                              key={color}
                              onClick={() => setDrawColor(color)}
                              className={cn(
                                'w-8 h-8 rounded-full border-2',
                                drawColor === color ? 'border-white' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Толщина: {drawWidth}px</Label>
                        <Slider
                          value={[drawWidth]}
                          onValueChange={(v) => setDrawWidth(v[0])}
                          min={1}
                          max={50}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {selectedTool === 'stickers' && (
                    <div className="glass-panel p-4">
                      <div className="grid grid-cols-5 gap-3">
                        {STICKERS.map((sticker) => (
                          <button
                            key={sticker.emoji}
                            onClick={() => addStickerToCanvas(sticker.emoji)}
                            className="glass-panel p-4 text-4xl hover:bg-white/10 rounded-xl transition-all"
                          >
                            {sticker.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full border-2 border-white/20 rounded-xl cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </Card>
            )}

            {projects.length === 0 && !currentImage && (
              <Card className="glass-panel-strong p-12 text-center">
                <Icon name="FolderOpen" size={64} className="mx-auto mb-4 text-gray-500" />
                <p className="text-lg mb-4">У вас пока нет проектов</p>
                <Button onClick={handleCreateProject} className="bg-gradient-to-r from-purple-500 to-cyan-500">
                  Создать первый проект
                </Button>
              </Card>
            )}

            {projects.length > 0 && (
              <div className="grid grid-cols-4 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="glass-panel overflow-hidden group cursor-pointer hover:border-purple-500/50">
                    <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-cyan-900/30" />
                    <div className="p-3">
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!user.isChild && childrenProjects.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Проекты детей</h3>
                <div className="grid grid-cols-4 gap-6">
                  {childrenProjects.map((project) => (
                    <Card key={project.id} className="glass-panel overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-pink-900/30 to-orange-900/30" />
                      <div className="p-3">
                        <p className="text-sm font-medium">{project.title}</p>
                        <p className="text-xs text-gray-500">{project.childName}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'family' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Семья</h2>
            
            {user.isChild ? (
              <Card className="glass-panel-strong p-8 text-center">
                <Icon name="Users" size={64} className="mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">Ваш код семьи</h3>
                <p className="text-gray-400 mb-6">Отправьте этот код родителям</p>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                  {familyCode || 'Загрузка...'}
                </div>
                <p className="text-sm text-gray-500">
                  Родители смогут видеть ваши проекты после активации кода
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="glass-panel-strong p-6">
                  <h3 className="text-lg font-semibold mb-4">Добавить ребенка</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Введите код семьи"
                      value={inputFamilyCode}
                      onChange={(e) => setInputFamilyCode(e.target.value)}
                      className="glass-panel border-white/20"
                    />
                    <Button onClick={handleActivateFamilyCode} className="bg-gradient-to-r from-purple-500 to-cyan-500">
                      Активировать
                    </Button>
                  </div>
                </Card>

                {children.length > 0 && (
                  <Card className="glass-panel-strong p-6">
                    <h3 className="text-lg font-semibold mb-4">Подключенные дети</h3>
                    <div className="space-y-3">
                      {children.map((child) => (
                        <div key={child.id} className="glass-panel p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{child.firstName} {child.lastName}</p>
                            <p className="text-sm text-gray-500">Код: {child.familyCode}</p>
                          </div>
                          <Icon name="CheckCircle" size={20} className="text-green-400" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Настройки</h2>
            
            <div className="space-y-6">
              <Card className="glass-panel-strong p-6">
                <h3 className="text-lg font-semibold mb-4">Профиль</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Имя</Label>
                    <Input className="glass-panel border-white/20 mt-2" defaultValue={user.firstName} />
                  </div>
                  <div>
                    <Label>Фамилия</Label>
                    <Input className="glass-panel border-white/20 mt-2" defaultValue={user.lastName} />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input className="glass-panel border-white/20 mt-2" defaultValue={user.phone} disabled />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isChildSetting"
                      checked={user.isChild}
                      readOnly
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isChildSetting">Детский аккаунт</Label>
                  </div>
                </div>
              </Card>

              <Card className="glass-panel-strong p-6">
                <h3 className="text-lg font-semibold mb-4">Тема оформления</h3>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={cn(
                        'glass-panel p-4 rounded-xl text-left transition-all hover:bg-white/10',
                        user.theme === theme.id && 'border-2 border-purple-500'
                      )}
                    >
                      <div className="flex gap-2 mb-2">
                        {theme.colors.map((color) => (
                          <div key={color} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <p className="font-medium">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full">
                Удалить аккаунт
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel-strong border-t border-white/10 p-4 flex justify-center">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
          size="icon"
        >
          <Icon name="Plus" size={32} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-panel-strong">
          <DialogHeader>
            <DialogTitle>Удалить аккаунт?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 mb-4">Это действие нельзя отменить</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
