'use client';
import React, { useMemo, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

type Channel = {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: string;
  live?: boolean;
  viewers?: number;
};

const formatViewers = (n?: number) => {
  if (n == null) return '';
  if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
  return `${n}`;
};

function ChannelItem({ channel }: { channel: Channel }) {
  const router = useRouter();
  const { theme } = useTheme();

  const itemHoverClass = theme === 'dark' ? 'hover:bg-white/6' : 'hover:bg-gray-100';
  const subtitleClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const viewersClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-600';

  return (
    <li
      key={channel.id}
      className={`flex items-center justify-between px-1 py-2 rounded cursor-pointer ${itemHoverClass}`}
      role="button"
      onClick={() => router.push(`/live/${channel.name}`)}
    >
      <div className="flex items-center gap-3">
        <Avatar
          image={channel.avatar}
          label={!channel.avatar ? channel.name?.charAt(0).toUpperCase() : undefined}
          shape="circle"
          size="large"
          className="!w-10 !h-10"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{channel.name}</span>
          {channel.subtitle && <span className={`text-xs ${subtitleClass}`}>{channel.subtitle}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end">
        {channel.live ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 block" />
            <span className={`text-xs ${viewersClass}`}>{formatViewers(channel.viewers)}</span>
          </div>
        ) : (
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Offline</span>
        )}
      </div>
    </li>
  );
}

function ChannelSection({
  title,
  channels,
  onShowMore,
}: {
  title: string;
  channels: Channel[];
  onShowMore?: () => void;
}) {
  return (
    <section>
      <h4 className="text-xs font-semibold text-gray-400 px-1 mb-2">{title}</h4>
      <ul className="flex flex-col gap-1">
        {channels.map((c) => (
          <ChannelItem key={c.id} channel={c} />
        ))}
      </ul>
      {onShowMore && (
        <button
          className="mt-2 ml-1 text-sm text-violet-400 hover:underline"
          onClick={onShowMore}
        >
          Show More
        </button>
      )}
    </section>
  );
}

export default function Sidebar({
  followedChannels,
  liveChannels,
  className = '',
}: {
  followedChannels?: Channel[];
  liveChannels?: Channel[];
  className?: string;
}) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const followed = useMemo<Channel[]>(
    () =>
      followedChannels ?? [
        { id: '1', name: 'Raxxanterax', subtitle: 'Path of Exile', avatar: '/demo/raxx.png', live: true, viewers: 1400 },
        { id: '2', name: 'EvadeR', avatar: '/demo/evade.png' },
        { id: '3', name: 'Pikabooiirl', avatar: '/demo/pika.png' },
        { id: '4', name: 'jmls', avatar: '/demo/jmls.png' },
        { id: '5', name: 'LVTHalo', avatar: '/demo/lvt.png' },
      ],
    [followedChannels]
  );

  const live = useMemo<Channel[]>(
    () =>
      liveChannels ?? [
        { id: 'a', name: 'Ninja +2', subtitle: 'ARC Raiders', avatar: '/demo/ninja.png', live: true, viewers: 13000 },
        { id: 'b', name: 'aPG', subtitle: 'Halo Infinite', avatar: '/demo/apg.png', live: true, viewers: 303 },
        { id: 'c', name: 'scump', subtitle: 'Battlefield REDSEC', avatar: '/demo/scump.png', live: true, viewers: 2800 },
        { id: 'd', name: 'Echidna', subtitle: 'Halo Infinite', avatar: '/demo/echidna.png', live: true, viewers: 34 },
        { id: 'e', name: 'LastShot', subtitle: 'Halo Infinite', avatar: '/demo/lastshot.png', live: true, viewers: 106 },
      ],
    [liveChannels]
  );

  if (collapsed) {
    return (
      <aside
        className={`hidden md:flex flex-col items-center justify-start w-14 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} ${className}`}
      >
        <button
          onClick={() => setCollapsed(false)}
          className={`mt-3 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          aria-label="Open sidebar"
        >
          <i className="pi pi-angle-right text-xl" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`hidden md:flex flex-col w-72 max-w-[18rem] h-full shadow-xl ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} ${className}`}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-white/6' : 'border-gray-200'}`}>
        <div>
          <h3 className="text-lg font-semibold">Discover</h3>
          <p className="text-xs text-gray-400">Live activity</p>
        </div>
        <Button
          icon="pi pi-angle-left"
          className={`p-button-rounded p-button-text ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
        />
      </div>

      <div className="px-3 py-3 overflow-auto space-y-4">
        <ChannelSection title="Trackers" channels={live} onShowMore={() => console.log('show more live')} />
      </div>
    </aside>
  );
}