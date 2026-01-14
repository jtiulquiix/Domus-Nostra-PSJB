import { Booking, BookingStatus, Room, User, UserRole, AppConfig } from '../types';

// Constants for LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'app_users',
  ROOMS: 'app_rooms',
  BOOKINGS: 'app_bookings',
  CURRENT_USER: 'app_current_user',
  CONFIG: 'app_config'
};

// Internal interface for stored users (includes password)
interface StoredUser extends User {
  password?: string;
}

// Initial Seed Data - Modified to have only 1 room initially
const SEED_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Salón Parroquial Principal',
    capacity: 50,
    features: ['Proyector', 'Aire Acondicionado', 'Pizarrón', 'Sillas'],
    imageUrl: 'https://picsum.photos/400/300?random=1'
  }
];

const SEED_USERS: StoredUser[] = [
  { id: 'u1', username: 'admin', password: 'password', role: UserRole.ADMIN, name: 'Administrador Principal' },
  { id: 'u2', username: 'user', password: 'password', role: UserRole.USER, name: 'Juan Pérez' },
];

const SEED_CONFIG: AppConfig = {
  appName: 'Parish Booker',
  appLogo: 'fa-church'
};

// Helper to initialize data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(SEED_ROOMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(SEED_CONFIG));
  }
};

initializeStorage();

export const StorageService = {
  // Config Logic
  getAppConfig: (): Promise<AppConfig> => {
    return new Promise((resolve) => {
      const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || JSON.stringify(SEED_CONFIG));
      resolve(config);
    });
  },

  updateAppConfig: (config: AppConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
      setTimeout(() => resolve(true), 400);
    });
  },

  // Auth Logic
  login: (username: string, passwordInput: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        // Check password (simple check for prototype)
        if (user && user.password === passwordInput) {
          // Remove password before returning/storing in session
          const { password, ...safeUser } = user;
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
          resolve(safeUser);
        } else {
          resolve(null);
        }
      }, 500); // Fake network delay
    });
  },

  register: (name: string, username: string, password: string): Promise<User | string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
          resolve("El nombre de usuario ya existe.");
          return;
        }

        const newUser: StoredUser = {
          id: `u-${Date.now()}`,
          username,
          password,
          name,
          role: UserRole.USER // Default role for new registrations
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Auto login after register
        const { password: _, ...safeUser } = newUser;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
        
        resolve(safeUser);
      }, 600);
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  updatePassword: (userId: string, newPassword: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const updatedUsers = users.map(u => {
          if (u.id === userId) {
            return { ...u, password: newPassword };
          }
          return u;
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        resolve(true);
      }, 500);
    });
  },

  // Room Logic
  getRooms: (): Promise<Room[]> => {
    return new Promise((resolve) => {
      const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
      resolve(rooms);
    });
  },

  addRoom: (roomData: Omit<Room, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const rooms: Room[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
      const newRoom: Room = {
        ...roomData,
        id: `room-${Date.now()}` // Generate ID
      };
      rooms.push(newRoom);
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      resolve(true);
    });
  },

  updateRoom: (updatedRoom: Room): Promise<boolean> => {
    return new Promise((resolve) => {
      const rooms: Room[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
      const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(newRooms));
      resolve(true);
    });
  },

  deleteRoom: (roomId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // 1. Remove the room
      const rooms: Room[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
      const newRooms = rooms.filter(r => r.id !== roomId);
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(newRooms));

      // 2. Cascade delete: Remove all bookings associated with this room to prevent errors
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const newBookings = bookings.filter(b => b.roomId !== roomId);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(newBookings));

      resolve(true);
    });
  },

  // Booking Logic
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString(),
        status: BookingStatus.PENDING,
        createdAt: Date.now()
      };

      bookings.push(newBooking);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      
      setTimeout(() => resolve(true), 600);
    });
  },

  getBookings: (): Promise<Booking[]> => {
    return new Promise((resolve) => {
      const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      // Sort by newest first
      resolve(bookings.sort((a: Booking, b: Booking) => b.createdAt - a.createdAt));
    });
  },

  updateBookingStatus: (bookingId: string, status: BookingStatus): Promise<boolean> => {
    return new Promise((resolve) => {
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
      resolve(true);
    });
  },

  updateBooking: (updatedBooking: Booking): Promise<boolean> => {
    return new Promise((resolve) => {
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const newBookings = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(newBookings));
      resolve(true);
    });
  }
};