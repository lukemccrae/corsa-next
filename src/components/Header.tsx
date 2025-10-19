import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';

export const Header = () => {
  const items = [
    { label: 'Home', icon: 'pi pi-home', url: '/' },
    { label: 'Map', icon: 'pi pi-map', url: '/map' },
    { label: 'About', icon: 'pi pi-info-circle', url: '/about' },
  ];

  return (
    <header className="w-full bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">My App</h1>
        <Menubar model={items} className="bg-blue-600 border-none text-white" />
      </div>
    </header>
  );
};
