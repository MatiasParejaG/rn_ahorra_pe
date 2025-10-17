import { LocalCategory } from "@/types/type";

export const DEFAULT_CATEGORIES: LocalCategory[] = [
  // Categorías de Gasto
  { id: "comida", name: "Comida", type: "gasto", icon: "food" },
  { id: "transporte", name: "Transporte", type: "gasto", icon: "bus" },
  { id: "entretenimiento", name: "Entretenimiento", type: "gasto", icon: "gamepad-variant" },
  { id: "educacion", name: "Educación", type: "gasto", icon: "school" },
  { id: "salud", name: "Salud", type: "gasto", icon: "medical-bag" },
  { id: "ropa", name: "Ropa", type: "gasto", icon: "tshirt-crew" },
  { id: "tecnologia", name: "Tecnología", type: "gasto", icon: "laptop" },
  { id: "hogar", name: "Hogar", type: "gasto", icon: "home" },
  { id: "mascotas", name: "Mascotas", type: "gasto", icon: "paw" },
  { id: "belleza", name: "Belleza", type: "gasto", icon: "face-woman" },
  { id: "deportes", name: "Deportes", type: "gasto", icon: "soccer" },
  { id: "viajes", name: "Viajes", type: "gasto", icon: "airplane" },
  { id: "suscripciones", name: "Suscripciones", type: "gasto", icon: "netflix" },
  { id: "restaurantes", name: "Restaurantes", type: "gasto", icon: "silverware-fork-knife" },
  { id: "compras", name: "Compras", type: "gasto", icon: "shopping" },
  { id: "servicios", name: "Servicios", type: "gasto", icon: "toolbox" },
  { id: "otros_gastos", name: "Otros", type: "gasto", icon: "dots-horizontal" },
  
  // Categorías de Ingreso
  { id: "mesada", name: "Mesada", type: "ingreso", icon: "cash" },
  { id: "trabajo", name: "Trabajo", type: "ingreso", icon: "briefcase" },
  { id: "regalo", name: "Regalo", type: "ingreso", icon: "gift" },
  { id: "ahorro", name: "Ahorro", type: "ingreso", icon: "piggy-bank" },
  { id: "freelance", name: "Freelance", type: "ingreso", icon: "laptop" },
  { id: "venta", name: "Venta", type: "ingreso", icon: "currency-usd" },
  { id: "beca", name: "Beca", type: "ingreso", icon: "school" },
  { id: "inversion", name: "Inversión", type: "ingreso", icon: "chart-line" },
  { id: "otros_ingresos", name: "Otros", type: "ingreso", icon: "plus-circle" },
];