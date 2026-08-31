import React from 'react';
import { Home, Calendar, Users, Settings, BookOpen } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  todayCount?: number;
  activeCoursesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  todayCount = 0,
  activeCoursesCount = 0,
}) => {
  const tabs = [
    { id: 'INICIO' as ActiveTab, label: 'INICIO', icon: Home, badge: todayCount > 0 ? todayCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'CALENDARIO' as ActiveTab, label: 'CALENDARIO', icon: Calendar },
    { id: 'PERSONAS' as ActiveTab, label: 'PERSONAS', icon: Users },
    { id: 'CURSOS' as ActiveTab, label: 'CURSOS', icon: BookOpen, badge: activeCoursesCount > 0 ? activeCoursesCount : undefined, badgeColor: 'bg-indigo-600' },
    { id: 'MAS' as ActiveTab, label: 'MÁS', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg safe-bottom">
      <div className="max-w-xl mx-auto px-1.5 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCourse = tab.id === 'CURSOS';

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-tab-${tab.id.toLowerCase()}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 relative transition-all active:scale-95 ${
                isActive 
                  ? (isCourse ? 'text-indigo-800' : 'text-teal-800') 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-xl transition-colors ${
                  isActive ? (isCourse ? 'bg-indigo-50 text-indigo-800' : 'bg-teal-50 text-teal-800') : ''
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                {tab.badge !== undefined && (
                  <span className={`absolute -top-1 -right-1.5 px-1 min-w-[15px] h-3.5 rounded-full text-white font-black text-[9px] flex items-center justify-center shadow-xs ${tab.badgeColor || 'bg-amber-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9.5px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive 
                  ? (isCourse ? 'font-extrabold text-indigo-900' : 'font-extrabold text-teal-900') 
                  : 'font-semibold text-slate-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
