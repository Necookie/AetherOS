import React, { useState, useRef, useEffect } from 'react'
import { X, Minus, Square } from 'lucide-react'

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
            className="absolute glass-panel rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl border border-white/60"
            style={{
                left: pos.x,
                top: pos.y,
                width: size.w,
                height: size.h
            }}
        >
            <div
                className="h-10 bg-white/50 backdrop-blur-md flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/40 select-none"
                onMouseDown={handleMouseDown}
            >
                <div className="font-semibold text-xs text-gray-700 ml-2 flex items-center space-x-2">
                    {title}
                </div>

                <div className="flex space-x-1">
                    <button className="p-1.5 hover:bg-black/5 rounded-md text-gray-600 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-black/5 rounded-md text-gray-600 transition-colors">
                        <Square className="w-3 h-3" />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-500 hover:text-white rounded-md text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50/50 p-2">
                {children}
            </div>
        </div>
    )
}
