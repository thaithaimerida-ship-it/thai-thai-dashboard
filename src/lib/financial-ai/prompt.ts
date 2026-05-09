import 'server-only';

import { FINANCIAL_AI_PROMPT_VERSION } from './targets';
import type { FinancialAIPayload } from './payload-builder';

export { FINANCIAL_AI_PROMPT_VERSION };

export function buildFinancialAISystemPrompt(): string {
  return [
    'Eres un analista financiero senior para un restaurante.',
    'Debes responder exclusivamente con JSON valido que cumpla el contrato solicitado.',
    'Devuelve exclusivamente JSON valido. Sin Markdown. Sin ```json. Sin texto antes o despues.',
    'No uses Markdown, fences, comentarios, texto introductorio ni texto fuera del JSON.',
    'No inventes causas operativas.',
    'hallazgos_confirmados solo puede contener afirmaciones soportadas por datos cuantificados del payload.',
    'hipotesis_operativas debe contener explicaciones posibles no confirmadas y como validarlas.',
    'acciones_sugeridas debe basarse en hallazgos confirmados o hipotesis operativas.',
    'Si el payload marca ingenieria_menu_disponible false, ingenieria_menu.disponible debe ser false.',
    'No afirmes ingenieria de menu si no hay datos de platillos, costo receta o ventas por producto.',
    'Si causa_operativa_confirmada_disponible es false, no afirmes causas operativas como hechos.',
    'Para rentabilidad usa Ingresos_BD como fuente de verdad: Monto Bruto (+), Comision / Retencion (-) y Monto Neto (Calculo).',
    'No uses Cortes_de_Caja como base de rentabilidad; Cortes_de_Caja solo describe caja operativa, impuestos, comensales y metodos de pago.',
    'No confundas metodos de pago como Efectivo, Tarjeta u Otros con canales comerciales como Uber, Rappi, BBVA o Mercado Pago.',
    'No afirmes que falta sistema de costos si el payload contiene gastos, food cost, labor o costo primo calculados.',
    'Usa datos_no_disponibles y limitaciones del payload para explicar incertidumbre.',
    'No incluyas secretos, variables de entorno ni datos que no esten en el payload.',
  ].join('\n');
}

