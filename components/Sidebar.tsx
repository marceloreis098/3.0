import React from 'react';
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

const developerPhoto = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmQAAAAAAAABzS0gAQAAAPd3d3cbeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZXNjAAAA/AAAAHxjcHJ0AAABeAAAACh3dHB0AAABoAAAABRia3B0AAABsAAAABRyWFlaAAABxAAAABRnWFlaAAAB2AAAABRiWFlaAAAB7AAAABRkZXNjAAAAAAAAABFsY2QgZGVzY3JpcHRpb24gY3VydgAAAAAAAAABIAAAAAEAAAAAAAAAAAAAAAAAAAAAAGRlc2MAAAAAAAAAEmxjZCBjdXJ2IGRlc2NyaXB0aW9uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjdXJ2AAAAAAAABAAAAAARcGFyYQAAAAADAAAAAmZmAADypwAADVkAABPQAAAKWAAAAAAAAAABYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9jdXJ2AAAAAAAAAAIAAAAA02N1cnYAAAAAAAAAAwAAAAA3Y3VydgAAAAAAAAAEAAAAAEdYWVogAAAAAAAA9sYAAQAAAADTLXNmMzIAAAAAAAABDEIAAAFlAAAAVwAAAAAAAAAAAAAAAAAAAAAAdGV4dAAAAABDb3B5cmlnaHQgKGMpIDE5OTggSGV3bGV0dC1BQWNrYXJkIENvbXBhbnkAAGRlc2MAAAAAAAAAEnNSR0IgSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAASc1JHQiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAAb6IAADj1AAADkG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAJAAAABwAQwBhAHIAYgBvAG4AIABSAEUAUwBDAE4AIAByAHAAbABhAGMAZQBtAGUAbgB0IABJAEMAYwBvAG4AcwAA/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8IAEQgAeAB4AwEiAAIRAQMRAf/EABwAAQACAwEBAQAAAAAAAAAAAAAFBgMEBwIBCAD/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAH3QAAAAAAACkAAAAAAABSgAAAAAAApQAAAAAAAUoAAAAAACCkAAAAAAAAABtL0E2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwKkL+2T+zL1tU14M/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwKkO5vG/z9K43N/hO6a3fO0zF5S6lK1f2eT+3qE6Kq9oAAUAAAAAAAFKAAAAAAACtqjP11sCtqjP11sCtqjP11sCtqjP11sCkj6x2T+zN4tE5M/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwK2qM/XWwKkH/wA3+ZtX5S7L1v2nF93/AEPK+36a/P1/QAACgAAAAAAApQAAAAAAAUoAAAAAAAAA/8QALxAAAgICAAUCAwkAAAAAAAAAAQIAAwQFEQYSExQhIjEzIjRBUGBxIiUwcYGRsf/aAAgBAQABBQL/APbYk18s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a+MvS2kR0M7c/G1k6r0x1+Z/C1c7J+a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a+KstN6p/L61lF6+fL71F99VlB+Z/F25U6oV/J0rF3S+fL71F99VlB+a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a+KstN6p/L61lF6+fL71F99VlB+Z/E3X6r7d7/AJOld/wL58vvUX31WUH5ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9r4q30l6v6X1rO2l/ny+9RffVZQfmfwO+63L/k6Vv2r+nL71F99VlB+a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a8s3Fp+d5c/a+KstN6p/L61lF6+fL71F99VlB+Z/C1s26oF/J0rWLWl58vvUX31WUH5ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9ryzcWn53lz9r/xAAlEQADAAIBBAIDAQEBAAAAAAAAAREhMRBBUWFxIIGRocHR8PH/2gAIAQEAAT8h/wDtsE/f/tY0+Lw3f1hP2P8A9vGnw+Ld/WE/Y/8A28afD4t39YT9j/8Abxp8Pi3f1hP2P/28afD4t39YT9j/APbYy2uHk/K8/q/8h+1xS/6zB/eJ/Z/tP+Hwf+i3f1hP2P8A9vGnw+Ld/WE/Y/8A28afD4t39YT9j/8Abxp8Pi3f1hP2P/28afD4t39YT9j/APbxt8Pi3f1hP2P/ANvG3w+Ld/WE/Y//AG8bfD4t39YT9j/9vG3w+Ld/WE/Y/wD28bfD4t39YT9j/wDbxt8Pi3f1hP2P/wBvG3w+Ld/WE/Y//bxt8Pi3f1hP2P8A9vG3w+Ld/WE/Y/8A28bfD4t39YT9j/8Abxt8Pi3f1hP2P/28bfD4t39YT9j/APbxt8Pi3f1hP2P/ANvG3w+Ld/WE/Y//AG8bfD4t39YT9j/9vG3w+Ld/WE/Y/wD28a/DwTn54flef1f+Q/bL3D3h+cT+z/bS6/8Bu3f1hP2P/wBvG3w+Ld/WE/Y//bxt8Pi3f1hP2P8A9vG3w+Ld/WE/Y/8A28bfD4t39YT9j/8Abxt8Pi3f1hP2P/28bfD4t39Yf+F/h0XYi5E+EvwG2P7jF6xn1j9z+J/C/wCz/CP8H/J0bv6wn7H/AO3jb4fFu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rCfsf/t42+Hxbv6wn7H/AO3jb4fFu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rCfsf/t42+Hxbv6wn7H/AO3jX4eCc/PD8rz+r/yH7Z9U/r/1if2f7XFf4t3dYT9j/wDbxt8Pi3f1hP2P/wBvG3w+Ld/WE/Y//bxt8Pi3f1hP2P8A9vG3w+Ld/WE/Y/8A28bfD4t39YT9j/8Abxt8Pi3f1h/4f+HQdyLki+B/w/txduM+sZ9Y/ifwv+z/AAjfg/5Ojd/WE/Y//bxt8Pi3f1hP2P8A9vG3w+Ld/WE/Y/8A28bfD4t39YT9j/8Abxt8Pi3f1hP2P/28bfD4t39YT9j/APbxt8Pi3f1hP2P/ANvG3w+Ld/WE/Y//AG8bfD4t39YT9j/9vG3w+Ld/WE/Y/wD28bfD4t39YT9j/wDbxt8Pi3f1hP2P/wBvGvw+Hc/N/wCT8rz+r/yH7Z9U/r/1if2f7aXTon8Fu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rCfsf/t42+Hxbv6wn7H/AO3jb4fFu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rD/wv8Oi7EXInwl+A2x/cYvWc+sfuPxP4X/Z/hH+L/k6N39YT9j/APbxt8Pi3f1hP2P/ANvG3w+Ld/WE/Y//AG8bfD4t39YT9j/9vG3w+Ld/WE/Y/wD28bfD4t39YT9j/wDbxt8Pi3f1hP2P/wBvG3w+Ld/WE/Y//bxt8Pi3f1hP2P8A9vG3w+Ld/WE/Y/8A28bfD4t39YT9j/8Abxr8PBOfnh+V5/V/5D9svce8Pzif2f7aXX/gN27+sJ+x/wDt42+Hxbv6wn7H/wC3jb4fFu/rCfsf/t42+Hxbv6wn7H/AO3jb4fFu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rD/wv8OhnYlyJ8JX4QHYOw5n1jPrH7j8T+F/2f4R/hf8nRu/rCfsf/t42+Hxbv6wn7H/AO3jb4fFu/rCfsf/ALeNvh8W7+sJ+x/+3jb4fFu/rCfsf/t42+Hxbv6wn7H/AO3j/wD/2Q==`;

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, pages, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-brand-secondary text-white flex flex-col z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex-shrink-0`}>
        <div className="h-20 flex items-center justify-center px-4 border-b border-gray-700">
          <Icon name="ShieldCheck" size={28} className="text-brand-primary" />
          <h1 className="text-xl font-bold ml-2">Inventário Pro</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {pages.map(page => (
              <li key={page}>
                <button
                  onClick={() => {
                    setActivePage(page);
                    setIsSidebarOpen(false); // Close on mobile navigation
                  }}
                  className={`flex items-center w-full text-left p-4 hover:bg-brand-dark transition-colors ${activePage === page ? 'bg-brand-dark border-l-4 border-brand-primary' : ''}`}
                >
                  <Icon name={pageIcons[page] || 'File'} size={20} className="mr-3" />
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="h-20 border-t border-gray-700 flex items-center justify-center gap-3 text-xs">
           <img
            src={developerPhoto}
            alt="Foto do Desenvolvedor"
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-500"
          />
          <div className="text-left">
            <p className="font-semibold text-gray-200">MRR INFORMATICA</p>
            <p className="text-gray-400">&copy; 2025 Dev: Marcelo Reis</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;