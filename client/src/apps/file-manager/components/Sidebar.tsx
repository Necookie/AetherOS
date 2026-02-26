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
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded mx-2 text-sm ${isActive ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-white/5 text-gray-300'
                    }`}
            >
                {icon}
                <span>{label}</span>
            </div>
        );
    };

    return (
        <div className="w-48 bg-[#18181b] border-r border-[#3f3f46] flex flex-col py-2 select-none overflow-y-auto hidden md:flex">
            <div className="text-xs font-semibold text-gray-500 px-5 mb-1 mt-2">Quick Access</div>
            <SidebarItem icon={<Home size={16} />} label="Home" path="/home/user" />
            <SidebarItem icon={<Monitor size={16} />} label="Desktop" path="/home/user/Desktop" />
            <SidebarItem icon={<FileText size={16} />} label="Documents" path="/home/user/Documents" />
            <SidebarItem icon={<Download size={16} />} label="Downloads" path="/home/user/Downloads" />
            <SidebarItem icon={<Image size={16} />} label="Pictures" path="/home/user/Pictures" />

            <div className="text-xs font-semibold text-gray-500 px-5 mb-1 mt-4">This PC</div>
            <SidebarItem icon={<HardDrive size={16} />} label="Local Disk (C:)" path="/home/user" />
            <SidebarItem icon={<HardDrive size={16} />} label="Data (D:)" path="/data" />

            <div className="text-xs font-semibold text-gray-500 px-5 mb-1 mt-4">System</div>
            <SidebarItem icon={<HardDrive size={16} className="text-red-400" />} label="Root" path="/" />
            <SidebarItem icon={<Settings size={16} className="text-gray-400" />} label="/etc" path="/etc" />
        </div>
    );
}