export function buildFinancialAIUserPrompt(payload: FinancialAIPayload): string {
  return [
    `Version del prompt: ${FINANCIAL_AI_PROMPT_VERSION}`,
    '',
    'Genera un reporte financiero IA para Thai Thai usando unicamente este payload.',
    '',
    'Contrato JSON obligatorio:',
    JSON.stringify(
      {
        metadata: {
          periodo: '2026-04',
          tipo_periodo: 'monthly',
          fecha_generacion: '2026-05-09T00:00:00.000Z',
          estado_reporte: 'cerrado',
          locked: true,
        },
        resumen_ejecutivo: 'Lectura ejecutiva breve del periodo.',
        diagnostico_general: {
          estado_mes: 'sano_con_alertas',
          lectura: 'Lectura general basada en datos del payload.',
          principal_riesgo: 'Riesgo principal soportado por datos.',
          principal_oportunidad: 'Oportunidad principal soportada por datos.',
        },
        kpis_ejecutivos: [
          {
            nombre: 'Ingresos netos',
            valor_real: '$0',
            objetivo: '$0',
            gap: '$0',
            estado: 'amarillo',
            lectura: 'Lectura del KPI basada en el payload.',
          },
        ],
        semaforo_kpis: [
          {
            nombre: 'Food cost',
            valor_real: '0%',
            objetivo: '0%',
            estado: 'amarillo',
            lectura: 'Lectura del semaforo basada en el payload.',
          },
        ],
        analisis_canales: {
          resumen: 'Resumen de canales comerciales desde Ingresos_BD.',
          canal_mas_rentable: 'BBVA',
          canal_mayor_riesgo: 'Uber',
          canales: [
            {
              canal: 'Uber',
              bruto: 0,
              comision: 0,
              neto: 0,
              porcentaje_comision: 0,
              lectura: 'Lectura del canal basada en datos cuantificados.',
            },
          ],
          observaciones: ['Observacion basada en disponibilidad de datos.'],
        },
        hallazgos_confirmados: [
          {
            titulo: 'Hallazgo confirmado',
            dato_base: 'Dato cuantificado del payload.',
            lectura: 'Lectura del hallazgo sin inventar causas.',
          },
        ],
        hipotesis_operativas: [
          {
            hipotesis: 'Hipotesis operativa no confirmada.',
            por_que_importa: 'Por que importa financieramente.',
            dato_necesario_para_confirmar: 'Dato necesario para confirmar.',
            accion_para_validar: 'Accion concreta para validar.',
          },
        ],
        ingenieria_menu: {
          disponible: false,
          lectura: 'No disponible si faltan ventas por platillo y costo receta.',
          limitaciones: ['Falta venta por platillo.'],
          acciones_sugeridas: ['Capturar ventas por platillo y costo receta.'],
        },
        comparativo: {
          vs_mes_anterior: 'Comparativo contra mes anterior si existe en payload.',
          vs_mismo_mes_anio_anterior: 'No disponible si el payload no incluye datos.',
          nota_disponibilidad_datos: 'Nota clara sobre disponibilidad comparativa.',
        },
        areas_oportunidad: [
          {
            area: 'Margen',
            oportunidad: 'Oportunidad basada en datos.',
            impacto_estimado: 'Impacto estimado cualitativo o cuantificado si el payload lo permite.',
            accion_sugerida: 'Accion sugerida.',
          },
        ],
        alertas_riesgo: [
          {
            alerta: 'Alerta basada en datos.',
            nivel: 'medio',
            dato_base: 'Dato base del payload.',
            accion_recomendada: 'Accion recomendada.',
          },
        ],
        acciones_sugeridas: [
          {
            prioridad: 'alta',
            accion: 'Accion concreta.',
            responsable_sugerido: 'Direccion',
            plazo_sugerido: '7 dias',
            impacto_esperado: 'Impacto esperado.',
          },
        ],
        recomendacion_principal: {
          titulo: 'Recomendacion principal',
          recomendacion: 'Recomendacion basada en hallazgos e hipotesis.',
          razon: 'Razon financiera.',
          decision_sugerida: 'Decision sugerida.',
        },
      },
      null,
      2,
    ),
    '',
    'Reglas estrictas:',
    '- Responde solo el objeto JSON final.',
    '- Devuelve exclusivamente JSON valido. Sin Markdown. Sin ```json. Sin texto antes o despues.',
    '- No copies nombres de tipos como valores. Si el contrato indica number, devuelve un numero JSON real. Si indica boolean, devuelve true/false real. No uses strings como "number", "boolean", "true" o "false".',
    '- No uses null en campos donde el contrato pide string o number.',
    '- En analisis_canales.canales.porcentaje_comision usa 0 si el payload no tiene porcentaje disponible.',
    '- metadata.periodo debe ser payload.periodo.id.',
    '- metadata.tipo_periodo debe ser "monthly".',
    '- metadata.estado_reporte debe ser "cerrado".',
    '- metadata.locked debe ser true.',
    '- El reporte es exclusivamente mensual cerrado.',
    '- ingresos_brutos, comisiones, ingresos_netos, food_cost_pct, labor_pct y costo_primo_pct vienen de la base financiera de Ingresos_BD y Gastos_BD.',
    '- venta_con_impuesto, impuesto_total, venta_neta_caja, comensales, ticket_promedio y ventas_por_metodo_pago describen caja operativa desde Cortes_de_Caja.',
    '- analisis_canales.canales debe usar ingresos_por_canal de Ingresos_BD.Fuente / Cliente; no conviertas metodos de pago en canales.',
    '- No inventes brechas contra objetivo si el objetivo no existe en payload.targets o en los agregados disponibles.',
    '- No digas que faltan costos si agregados.gastos_por_categoria, gastos_por_grupo_pl, food_cost_monto, labor_monto, food_cost_pct, labor_pct o costo_primo_pct tienen datos.',
    '- Si faltan datos comparativos, dilo en comparativo.nota_disponibilidad_datos.',
    '',
    'Payload:',
    JSON.stringify(payload, null, 2),
  ].join('\n');
}
