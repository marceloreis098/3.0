import React, { useRef, useEffect } from 'react';
import { Page } from '../types';
import Icon from './common/Icon';
import { icons } from 'lucide-react';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  pages: Page[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const pageIcons: { [key in Page]: keyof typeof icons } = {
    'Dashboard': 'LayoutDashboard',
    'Inventário de Equipamentos': 'Computer',
    'Controle de Licenças': 'ScrollText',
    'Usuários e Permissões': 'Users',
    'Configurações': 'Settings',
    'Auditoria': 'History',
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, pages, isSidebarOpen, setIsSidebarOpen }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth < 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, setIsSidebarOpen]);

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            ></div>

            <aside
                ref={sidebarRef}
                className={`fixed lg:relative inset-y-0 left-0 bg-brand-secondary text-white w-64 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}
            >
                <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
                    <Icon name="ShieldCheck" size={32} className="text-brand-primary" />
                    <h1 className="text-2xl font-bold ml-2">Inventário Pro</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => {
                                setActivePage(page);
                                if(window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors text-left ${
                                activePage === page
                                ? 'bg-brand-primary text-white'
                                : 'hover:bg-gray-700'
                            }`}
                        >
                            <Icon name={pageIcons[page] || 'FileText'} size={20} />
                            <span className="ml-4">{page}</span>
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
