import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, Room, AppConfig } from '../types';
import { StorageService } from '../services/storage';
import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';
import { RoomEditorModal } from './RoomEditorModal';
import { BookingEditorModal } from './BookingEditorModal';
import { CalendarView } from './CalendarView';

interface AdminDashboardProps {
  onConfigUpdate?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onConfigUpdate }) => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'ROOMS' | 'CALENDAR' | 'CONFIG'>('BOOKINGS');
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [config, setConfig] = useState<AppConfig>({ appName: '', appLogo: '' });
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
  
  // Action State
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // Modals
  const [editingRoom, setEditingRoom] = useState<Room | null>(null); // For edit
  const [isCreatingRoom, setIsCreatingRoom] = useState(false); // For create
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const refreshData = async () => {
    const bData = await StorageService.getBookings();
    const rData = await StorageService.getRooms();
    const cData = await StorageService.getAppConfig();
    setBookings(bData);
    setRooms(rData);
    setConfig(cData);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers for Bookings
  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    setLoadingActionId(bookingId);
    await StorageService.updateBookingStatus(bookingId, status);
    await refreshData();
    setLoadingActionId(null);
  };

  const handleBookingUpdate = async (updatedBooking: Booking) => {
    setLoadingActionId('saving-booking');
    await StorageService.updateBooking(updatedBooking);
    await refreshData();
    setLoadingActionId(null);
    setEditingBooking(null);
  };

  // Handlers for Rooms
  const handleRoomSave = async (roomData: Room) => {
    setLoadingActionId('saving-room');
    if (editingRoom) {
      // Update existing
      await StorageService.updateRoom(roomData);
      setEditingRoom(null);
    } else {
      // Create new (Storage generates ID, roomData.id is ignored)
      await StorageService.addRoom(roomData);
      setIsCreatingRoom(false);
    }
    await refreshData();
    setLoadingActionId(null);
  };

  const handleRoomDelete = async (roomId: string) => {
    if (!window.confirm('¿Estás SEGURO de eliminar este salón definitivamente? \n\nESTA ACCIÓN ES IRREVERSIBLE y eliminará todas las reservas asociadas.')) {
      return;
    }
    setLoadingActionId(`deleting-${roomId}`);
    await StorageService.deleteRoom(roomId);
    await refreshData();
    setLoadingActionId(null);
    setEditingRoom(null);
  };

  // Handler for Config
  const handleConfigSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    await StorageService.updateAppConfig(config);
    if (onConfigUpdate) onConfigUpdate();
    setIsSavingConfig(false);
    alert('Configuración actualizada');
  };

  // Rendering
  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
          <p className="text-gray-500">Gestiona reservas, salones y configuración.</p>
        </div>
        
        {/* Main Tab Switcher */}
        <div className="bg-gray-200 p-1 rounded-lg flex self-start overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${activeTab === 'BOOKINGS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Reservas
          </button>
          <button 
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${activeTab === 'CALENDAR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Calendario
          </button>
          <button 
            onClick={() => setActiveTab('ROOMS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${activeTab === 'ROOMS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Salones
          </button>
          <button 
            onClick={() => setActiveTab('CONFIG')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${activeTab === 'CONFIG' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Configuración
          </button>
        </div>
      </div>

      {activeTab === 'BOOKINGS' && (
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
              <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {(['ALL', BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.REJECTED] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? 'Todas' : f === BookingStatus.PENDING ? 'Pendientes' : f === BookingStatus.APPROVED ? 'Aprobadas' : 'Rechazadas'}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">No hay reservas en esta categoría.</p>
              </div>
            ) : (
              filteredBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <StatusBadge status={booking.status} />
                        <div className="flex items-center gap-2">
                           <button 
                              onClick={() => setEditingBooking(booking)}
                              className="text-gray-400 hover:text-blue-600 p-1"
                              title="Editar Reserva"
                           >
                             <i className="fas fa-pencil-alt"></i>
                           </button>
                           <span className="text-xs text-gray-400">ID: {booking.id.slice(-6)}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{booking.roomName}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><i className="fas fa-user w-6 text-center text-gray-400"></i> {booking.userName}</p>
                        <p><i className="fas fa-calendar w-6 text-center text-gray-400"></i> {booking.date} a las {booking.time}</p>
                        <p><i className="fas fa-clock w-6 text-center text-gray-400"></i> {booking.durationHours} horas</p>
                        <div className="mt-2 bg-gray-50 p-2 rounded-lg text-gray-700 italic border-l-2 border-blue-200">
                          "{booking.purpose}"
                        </div>
                      </div>
                    </div>

                    {booking.status === BookingStatus.PENDING && (
                      <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        <Button 
                          variant="success" 
                          onClick={() => handleStatusChange(booking.id, BookingStatus.APPROVED)}
                          isLoading={loadingActionId === booking.id}
                          className="flex-1 md:flex-none text-sm"
                        >
                          Aprobar
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleStatusChange(booking.id, BookingStatus.REJECTED)}
                          isLoading={loadingActionId === booking.id}
                          className="flex-1 md:flex-none text-sm"
                        >
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'CALENDAR' && (
        <div className="animate-fade-in">
          <CalendarView bookings={bookings} />
        </div>
      )}

      {activeTab === 'ROOMS' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-6">
             <Button onClick={() => setIsCreatingRoom(true)}>
               <i className="fas fa-plus"></i> Crear Nuevo Salón
             </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative">
                
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setEditingRoom(room)}
                          className="bg-white text-gray-900 w-10 h-10 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition flex items-center justify-center hover:bg-gray-50"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleRoomDelete(room.id)}
                          className="bg-red-500 text-white w-10 h-10 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition flex items-center justify-center hover:bg-red-600"
                          title="Eliminar Salón"
                        >
                          {loadingActionId === `deleting-${room.id}` ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{room.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4 mt-1">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                      Cap: {room.capacity}
                    </span>
                    {room.features.map((f, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        {f}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs py-2" onClick={() => setEditingRoom(room)}>
                      Editar
                    </Button>
                    <Button 
                        variant="danger" 
                        className="px-3 py-2" 
                        onClick={() => handleRoomDelete(room.id)} 
                        disabled={!!loadingActionId}
                        title="Eliminar permanentemente"
                    >
                      {loadingActionId === `deleting-${room.id}` ? (
                         <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                         <i className="fas fa-trash"></i>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'CONFIG' && (
        <div className="animate-fade-in max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
           <h3 className="text-xl font-bold text-gray-800 mb-6">Apariencia de la Aplicación</h3>
           <form onSubmit={handleConfigSave} className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Aplicación</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={config.appName}
                  onChange={(e) => setConfig({...config, appName: e.target.value})}
                  required
                />
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Logo / Icono</label>
                <p className="text-xs text-gray-500 mb-2">Ingresa una clase de FontAwesome (ej: <code>fa-church</code>) o una URL de imagen.</p>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={config.appLogo}
                  onChange={(e) => setConfig({...config, appLogo: e.target.value})}
                  required
                />
             </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="text-sm font-medium text-gray-500">Vista Previa:</div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                      {config.appLogo.startsWith('http') ? (
                        <img src={config.appLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <i className={`fas ${config.appLogo} text-white text-lg`}></i>
                      )}
                   </div>
                   <h1 className="font-bold text-gray-800 leading-none">{config.appName || 'Nombre App'}</h1>
                </div>
             </div>

             <Button type="submit" fullWidth isLoading={isSavingConfig}>
               Guardar Cambios
             </Button>
           </form>
        </div>
      )}

      {/* Modals */}
      {(editingRoom || isCreatingRoom) && (
        <RoomEditorModal 
          room={editingRoom}
          onClose={() => { setEditingRoom(null); setIsCreatingRoom(false); }}
          onSave={handleRoomSave}
          onDelete={handleRoomDelete}
          isLoading={loadingActionId === 'saving-room'}
        />
      )}

      {editingBooking && (
        <BookingEditorModal
          booking={editingBooking}
          rooms={rooms}
          onClose={() => setEditingBooking(null)}
          onSave={handleBookingUpdate}
          isLoading={loadingActionId === 'saving-booking'}
        />
      )}

    </div>
  );
};