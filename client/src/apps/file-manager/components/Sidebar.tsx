import React from 'react';
import { HardDrive, Home, Download, Image, FileText, Settings, Monitor, Trash2 } from 'lucide-react';
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
            <div
                onClick={() => navigate(path)}
                className={`mx-2 flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors ${isActive ? 'border border-primary-focus bg-[rgba(0,102,204,0.08)] font-semibold text-ink' : 'text-ink-muted hover:bg-canvas'}`}
            >
                {icon}
                <span>{label}</span>
            </div>
        );
    };

    return (
        <div className="z-10 hidden h-full w-56 flex-shrink-0 select-none flex-col overflow-y-auto border-r border-hairline bg-parchment pt-2 md:flex">
            <div className="mb-1 mt-2 px-5 text-xs font-semibold text-ink-muted-48">Quick Access</div>
            <SidebarItem icon={<Home size={16} className="text-ink-muted-48" />} label="Home" path="/home/user" />
            <SidebarItem icon={<Monitor size={16} className="text-ink-muted-48" />} label="Desktop" path="/home/user/Desktop" />
            <SidebarItem icon={<FileText size={16} className="text-ink-muted-48" />} label="Documents" path="/home/user/Documents" />
            <SidebarItem icon={<Download size={16} className="text-ink-muted-48" />} label="Downloads" path="/home/user/Downloads" />
            <SidebarItem icon={<Image size={16} className="text-ink-muted-48" />} label="Pictures" path="/home/user/Pictures" />
            <SidebarItem icon={<Trash2 size={16} className="text-ink-muted-48" />} label="Trash" path="/home/user/.Trash" />

            <div className="mb-4 mt-2">
                <div className="mb-1 px-4 py-1 text-xs font-semibold text-ink-muted-48">This PC</div>
                <SidebarItem icon={<HardDrive size={16} className="text-ink-muted-48" />} label="Local Disk (C:)" path="/home/user" />
                <SidebarItem icon={<HardDrive size={16} className="text-ink-muted-48" />} label="Data (D:)" path="/data" />
            </div>

            <div className="mb-2">
                <div className="mb-1 px-4 py-1 text-xs font-semibold text-ink-muted-48">System</div>
                <SidebarItem icon={<HardDrive size={16} className="text-ink-muted-48" />} label="Root" path="/" />
                <SidebarItem icon={<Settings size={16} className="text-ink-muted-48" />} label="/etc" path="/etc" />
            </div>

            <DirectoryTree />
        </div>
    );
}
