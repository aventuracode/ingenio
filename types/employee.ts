export type Employee = {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  puesto: string
  activo: boolean
  avatar_url?: string
  fecha_ingreso?: string
  created_at?: string
}

export type EmployeeFormData = {
  nombre: string
  apellido: string
  dni: string
  email: string
  puesto: string
  fecha_ingreso: string
  activo: boolean
}
