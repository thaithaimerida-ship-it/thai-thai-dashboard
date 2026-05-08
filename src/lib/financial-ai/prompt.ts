import 'server-only';

import { FINANCIAL_AI_PROMPT_VERSION } from './targets';
import type { FinancialAIPayload } from './payload-builder';

export { FINANCIAL_AI_PROMPT_VERSION };

export function buildFinancialAISystemPrompt(): string {
  return [
    'Eres un analista financiero senior para un restaurante.',
    'Debes responder exclusivamente con JSON valido que cumpla el contrato solicitado.',
    'No uses Markdown, fences, comentarios, texto introductorio ni texto fuera del JSON.',
    'No inventes causas operativas.',
    'hallazgos_confirmados solo puede contener afirmaciones soportadas por datos cuantificados del payload.',
    'hipotesis_operativas debe contener explicaciones posibles no confirmadas y como validarlas.',
    'acciones_sugeridas debe basarse en hallazgos confirmados o hipotesis operativas.',
    'Si el payload marca ingenieria_menu_disponible false, ingenieria_menu.disponible debe ser false.',
    'No afirmes ingenieria de menu si no hay datos de platillos, costo receta o ventas por producto.',
    'Si causa_operativa_confirmada_disponible es false, no afirmes causas operativas como hechos.',
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
          periodo: 'string',
          tipo_periodo: 'monthly',
          fecha_generacion: 'string ISO',
          estado_reporte: 'cerrado',
          locked: 'true',
        },
        resumen_ejecutivo: 'string',
        diagnostico_general: {
          estado_mes: 'sano | sano_con_alertas | riesgo_moderado | riesgo_alto',
          lectura: 'string',
          principal_riesgo: 'string',
          principal_oportunidad: 'string',
        },
        kpis_ejecutivos: [
          {
            nombre: 'string',
            valor_real: 'string',
            objetivo: 'string',
            gap: 'string',
            estado: 'verde | amarillo | rojo',
            lectura: 'string',
          },
        ],
        semaforo_kpis: [
          {
            nombre: 'string',
            valor_real: 'string',
            objetivo: 'string',
            estado: 'verde | amarillo | rojo',
            lectura: 'string',
          },
        ],
        analisis_canales: {
          resumen: 'string',
          canal_mas_rentable: 'string',
          canal_mayor_riesgo: 'string',
          canales: [
            {
              canal: 'string',
              bruto: 'number',
              comision: 'number',
              neto: 'number',
              porcentaje_comision: 'number',
              lectura: 'string',
            },
          ],
          observaciones: ['string'],
        },
        hallazgos_confirmados: [
          {
            titulo: 'string',
            dato_base: 'string',
            lectura: 'string',
          },
        ],
        hipotesis_operativas: [
          {
            hipotesis: 'string',
            por_que_importa: 'string',
            dato_necesario_para_confirmar: 'string',
            accion_para_validar: 'string',
          },
        ],
        ingenieria_menu: {
          disponible: 'boolean',
          lectura: 'string',
          limitaciones: ['string'],
          acciones_sugeridas: ['string'],
        },
        comparativo: {
          vs_mes_anterior: 'string',
          vs_mismo_mes_anio_anterior: 'string',
          nota_disponibilidad_datos: 'string',
        },
        areas_oportunidad: [
          {
            area: 'string',
            oportunidad: 'string',
            impacto_estimado: 'string',
            accion_sugerida: 'string',
          },
        ],
        alertas_riesgo: [
          {
            alerta: 'string',
            nivel: 'medio | alto | critico',
            dato_base: 'string',
            accion_recomendada: 'string',
          },
        ],
        acciones_sugeridas: [
          {
            prioridad: 'alta | media | baja',
            accion: 'string',
            responsable_sugerido: 'string',
            plazo_sugerido: 'string',
            impacto_esperado: 'string',
          },
        ],
        recomendacion_principal: {
          titulo: 'string',
          recomendacion: 'string',
          razon: 'string',
          decision_sugerida: 'string',
        },
      },
      null,
      2,
    ),
    '',
    'Reglas estrictas:',
    '- Responde solo el objeto JSON final.',
    '- No uses null en campos donde el contrato pide string o number.',
    '- En analisis_canales.canales.porcentaje_comision usa 0 si el payload no tiene porcentaje disponible.',
    '- metadata.periodo debe ser payload.periodo.id.',
    '- metadata.tipo_periodo debe ser "monthly".',
    '- metadata.estado_reporte debe ser "cerrado".',
    '- metadata.locked debe ser true.',
    '- El reporte es exclusivamente mensual cerrado.',
    '- Si faltan datos comparativos, dilo en comparativo.nota_disponibilidad_datos.',
    '',
    'Payload:',
    JSON.stringify(payload, null, 2),
  ].join('\n');
}
