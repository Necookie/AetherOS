import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface DraggableWindowProps {
    title: string
    children: React.ReactNode
    onClose: () => void
    initialPos?: { x: number, y: number }
    size?: { w: number, h: number }
}

export default function DraggableWindow({ title, children, onClose, initialPos = { x: 100, y: 100 }, size = { w: 600, h: 400 } }: DraggableWindowProps) {
    const [pos, setPos] = useState(initialPos)
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: pos.x,
            initialY: pos.y
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return
            setPos({
                x: dragRef.current.initialX + (e.clientX - dragRef.current.startX),
                y: Math.max(0, dragRef.current.initialY + (e.clientY - dragRef.current.startY))
            })
        }
        const handleMouseUp = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div
            className="absolute bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            style={{
                left: pos.x,
                top: pos.y,
                width: size.w,
                height: size.h
            }}
        >
            <div
                className="h-10 bg-gray-800 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-white/10 select-none"
                onMouseDown={handleMouseDown}
            >
                <div className="font-semibold text-sm text-gray-200">{title}</div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-4 h-4 text-gray-300" />
                </button>
            </div>
            <div className="flex-1 overflow-auto bg-black/50 p-1">
                {children}
            </div>
        </div>
    )
}
