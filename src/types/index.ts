// ─── Auth ─────────────────────────────────────────────────────────────────────
export type Role = 'ALUMNO' | 'PROFESOR' | 'ADMIN'

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  peso?: number
  genero?: string
  anioNacimiento?: number
  nacionalidad?: string
  foto?: string
  role: Role
  createdAt?: string
}

export interface AuthResponse {
  message: string
  token: string
  expiresAt: string
  user: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'email' | 'role' | 'foto'>
}

// ─── Clases ───────────────────────────────────────────────────────────────────
export type Disciplina = 'NOGI' | 'MUAY_THAI' | 'MMA' | 'WRESTLING'
export type Sala = 'SALA_1' | 'SALA_2'

export interface Clase {
  id: number
  titulo: string
  disciplina: Disciplina
  sala: Sala
  fecha: string
  horaInicio: string
  horaFin: string
  aforo: number
  profesorId?: number
  profesor?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto'>
  _count?: { reservas: number }
  createdAt: string
}

// ─── Reservas ─────────────────────────────────────────────────────────────────
export type EstadoReserva = 'RESERVADO' | 'CANCELADO'

export interface Reserva {
  id: number
  usuarioId: number
  claseId: number
  estado: EstadoReserva
  enCola: boolean
  posicion?: number
  clase?: Clase
  createdAt: string
}

// ─── Noticias ─────────────────────────────────────────────────────────────────
export interface Noticia {
  id: number
  titulo: string
  contenido: string
  autorId: number
  autor?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto' | 'role'>
  createdAt: string
  updatedAt: string
}

// ─── Productos ────────────────────────────────────────────────────────────────
export type Talla = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type Categoria = 'ROPA' | 'EQUIPAMIENTO' | 'ACCESORIOS'

export interface ProductoTalla {
  id: number
  productoId: number
  talla?: Talla
  stock: number
}

export interface Producto {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  categoria: Categoria
  imagen?: string
  tallas: ProductoTalla[]
  createdAt: string
}

// ─── Carrito ──────────────────────────────────────────────────────────────────
export interface ItemCarrito {
  id: number
  carritoId: number
  productoId: number
  talla?: Talla
  cantidad: number
  producto: Producto
}

export interface Carrito {
  id: number
  usuarioId: number
  items: ItemCarrito[]
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────
export interface ItemPedido {
  id: number
  pedidoId: number
  productoId: number
  talla?: Talla
  cantidad: number
  precio: number
  producto?: Pick<Producto, 'id' | 'nombre' | 'imagen'>
}

export interface Pedido {
  id: number
  usuarioId: number
  createdAt: string
  items: ItemPedido[]
  total: number
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────
export interface EstadisticaDisciplina {
  disciplina: Disciplina
  asistencias: number
}

export interface MisEstadisticas {
  estadisticas: EstadisticaDisciplina[]
  totalAsistencias: number
}

export interface RankingEntry {
  posicion: number
  usuario?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto'>
  reservas: number
}

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ListResponse<T> {
  data: T[]
}
