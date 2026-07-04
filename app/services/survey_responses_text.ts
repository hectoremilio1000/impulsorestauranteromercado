import Response from '#models/response'

/**
 * Construye el texto de respuestas para el prompt de IA DESDE la base de datos.
 *
 * Resuelve option_id -> texto real y agrupa por pregunta (una línea por pregunta,
 * uniendo las multi-opción con coma). No confía en el payload del cliente, que solo
 * envía option_id. Fuente única de verdad: responses + options + questions.
 *
 * Ej.: options 44 y 45 (misma pregunta 10) ->
 *   "Pregunta: ¿Quién será tu público objetivo principal? escoge 2
 *    Respuestas: Oficinistas, Familias"
 */
export async function buildRespuestasTextoFromDb(prospectId: number): Promise<string> {
  const rows = await Response.query()
    .where('prospect_id', prospectId)
    .orderBy('id', 'asc')
    .preload('option', (optionQuery) => optionQuery.preload('question'))

  const byQuestion = new Map<number, { statement: string; opciones: string[] }>()
  for (const row of rows) {
    const option = row.option
    if (!option) continue
    const question = option.question
    const questionId = question?.id ?? option.question_id
    const statement = question?.statement ?? '(pregunta desconocida)'
    if (!byQuestion.has(questionId)) {
      byQuestion.set(questionId, { statement, opciones: [] })
    }
    byQuestion.get(questionId)!.opciones.push(option.text)
  }

  return Array.from(byQuestion.values())
    .map((group) => `Pregunta: ${group.statement}\nRespuestas: ${group.opciones.join(', ')}`)
    .join('\n\n')
}
