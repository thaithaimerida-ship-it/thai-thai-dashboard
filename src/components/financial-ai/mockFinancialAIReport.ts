import type { FinancialReport } from '@/lib/financial-ai/schema';

export const mockFinancialAIReport: FinancialReport = {
  metadata: {
    periodo: '2026-04',
    tipo_periodo: 'monthly',
    fecha_generacion: '2026-05-03T15:30:00.000Z',
    estado_reporte: 'cerrado',
    locked: true,
  },
  resumen_ejecutivo:
    'Abril cerro con utilidad operativa positiva y control aceptable de costos principales. El principal foco de atencion es mantener la rentabilidad por canal, porque las comisiones reducen el margen neto de ventas digitales.',
  diagnostico_general: {
    estado_mes: 'sano_con_alertas',
    lectura:
      'El mes muestra ventas suficientes para sostener la operacion, con presion moderada en canales comisionados y oportunidad de mejorar mezcla de venta directa.',
    principal_riesgo:
      'Dependencia de canales con comision elevada que comprimen el ingreso neto.',
    principal_oportunidad:
      'Aumentar participacion de canal directo y reforzar seguimiento semanal de margen neto.',
  },
  kpis_ejecutivos: [
    {
      nombre: 'Ingresos netos',
      valor_real: '$486,240',
      objetivo: '$475,000',
      gap: '+$11,240',
      estado: 'verde',
      lectura: 'El ingreso neto supera el objetivo mensual de referencia.',
    },
    {
      nombre: 'Food cost',
      valor_real: '30.8%',
      objetivo: '30.0%',
      gap: '+0.8 pp',
      estado: 'amarillo',
      lectura: 'El costo de insumos esta ligeramente arriba del objetivo.',
    },
    {
      nombre: 'Labor cost',
      valor_real: '22.4%',
      objetivo: '24.0%',
      gap: '-1.6 pp',
      estado: 'verde',
      lectura: 'La nomina se mantiene dentro de rango saludable.',
    },
  ],
  semaforo_kpis: [
    {
      nombre: 'Costo primo',
      valor_real: '53.2%',
      objetivo: '55.0%',
      estado: 'verde',
      lectura: 'Food cost y labor cost combinados se mantienen bajo el umbral objetivo.',
    },
    {
      nombre: 'Comisiones',
      valor_real: '6.1%',
      objetivo: '5.0%',
      estado: 'amarillo',
      lectura: 'Las comisiones requieren vigilancia por su impacto en margen neto.',
    },
    {
      nombre: 'Gastos operativos',
      valor_real: '$102,780',
      objetivo: '$98,000',
      estado: 'amarillo',
      lectura: 'Hay una desviacion moderada que conviene revisar por categoria.',
    },
  ],
  analisis_canales: {
    resumen:
      'La venta directa conserva el mejor margen neto. Los agregadores aportan volumen, pero su comision reduce la rentabilidad final.',
    canal_mas_rentable: 'Mostrador',
    canal_mayor_riesgo: 'Plataformas',
    canales: [
      {
        canal: 'Mostrador',
        bruto: 268400,
        comision: 0,
        neto: 268400,
        porcentaje_comision: 0,
        lectura: 'Canal con margen completo y mayor contribucion neta.',
      },
      {
        canal: 'Didi Food',
        bruto: 112800,
        comision: 16840,
        neto: 95960,
        porcentaje_comision: 0.1493,
        lectura: 'Aporta volumen, pero su comision exige seguimiento de rentabilidad.',
      },
      {
        canal: 'Uber Eats',
        bruto: 105040,
        comision: 19600,
        neto: 85440,
        porcentaje_comision: 0.1866,
        lectura: 'Es el canal con mayor presion porcentual de comision.',
      },
    ],
    observaciones: [
      'Las comisiones se muestran como valor absoluto para facilitar comparacion.',
      'El porcentaje de comision se calcula sobre venta bruta del canal.',
    ],
  },
  hallazgos_confirmados: [
    {
      titulo: 'El ingreso neto mensual supera el objetivo',
      dato_base: '$486,240 de ingreso neto vs $475,000 objetivo',
      lectura: 'El mes cumple la meta comercial neta con un margen positivo frente al objetivo.',
    },
    {
      titulo: 'El costo primo se mantiene controlado',
      dato_base: 'Food cost 30.8% + labor cost 22.4% = costo primo 53.2%',
      lectura: 'La estructura principal de costos permanece por debajo del umbral de referencia.',
    },
  ],
  hipotesis_operativas: [
    {
      hipotesis: 'La mezcla de pedidos por plataforma podria estar elevando la comision promedio.',
      por_que_importa:
        'Si el crecimiento viene de canales comisionados, las ventas pueden subir sin mejorar la utilidad neta.',
      dato_necesario_para_confirmar:
        'Participacion diaria de ventas por canal y margen neto por ticket.',
      accion_para_validar:
        'Comparar semanas con mayor participacion de plataformas contra utilidad neta semanal.',
    },
    {
      hipotesis: 'Una parte de la desviacion de gastos puede concentrarse en categorias recurrentes.',
      por_que_importa:
        'Identificar concentracion evita recortes generales que afecten operacion.',
      dato_necesario_para_confirmar:
        'Detalle de gastos por proveedor, categoria y recurrencia semanal.',
      accion_para_validar:
        'Revisar las cinco categorias con mayor variacion contra el mes anterior.',
    },
  ],
  ingenieria_menu: {
    disponible: false,
    lectura:
      'No hay datos suficientes de venta por platillo, costo receta o margen unitario para afirmar oportunidades de ingenieria de menu.',
    limitaciones: [
      'No se cuenta con costo receta por producto.',
      'No se cuenta con venta por platillo en el payload financiero.',
    ],
    acciones_sugeridas: [
      'Preparar catalogo de platillos con costo receta.',
      'Cruzar ventas por producto contra margen unitario antes de tomar decisiones de menu.',
    ],
  },
  comparativo: {
    vs_mes_anterior:
      'Ingreso neto estimado +4.2% contra marzo, con incremento moderado en comisiones.',
    vs_mismo_mes_anio_anterior:
      'No disponible en este mock porque no se incluye historico anual completo.',
    nota_disponibilidad_datos:
      'Comparativos presentados solo como ejemplo visual; no provienen de datos reales.',
  },
  areas_oportunidad: [
    {
      area: 'Canal directo',
      oportunidad: 'Incrementar participacion de ventas sin comision.',
      impacto_estimado: 'Mejora potencial de margen neto entre 1 y 2 puntos porcentuales.',
      accion_sugerida: 'Medir conversion de promociones hacia pedidos directos.',
    },
    {
      area: 'Control semanal de gastos',
      oportunidad: 'Detectar desviaciones antes del cierre mensual.',
      impacto_estimado: 'Reducir variaciones operativas no planeadas.',
      accion_sugerida: 'Crear revision semanal de categorias con mayor gasto acumulado.',
    },
  ],
  alertas_riesgo: [
    {
      alerta: 'Comision promedio arriba del objetivo',
      nivel: 'medio',
      dato_base: 'Comisiones 6.1% vs objetivo 5.0%',
      accion_recomendada: 'Revisar mezcla de canales y margen neto por plataforma.',
    },
  ],
  acciones_sugeridas: [
    {
      prioridad: 'alta',
      accion: 'Monitorear semanalmente venta bruta, comision y venta neta por canal.',
      responsable_sugerido: 'Direccion operativa',
      plazo_sugerido: 'Esta semana',
      impacto_esperado: 'Mayor claridad sobre rentabilidad real por canal.',
    },
    {
      prioridad: 'media',
      accion: 'Preparar insumos para ingenieria de menu con costo receta y ventas por platillo.',
      responsable_sugerido: 'Administracion y cocina',
      plazo_sugerido: '30 dias',
      impacto_esperado: 'Permitir decisiones de menu basadas en margen unitario.',
    },
  ],
  recomendacion_principal: {
    titulo: 'Proteger margen neto antes de acelerar volumen',
    recomendacion:
      'Priorizar seguimiento de rentabilidad por canal y empujar ventas directas donde sea posible.',
    razon:
      'El mes es saludable, pero la presion de comisiones puede diluir utilidad si el crecimiento depende de plataformas.',
    decision_sugerida:
      'Aprobar un tablero semanal de canal con bruto, comision, neto y porcentaje de comision.',
  },
};
