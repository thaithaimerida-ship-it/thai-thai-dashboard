# Dashboard THAI THAI - Instrucciones Completas

## 📁 Archivos del Proyecto

El archivo `thai-thai-dashboard-20260223-0609.zip` contiene todo el proyecto Next.js 15 actualizado.

---

## 🔐 Credenciales (RESGUARDAR EN LUGAR SEGURO)

Crear archivo `.env.local` con:

```env
GOOGLE_CLIENT_EMAIL=thai-thai-api@thai-thai-dashboard.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[TU_CLAVE_PRIVADA_AQUI]\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=17LNxz8jXPWF9G2d0Rwa1Mzw-6s1brtJzYufnyOI42FI
```

### Dónde encontrar las credenciales:
- Google Cloud Console: https://console.cloud.google.com
- Proyecto: `thai-thai-dashboard`
- Service Account: `thai-thai-api@thai-thai-dashboard.iam.gserviceaccount.com`

---

## 📊 Google Sheet

**Link:** https://docs.google.com/spreadsheets/d/17LNxz8jXPWF9G2d0Rwa1Mzw-6s1brtJzYufnyOI42FI

### Pestañas utilizadas:

| Pestaña | Uso | Columnas clave |
|---------|-----|----------------|
| `Ingresos_BD` | Ventas y comisiones | Fecha, Fuente/Cliente, Monto Bruto (+), Comisión/Retención (-), Monto Neto |
| `Gastos_BD` | Gastos operativos | Fecha, Total, Categoría, Grupo P&L |
| `Cortes_de_Caja` | Comensales diarios | Fecha, No. de Comensales |

### Categorías de Gastos importantes:
- **Costo de Venta**: Insumos Alimentos, Insumos Bebidas, Desechables
- **Gastos Operativos**: Nómina, Renta, Servicios, Marketing, etc.
- **Financiero/Impuestos**: Impuestos Sat, Prestamo BBVA (no se incluyen en gastos operativos)

---

## 🎯 KPIs Configurados

### Ventas y Objetivos:
| Métrica | PE | Objetivo |
|---------|-----|----------|
| Ventas Mensuales | $295,000 | $325,000 |
| Comensales | 990 | 1,100 |

### Márgenes:
| KPI | Fórmula | Objetivo |
|-----|---------|----------|
| Utilidad Bruta | (Ventas Netas - Gastos) / Ventas | 15% - 18% |
| Cash Yield | Utilidad Neta / Ventas | 12% - 18% |

### KPIs Operativos:
| KPI | Fórmula | Objetivo |
|-----|---------|----------|
| Food Cost | Costo de Venta / Venta Neta | 28% - 32% |
| Labor | Nómina / Venta Neta | 20% - 25% |
| Costo Primo | Food Cost + Labor | < 60% |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal
│   └── api/
│       ├── sheets/route.ts   # API Google Sheets
│       └── download/route.ts # API descarga archivos
├── components/
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── ThermometerGauge.tsx
│   │   ├── ComisionesPlataformas.tsx
│   │   └── ...
│   └── ui/                   # Componentes shadcn/ui
├── hooks/
│   └── useGoogleSheets.ts    # Conexión con Sheets + parseo
├── data/
│   └── realData.ts           # Constantes del negocio
└── lib/
    └── utils.ts
```

---

## 🚀 Comandos

```bash
# Instalar dependencias
bun install

# Ejecutar en desarrollo (puerto 3000)
bun run dev

# Verificar código
bun run lint
```

---

## 📱 Ver en Celular

### Opción 1: Cloudflare Tunnel (actual)
```
https://cloth-both-schemes-deemed.trycloudflare.com
```

### Opción 2: Red local
Si el celular está en la misma red WiFi:
```bash
# Encontrar IP de la computadora
ip addr show  # Linux
ipconfig      # Windows
```
Luego en el celular: `http://[IP-DE-TU-PC]:3000`

---

## 🔄 Flujo de Datos

1. `useGoogleSheets.ts` hace fetch a `/api/sheets`
2. `/api/sheets/route.ts` conecta con Google Sheets API
3. Los datos se procesan en `procesarDatosDashboard()`
4. Los KPIs se calculan y muestran en `page.tsx`

---

## ⚠️ Notas Importantes

- El proyecto usa Next.js 15 con App Router
- Los componentes UI son de shadcn/ui
- La conexión a Google Sheets usa googleapis
- El puerto es 3000 por defecto
- El archivo `.env.local` NO está incluido en el ZIP por seguridad
- Los datos se actualizan automáticamente desde Google Sheets

---

## 🛠️ Para Continuar con Otra IA

Compartir:
1. El archivo ZIP del proyecto
2. Las credenciales de `.env.local`
3. El link del Google Sheet
4. Este archivo de instrucciones

---

## 📋 Secciones del Dashboard

1. **KPIs Financieros** - Utilidad Bruta, Cash Yield, Ventas Netas, Gastos
2. **KPIs de Restaurante** - Índice vs PE, PE Mensual, Venta Objetivo, Comisiones
3. **Brechas vs Objetivos** - Faltantes de ventas y comensales
4. **KPIs Operativos** - Food Cost, Labor, Costo Primo
5. **Indicadores de Salud** - Termómetros visuales
6. **Comisiones por Plataforma** - Análisis detallado con filtro por mes
7. **Proyección PE** - Cálculo de días para alcanzar PE
8. **Análisis por Fechas** - Filtrar por rango personalizado

---

**Fecha de exportación:** 23 de Febrero 2026
**Versión:** 2.0
