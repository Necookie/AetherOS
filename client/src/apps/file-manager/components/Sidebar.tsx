import React from 'react';
import { HardDrive, Home, Download, Image, FileText, Database, Sliders, Monitor, Trash2 } from 'lucide-react';
import { useFsStore } from '../../../stores/fsStore';
import DirectoryTree from './DirectoryTree';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
}

export default function Sidebar() {
    const { navigate, currentPath } = useFsStore();

    const SidebarItem = ({ icon, label, path }: SidebarItemProps) => {
        const isActive = currentPath === path;
        return (
            <button
                type="button"
                onClick={() => navigate(path)}
                className={`group mx-1.5 flex w-[calc(100%-0.75rem)] cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-all active:scale-[0.98] ${
                    isActive
                        ? 'bg-primary/10 font-semibold text-primary shadow-2xs'
                        : 'text-ink-muted hover:bg-black/[0.04] hover:text-ink'
                }`}
            >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-ink-muted-48 group-hover:text-ink'}`}>
                    {icon}
                </span>
                <span className="truncate">{label}</span>
            </button>
        );
    };

    return (
        <aside className="z-10 hidden h-full w-52 flex-shrink-0 select-none flex-col overflow-y-auto border-r border-hairline bg-parchment/60 py-2 md:flex">
            <div className="mb-3">
                <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Favorites</div>
                <SidebarItem icon={<Home size={15} />} label="Home" path="/home/user" />
                <SidebarItem icon={<Monitor size={15} />} label="Desktop" path="/home/user/Desktop" />
                <SidebarItem icon={<FileText size={15} />} label="Documents" path="/home/user/Documents" />
                <SidebarItem icon={<Download size={15} />} label="Downloads" path="/home/user/Downloads" />
                <SidebarItem icon={<Image size={15} />} label="Pictures" path="/home/user/Pictures" />
            </div>

            <div className="mb-3">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Locations</div>
                <SidebarItem icon={<HardDrive size={15} />} label="System Root" path="/" />
                <SidebarItem icon={<Database size={15} />} label="Data Volume" path="/data" />
                <SidebarItem icon={<Sliders size={15} />} label="System Config" path="/etc" />
            </div>

            <div className="mb-3">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted-48">Trash</div>
                <SidebarItem icon={<Trash2 size={15} />} label="Trash" path="/home/user/.Trash" />
            </div>

            <DirectoryTree />
        </aside>
    );
}

