import React from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { HardDrive, Home, Download, Image, FileText, Settings, Monitor } from 'lucide-react';

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
                className={`mx-2 flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${isActive ? 'border border-indigo-500/40 bg-indigo-500/20 font-medium text-indigo-200' : 'text-slate-300 hover:bg-slate-800/70'}`}
            >
                {icon}
                <span>{label}</span>
            </div>
        );
    };

    return (
        <div className="z-10 hidden h-full w-48 flex-shrink-0 select-none flex-col overflow-y-auto border-r border-slate-700 bg-slate-900/60 pt-2 md:flex">
            <div className="mb-1 mt-2 px-5 text-xs font-semibold text-slate-500">Quick Access</div>
            <SidebarItem icon={<Home size={16} />} label="Home" path="/home/user" />
            <SidebarItem icon={<Monitor size={16} />} label="Desktop" path="/home/user/Desktop" />
            <SidebarItem icon={<FileText size={16} />} label="Documents" path="/home/user/Documents" />
            <SidebarItem icon={<Download size={16} />} label="Downloads" path="/home/user/Downloads" />
            <SidebarItem icon={<Image size={16} />} label="Pictures" path="/home/user/Pictures" />

            <div className="mb-4">
                <div className="mb-1 px-4 py-1 text-xs font-semibold text-slate-500">This PC</div>
                <SidebarItem icon={<HardDrive size={16} />} label="Local Disk (C:)" path="/home/user" />
                <SidebarItem icon={<HardDrive size={16} />} label="Data (D:)" path="/data" />
            </div>

            <div className="mb-4">
                <div className="mb-1 px-4 py-1 text-xs font-semibold text-slate-500">System</div>
                <SidebarItem icon={<HardDrive size={16} className="text-red-300" />} label="Root" path="/" />
                <SidebarItem icon={<Settings size={16} className="text-slate-400" />} label="/etc" path="/etc" />
            </div>
        </div>
    );
}
