# Dashboard THAI THAI - Instrucciones para Continuar Desarrollo

## 📁 Archivos del Proyecto

El archivo `thai-thai-dashboard-20260223.zip` contiene todo el proyecto Next.js 15.

## 🔧 Requisitos para Continuar

### 1. Credenciales de Google Cloud
Necesitarás crear un archivo `.env.local` con:

```env
GOOGLE_CLIENT_EMAIL=thai-thai-api@thai-thai-dashboard.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[TU_CLAVE_PRIVADA_AQUI]\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=17LNxz8jXPWF9G2d0Rwa1Mzw-6s1brtJzYufnyOI42FI
```

### 2. Google Sheet
- **Link:** https://docs.google.com/spreadsheets/d/17LNxz8jXPWF9G2d0Rwa1Mzw-6s1brtJzYufnyOI42FI
- **Pestañas importantes:**
  - `Ingresos_BD` - Ingresos con columnas: Fecha, Fuente/Cliente, Categoría, Monto Bruto (+), Comisión/Retención (-), Monto Neto
  - `Gastos_BD` - Gastos con columnas: Fecha, Proveedor, Total, Categoría, Grupo P&L
  - `Cortes_de_Caja` - Cortes diarios con No. de Comensales en columna J

## 📊 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx          # Dashboard principal
│   └── api/sheets/route.ts  # API para Google Sheets
├── components/
│   ├── dashboard/        # Componentes del dashboard
│   └── ui/               # Componentes shadcn/ui
├── hooks/
│   └── useGoogleSheets.ts # Hook para conectar con Sheets
├── data/
│   └── realData.ts       # Constantes y funciones
└── lib/
    └── utils.ts          # Utilidades
```

## 🎯 KPIs Configurados

### Ventas
- PE Mensual: $295,000
- Venta Objetivo: $325,000

### Comensales
- PE Mensual: 990 comensales
- Objetivo Mensual: 1,100 comensales

### Márgenes
- Objetivo mínimo: 15%
- Objetivo excelente: 18%

## 🚀 Comandos

```bash
# Instalar dependencias
bun install

# Ejecutar en desarrollo
bun run dev

# Verificar código
bun run lint
```

## 📝 Instrucciones para la Nueva IA

1. Descomprimir el ZIP en un directorio
2. Crear `.env.local` con las credenciales
3. Ejecutar `bun install`
4. La página principal está en `src/app/page.tsx`
5. Los datos se procesan en `src/hooks/useGoogleSheets.ts`

## ⚠️ Notas Importantes

- El proyecto usa Next.js 15 con App Router
- Los componentes UI son de shadcn/ui
- La conexión a Google Sheets usa googleapis
- El puerto es 3000 por defecto
- El archivo `.env.local` NO está incluido en el ZIP por seguridad

## 🔄 Flujo de Datos

1. `useGoogleSheets.ts` hace fetch a `/api/sheets`
2. `/api/sheets/route.ts` conecta con Google Sheets API
3. Los datos se procesan en `procesarDatosDashboard()`
4. Los KPIs se calculan y muestran en `page.tsx`

---
Fecha de exportación: Febrero 2026
