import React, { useState } from 'react';
import { Booking, Room } from '../types';
import { Button } from './ui/Button';
import { AvailabilityViewer } from './AvailabilityViewer';

interface BookingModalProps {
  room: Room;
  existingBookings: Booking[];
  onClose: () => void;
  onSubmit: (date: string, time: string, duration: number, purpose: string) => void;
  isLoading: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({ room, existingBookings, onClose, onSubmit, isLoading }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && purpose) {
      onSubmit(date, time, duration, purpose);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg">Reservar {room.name}</h3>
            <p className="text-blue-100 text-sm">Capacidad: {room.capacity} personas</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reserva</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Availability Visualization */}
            {date && (
              <AvailabilityViewer 
                date={date} 
                bookings={existingBookings} 
                roomId={room.id} 
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                <div className="relative">
                  <input 
                    type="time" 
                    required
                    min="08:00"
                    max="22:00"
                    step="3600" // Prefer full hours
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <span className="absolute right-8 top-3 text-xs text-gray-400 pointer-events-none hidden md:block">(8am-10pm)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(h => (
                    <option key={h} value={h}>{h} {h === 1 ? 'hora' : 'horas'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la reserva</label>
              <textarea 
                required
                placeholder="Ej: Reunión de catequesis, Grupo de oración..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};