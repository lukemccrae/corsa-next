import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

export default function ProfileDropdown() {
  const menuRef = useRef<Menu>(null);

  const items = [
    { label: 'My Profile', icon: 'pi pi-user' },
    { label: 'Settings', icon: 'pi pi-cog' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out' }
  ];

  return (
    <div className="absolute bottom-10 right-8 z-[1000]">
      <Avatar
        image="https://i.imgur.com/iOtuPi3.jpeg"
        size="large"
        shape="circle"
        className="cursor-pointer border-2 border-white shadow-lg hover:scale-105 transition"
        onClick={(e) => menuRef.current?.toggle(e)}
      />
      <Menu model={items} popup ref={menuRef} className="shadow-lg rounded-lg" />
    </div>
  );
}
