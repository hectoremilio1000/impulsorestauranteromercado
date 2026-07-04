import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'

import Prospect from '#models/prospect'
import Response from '#models/response'
import Recommendation from '#models/recommendation'
import RecommendationGenerator from '#services/recommendation_generator'
import { buildRespuestasTextoFromDb } from '#services/survey_responses_text'

/**
 * Tests del intake de la encuesta pública (storeWithRecommendations).
 * Cubren C-1 (texto desde DB), C-2 (responder siempre) e I-3 (normalizar/validar).
 *
 * NOTA: corren contra la DB configurada en .env. Cada test etiqueta sus filas con
 * origin = TEST_ORIGIN y el teardown las borra, para no dejar basura ni tocar datos
 * reales. OpenAI se mockea (container.swap) — no se pega a la red.
 */
const TEST_ORIGIN = 'TEST_SPEC_DELETE'
const URL = '/api/prospectsWithRecommendations'

// Opciones sembradas conocidas: 44 = "Oficinistas", 45 = "Familias" (misma pregunta 10)
const OPT_OFICINISTAS = 44
const OPT_FAMILIAS = 45

async function cleanupTestRows() {
  const prospects = await Prospect.query().where('origin', TEST_ORIGIN)
  const ids = prospects.map((p) => p.id)
  if (ids.length) {
    await Recommendation.query().whereIn('prospect_id', ids).delete()
    await Response.query().whereIn('prospect_id', ids).delete()
    await Prospect.query().whereIn('id', ids).delete()
  }
}

test.group('survey intake / storeWithRecommendations', (group) => {
  group.each.teardown(async () => {
    await cleanupTestRows()
    app.container.restore(RecommendationGenerator)
  })

  test('C-1: buildRespuestasTextoFromDb resuelve texto real y agrupa multi-opción en una línea', async ({
    assert,
  }) => {
    const prospect = await Prospect.create({
      first_name: 'Helper',
      last_name: 'Test',
      email: 'helper@test.local',
      whatsapp: '5500000000',
      status: 'creado',
      origin: TEST_ORIGIN,
    })
    await Response.createMany([
      { prospect_id: prospect.id, option_id: OPT_OFICINISTAS },
      { prospect_id: prospect.id, option_id: OPT_FAMILIAS },
    ])

    const texto = await buildRespuestasTextoFromDb(prospect.id)

    // Una sola línea por pregunta, con los textos reales (no "44, 45").
    assert.include(texto, 'Respuestas: Oficinistas, Familias')
    assert.notInclude(texto, 'Respuestas: 44')
    assert.notInclude(texto, '45')
  }).timeout(30000)

  test('C-2: POST sin responses responde 200 sin recomendación (no cuelga)', async ({
    client,
    assert,
  }) => {
    const res = await client.post(URL).json({
      first_name: 'Sin',
      last_name: 'Responses',
      email: 'sinresp@test.local',
      whatsapp: '5511112222',
      origin: TEST_ORIGIN,
    })

    res.assertStatus(200)
    assert.equal(res.body().status, 'success')
    assert.equal(res.body().data.recommendation, null)
  }).timeout(30000)

  test('I-3: normaliza whatsapp con símbolos a 10 dígitos (no rechaza)', async ({
    client,
    assert,
  }) => {
    const res = await client.post(URL).json({
      first_name: 'Whats',
      last_name: 'Dirty',
      email: 'wa@test.local',
      whatsapp: '+52 55-1234-5678',
      origin: TEST_ORIGIN,
    })

    res.assertStatus(200)
    assert.equal(res.body().data.prospect.whatsapp, '5512345678')
  }).timeout(30000)

  test('I-3 estructural: responses NO-array responde 422', async ({ client }) => {
    const res = await client.post(URL).json({
      first_name: 'Bad',
      last_name: 'Struct',
      email: 'bad@test.local',
      whatsapp: '5500000000',
      origin: TEST_ORIGIN,
      responses: 'no-soy-un-array',
    })

    res.assertStatus(422)
  }).timeout(30000)

  test('happy-path: con responses y OpenAI mockeado responde 200 con recomendación', async ({
    client,
    assert,
  }) => {
    let capturado: any = null
    app.container.swap(RecommendationGenerator, () => {
      return {
        async generate(input: any) {
          capturado = input
          return 'RECO_FAKE_PARA_TEST'
        },
      } as any
    })

    const res = await client.post(URL).json({
      first_name: 'Happy',
      last_name: 'Path',
      email: 'happy@test.local',
      whatsapp: '5500000000',
      origin: TEST_ORIGIN,
      responses: [{ option_id: OPT_OFICINISTAS }, { option_id: OPT_FAMILIAS }],
    })

    res.assertStatus(200)
    assert.equal(res.body().status, 'success')
    assert.isNotNull(res.body().data.recommendation)
    assert.equal(res.body().data.recommendation.text, 'RECO_FAKE_PARA_TEST')

    // El servicio de IA recibió el texto real resuelto desde la DB (C-1), no IDs.
    assert.isNotNull(capturado)
    assert.include(capturado.respuestasTexto, 'Oficinistas, Familias')
  }).timeout(30000)
})
