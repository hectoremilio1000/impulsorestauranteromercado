/* eslint-disable @adonisjs/prefer-lazy-controller-import */
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
const AuthController = () => import('../app/controllers/auth_controller.js')
import { middleware } from './kernel.js'
import VentasSoftsController from '#controllers/ventas_softs_controller'
import VentasDashboardsController from '#controllers/ventas_dashboards_controller'
const CompaniesController = () => import('../app/controllers/companies_controller.js')
const RolesController = () => import('../app/controllers/roles_controller.js')
const TestMailsController = () => import('../app/controllers/test_mails_controller.js')
const PaymentsController = () => import('../app/controllers/payments_controller.js')
const AyudaIAController = () => import('../app/controllers/ayuda_ias_controller.js')
const TestGoogleAdsController = () => import('../app/controllers/test_google_ads_controller.js')
const TestTiktokAdsController = () => import('../app/controllers/test_tiktok_ads_controller.js')
const AuthCalendliesController = () => import('../app/controllers/auth_calendlies_controller.js')
const CalendlyEventsController = () => import('../app/controllers/calendly_events_controller.js')
const SubscriptionsController = () => import('../app/controllers/subscriptions_controller.js')
const CoachingSessionsController = () =>
  import('../app/controllers/coaching_sessions_controller.js')
const EmployeesController = () => import('../app/controllers/employees_controller.js')
const PlansController = () => import('../app/controllers/plans_controller.js')
const ModulesController = () => import('../app/controllers/modules_controller.js')
const SuccesscasesController = () => import('../app/controllers/successcases_controller.js')
const SectionsController = () => import('../app/controllers/sections_controller.js')
const ProspectsController = () => import('../app/controllers/prospects_controller.js')
const QuestionsController = () => import('../app/controllers/questions_controller.js')
const ResponsesController = () => import('../app/controllers/responses_controller.js')
const RecommendationsController = () => import('../app/controllers/recommendations_controller.js')
const CandidatesController = () => import('../app/controllers/candidates_controller.js')
const TrainingPathsController = () => import('../app/controllers/training_paths_controller.js')
const EmployeeTrainingPathsController = () =>
  import('../app/controllers/training_employee_paths_controller.js')
const TrainingManualsController = () => import('../app/controllers/training_manuals_controller.js')
const PositionsController = () => import('../app/controllers/positions_controller.js')
const RrhhExamsController = () => import('../app/controllers/rrhh_exams_controller.js')
const RrhhPreguntasController = () => import('../app/controllers/rrhh_preguntas_controller.js')
const RrhhRespuestasController = () => import('../app/controllers/rrhh_respuestas_controller.js')
const ExamsController = () => import('../app/controllers/exams_controller.js')
const CandidatoIdealController = () =>
  import('../app/controllers/rrhh_candidato_ideals_controller.js')
const RrhhResultadosController = () => import('../app/controllers/rrhh_resultados_controller.js')
const TicketsWebController = () => import('../app/controllers/tickets_web_controller.js')
const OpeanaichatsController = () => import('../app/controllers/opeanaichats_controller.js')
const RrhhChecklistsController = () => import('../app/controllers/rrhh_checklists_controller.js')
const EmployeeChecklistsController = () =>
  import('../app/controllers/rrhh_employee_checklists_controller.js')
const RrhhBarRecipesController = () => import('../app/controllers/rrhh_bar_recipes_controller.js')
const MarketingTicketsController = () =>
  import('../app/controllers/marketing_tickets_controller.js')
const PuntoVentaTicketsController = () =>
  import('../app/controllers/punto_venta_tickets_controller.js')
const LoyaltyProgramsController = () => import('../app/controllers/loyalty_programs_controller.js')
const LoyaltyCardsController = () => import('../app/controllers/loyalty_cards_controller.js')
const LoyaltyVisitsController = () => import('../app/controllers/loyalty_visits_controller.js')
const LoyaltyScanController = () => import('../app/controllers/loyalty_scans_controller.js')
const LoyaltyQrController = () => import('../app/controllers/loyalty_qrs_controller.js')
const LoyaltyRequestsController = () => import('../app/controllers/loyalty_requests_controller.js')
const PermisosLegalesController = () => import('../app/controllers/permisos_legales_controller.js')
const FinancingRequestsController = () =>
  import('../app/controllers/financing_requests_controller.js')
const SurveyFillController = () => import('../app/controllers/survey_fills_controller.js')
const SurveyRequestsController = () => import('../app/controllers/survey_requests_controller.js')
const SurveysController = () => import('../app/controllers/surveys_controller.js')
const SurveyResponsesController = () => import('../app/controllers/survey_responses_controller.js')
const CameraTicketsController = () => import('../app/controllers/camera_tickets_controller.js')
const InventariosController = () => import('../app/controllers/inventarios_controller.js')
const LegalTicketsController = () => import('../app/controllers/legal_tickets_controller.js')

// Expresión regular para prevenir path traversal
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

// import AuthController from '#controllers/auth_controller'

router.get('/api', async () => {
  return { hello: 'world' }
})

//prueba

router.post('/api/testupload', async ({ request, response }) => {
  const files = request.files('testfile', { size: '20mb' })
  console.log('testupload -> files =>', files)
  return response.json({ success: true, filesLength: files.length })
})

//REGISTRAR USUARIOS
router.post('/api/register', [AuthController, 'register']).as('auth.register')
router.post('/api/newuser', [AuthController, 'createUser']).as('auth.createUser')
router.post('/api/login', [AuthController, 'login']).as('auth.login')
router
  .get('/api/me', [AuthController, 'me'])
  .as('auth.me')
  .use(middleware.auth({ guards: ['api'] }))

router
  .delete('/api/logout', [AuthController, 'logout'])
  .as('auth.logout')
  .use(middleware.auth({ guards: ['api'] }))
router.get('/api/users', [AuthController, 'index']).as('auth.index')

//BORRAR USER

router.delete('/api/users/:id', [AuthController, 'destroyUser'])

//AUTH CONTROLLER TOKEN CHECAR
router.post('/api/debugCreateToken', [AuthController, 'debugCreateToken'])

// RUTA AUTH PARA SABER QUE USUARIOS TIENEN RECOMENDACIONES IA
router.get('/api/list-users-without-recommendation', [AuthController, 'listWithoutRecommendation'])
router.get('/api/users/:id', [AuthController, 'showUser']).as('user.show')

// RUTA PARA REGISTRAR PROSPECT
router.post('/api/registerProspect', [AuthController, 'registerProspect'])

// RUTA PARA OLVIDE CONTRASEÑA
router.post('/api/forgotPassword', [AuthController, 'forgotPassword'])

// RUTA PARA RESETEAR CONTRASEÑA
router.post('/api/resetPassword', [AuthController, 'resetPassword'])

// RUTAS PARA companies
router.get('/api/companies', [CompaniesController, 'index']).as('company.index')
router.get('/api/companies/:id', [CompaniesController, 'show']).as('company.show')
router.post('/api/companies', [CompaniesController, 'store']).as('company.store')
router.put('/api/companies/:id', [CompaniesController, 'update']).as('company.update') // <-- Para editar empresa
router.get('/api/companies/:id/sedes', [CompaniesController, 'getSedes']) // <-- Para listar sedes de una empresa

// router.delete('/api/companies/:id', [CompaniesController, 'destroy']).as('module.destroy')

// // RUTAS PARA SEDES -- checar esto con calma
// router.get('/api/sedes', [SedesController, 'index']).as('sede.index')
// router.get('/api/sedes/:id', [SedesController, 'show']).as('sede.show')
// router.post('/api/sedes', [SedesController, 'store']).as('sede.store')
// router.put('/api/sedes/:id', [SedesController, 'update']).as('sede.update')
// router.delete('/api/sedes/:id', [SedesController, 'destroy']).as('sede.destroy')

// USER COMPANIES

// ...
// al final (o donde gustes) agrega:
router.get('/api/users/:userId/companies', [AuthController, 'userCompanies'])
router.get('/api/users/:userId/companies/:companyId/positions', [
  AuthController,
  'userCompanyPositions',
])
// ...

// RUTAS PARA roles
router.get('/api/roles', [RolesController, 'index']).as('role.index')
router.get('/api/roles/:id', [RolesController, 'show']).as('role.show')
router.post('/api/roles', [RolesController, 'store']).as('role.store')
router.put('/api/roles/:id', [RolesController, 'update']).as('role.update')
router.delete('/api/roles/:id', [RolesController, 'destroy']).as('role.destroy')

// TEST DE MAIL
router.post('/api/testemail', [TestMailsController, 'index']).as('testmail.index')
router
  .post('/api/forwordpassword', [TestMailsController, 'forwordPassword'])
  .as('testmail.forwordPassword')

// TESTS DE PAYMENTS MERCADO PAGO
// router.post('/api/testpayment', [PaymentsController, 'store']).as('payment.store')
// router
//   .post('/api/testpayment/notifications', [PaymentsController, 'notification'])
//   .as('payment.notification')
// router
//   .get('/api/testpayment/:type/:id', [PaymentsController, 'showSubscription'])
//   .as('payment.showSubscription')

// Crea preferencia o suscripción => POST /payments
router.post('/api/payments', [PaymentsController, 'store']).as('payment.store')

// Webhook => POST /payments/notification
router
  .post('/api/payments/notification', [PaymentsController, 'notification'])
  .as('payment.notification.post')

router
  .get('/api/payments/notification', [PaymentsController, 'notification'])
  .as('payment.notification.get')
// Consultar => GET /payments/show-subscription/:id
router
  .get('/api/payments/show-subscription/:id', [PaymentsController, 'showSubscription'])
  .as('payment.showSubscription')

// MODULOS

//AYUDAIA
router.get('/api/ayudaia', [AyudaIAController, 'index']).as('ayudaia.index')

router.get('/api/ayudaia/recomendacion/:id', [AyudaIAController, 'show']).as('ayudaia.show')
// TEST DE API GOOGLE ADS
router.get('/api/googleautorize', [TestGoogleAdsController, 'index']).as('payment.index')
router
  .get('/api/oauth2callback', [TestGoogleAdsController, 'oauth2callback'])
  .as('payment.oauth2callback')
router.get('/api/getAccounts', [TestGoogleAdsController, 'getAccounts']).as('payment.getAccounts')
router
  .get('/api/getCampaigns/:accountId', [TestGoogleAdsController, 'getCampaigns'])
  .as('payment.getCampaigns')

// TEST DE API TIKTOK ADS
router
  .get('/api/getTempTiktokAds/:companyId', [TestTiktokAdsController, 'getCampaignsByCompanyId'])
  .as('tiktokads.getCampaignsByCompanyId')

// TEST DE API CALENDLY
router
  .get('/api/oauth/calendly', [AuthCalendliesController, 'redirectToCalendly'])
  .as('auth.redirectToCalendly')
router.get('/api/calendly/status', [AuthCalendliesController, 'status']).as('auth.status')
router
  .get('/api/oauth/calendly/callback', [AuthCalendliesController, 'handleCallback'])
  .as('auth.handleCallback')
router
  .get('/api/calendly/event_types', [CalendlyEventsController, 'index'])
  .as('calend_event.index')
router
  .get('/api/calendly/event_types/:uuid', [CalendlyEventsController, 'eventTypeByUuid'])
  .as('calend_event.eventTypeByUuid')
router
  .get('/api/calendly/event_type_available_times', [
    CalendlyEventsController,
    'eventTypeAvailableTimes',
  ])
  .as('calend_event.eventTypeAvailableTimes')
router
  .get('/api/calendly/scheduled_events', [CalendlyEventsController, 'scheduledEvents'])
  .as('calend_event.scheduledEvents')

// RUTAS PARA SUBSCRIPTIONS
router.get('/api/subscriptions', [SubscriptionsController, 'index']).as('subscription.index')
router.get('/api/subscriptions/:id', [SubscriptionsController, 'show']).as('subscription.show')
router
  .get('/api/subscriptionbyuser/:id', [SubscriptionsController, 'subscriptionbyuser'])
  .as('subscription.subscriptionbyuser')
router.post('/api/subscriptions', [SubscriptionsController, 'store']).as('subscription.store')
router.put('/api/subscriptions/:id', [SubscriptionsController, 'update']).as('subscription.update')
router
  .delete('/api/subscriptions/:id', [SubscriptionsController, 'destroy'])
  .as('subscription.destroy')

router.get('/api/subscriptions/:id/plan-changes', [SubscriptionsController, 'planChanges'])

router.put('/api/users/:id', [AuthController, 'updateUser']).as('user.update')

//RUTAS PARA COACHING DE LAS SUBSCRIPTIONS
router.get('/api/coaching-sessions', [CoachingSessionsController, 'index'])
router.post('/api/coaching-sessions', [CoachingSessionsController, 'store'])
router.get('/api/coaching-sessions/:id', [CoachingSessionsController, 'show'])
router.put('/api/coaching-sessions/:id', [CoachingSessionsController, 'update'])
router.delete('/api/coaching-sessions/:id', [CoachingSessionsController, 'destroy'])

// anidado: /api/subscriptions/:id/coaching-sessions
// routes.ts

router
  .group(() => {
    router.get('/:id/coaching-sessions', [CoachingSessionsController, 'index'])
    router.post('/:id/coaching-sessions', [CoachingSessionsController, 'store'])
    // PUT y DELETE, etc.
  })
  .prefix('/api/subscriptions')

//EMPLOYEES
router
  .group(() => {
    // GET /api/companies/:companyId/employees
    router.get('/:companyId/employees', [EmployeesController, 'index'])
    // POST /api/companies/:companyId/employees
    router.post('/:companyId/employees', [EmployeesController, 'store'])
    // GET /api/companies/:companyId/employees/:id
    router.get('/:companyId/employees/:id', [EmployeesController, 'show'])
    // PUT /api/companies/:companyId/employees/:id
    router.put('/:companyId/employees/:id', [EmployeesController, 'update'])
    // DELETE /api/companies/:companyId/employees/:id
    router.delete('/:companyId/employees/:id', [EmployeesController, 'destroy'])
  })
  .prefix('/api/companies')
  .middleware([middleware.auth({ guards: ['api'] })]) // si quieres proteger con auth
router.get('/api/employees', [EmployeesController, 'indexAll'])

router
  .group(() => {
    router.get('/me/employee', [EmployeesController, 'myEmployee'])
    // ... aquí van tus otras rutas /me o lo que necesites
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])
// Importante: usar auth para que solo entre un usuario autenticado

// RUTAS PARA PLANES
router.get('/api/plans', [PlansController, 'index']).as('plan.index')
router.get('/api/plans/:id', [PlansController, 'show']).as('plan.show')
router.post('/api/plans', [PlansController, 'store']).as('plan.store')
router.put('/api/plans/:id', [PlansController, 'update']).as('plan.update')
router.delete('/api/plans/:id', [PlansController, 'destroy']).as('plan.destroy')

//RUTA PARA RECIBIR LOS DATOS DE LOS resultados
router.get('/api/ventas_softs', [VentasSoftsController, 'index']).as('venta_soft.index')
router.get('/api/ventas_softs/:id', [VentasSoftsController, 'show']).as('venta_soft.show')
router.post('/api/ventas_softs', [VentasSoftsController, 'store']).as('venta_soft.store')
router
  .post('/api/ventasSoftsMasive', [VentasSoftsController, 'ventasSoftsMasive'])
  .as('venta_soft.ventasSoftsMasive')

// RUTAS PARA modules de apps
router.get('/api/modules', [ModulesController, 'index']).as('module.index')
router.get('/api/modules/:id', [ModulesController, 'show']).as('module.show')
router.post('/api/modules', [ModulesController, 'store']).as('module.store')
router.put('/api/modules/:id', [ModulesController, 'update']).as('module.update')
router.delete('/api/modules/:id', [ModulesController, 'destroy']).as('module.destroy')

// RUTAS PARA CASOS DE ESTUDIO
router.get('/api/successcases', [SuccesscasesController, 'index']).as('successcases.index')
router.get('/api/successcases/:id', [SuccesscasesController, 'show']).as('successcases.show')
router.post('/api/successcases', [SuccesscasesController, 'store']).as('successcases.store')
// router.put('/api/successcases/:id', [SuccesscasesController, 'update']).as('successcases.update')
// router.delete('/api/successcases/:id', [SuccesscasesController, 'destroy']).as('plan.destroy')

// RUTAS PARA SECTIONS

router.post('/api/sections', [SectionsController, 'store']).as('sections.store')
// router.put('/api/successcases/:id', [SuccesscasesController, 'update']).as('successcases.update')
// router.delete('/api/successcases/:id', [SuccesscasesController, 'destroy']).as('plan.destroy')

//RUTA PARA RECIBIR LOS DATOS DE LOS PROSPECTS

router.get('/api/prospects', [ProspectsController, 'index']).as('prospect.index')
router.get('/api/prospects/:id', [ProspectsController, 'show']).as('prospect.show')
router.post('/api/prospects', [ProspectsController, 'store']).as('prospect.store')
// Nueva ruta para la reunión presencial
router
  .post('/api/prospectsmeeting', [ProspectsController, 'storeMeeting'])
  .as('prospect.storeMeeting')
router
  .post('/api/prospectsWithRecommendations', [ProspectsController, 'storeWithRecommendations'])
  .as('prospect.storeWithRecommendations')

router
  .post('/api/prospectswebsite', [ProspectsController, 'storeWebSite'])
  .as('prospect.storeWebSite')

//RUTA PARA RECIBIR LOS DATOS DE LAS QUESTIONS
router.get('/api/questions', [QuestionsController, 'index']).as('question.index')
router
  .get('/api/questionsByContext/:context', [QuestionsController, 'questionsByContext'])
  .as('question.questionsByContext')

//RUTA PARA RECIBIR LOS DATOS DE LAS RESPONSES
router.get('/api/responses', [ResponsesController, 'index']).as('response.index')
router
  .post('/api/responsesByGroup', [ResponsesController, 'responsesByGroup'])
  .as('response.responsesByGroup')

//RUTA PARA RECIBIR LOS DATOS DE LAS RECOMMENDATIONS
router.get('/api/recommendations', [RecommendationsController, 'index']).as('recommendation.index')
router
  .get('/api/recommendations/:id', [RecommendationsController, 'show'])
  .as('recommendation.show')
router.post('/api/recommendations', [RecommendationsController, 'store']).as('recommendation.store')

//MÓDULO DE RRHH
router.get('/api/candidates', [CandidatesController, 'index'])
router.get('/api/candidates/:id', [CandidatesController, 'show'])
router.post('/api/candidates', [CandidatesController, 'store'])
// Actualizar comentarios
router.put('/api/candidates/comments', [CandidatesController, 'updateComments'])

// Actualizar status
router.put('/api/candidates/status', [CandidatesController, 'updateStatus'])

// Ruta para subir CV con multipart/form-data
router.post('/api/candidates/upload', [CandidatesController, 'storeWithCV'])

router.get('/api/storage/uploads/*', ({ request, response }) => {
  /**
   * 1) Tomamos la parte wildcard del path,
   *    que será un array de strings.
   */
  const filePathArray = request.param('*') // array de strings
  const filePath = filePathArray.join(sep)

  /**
   * 2) Normalizamos la ruta y prevenimos ataques de path traversal
   */
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  /**
   * 3) Construimos la ruta absoluta hacia storage/uploads
   *    usando "app.makePath(...)"
   */
  const absolutePath = app.makePath('storage/uploads', normalizedPath)

  /**
   * 4) Servimos el archivo con "response.download(...)"
   */
  return response.download(absolutePath)
})

//TRAINING PATHS
router.get('/api/training-paths', [TrainingPathsController, 'index'])
router.get('/api/training-paths/:id', [TrainingPathsController, 'show'])
router.post('/api/training-paths', [TrainingPathsController, 'store'])
router.put('/api/training-paths/:id', [TrainingPathsController, 'update'])
router.delete('/api/training-paths/:id', [TrainingPathsController, 'destroy'])

router.post('/api/employee-training-paths/assign', [EmployeeTrainingPathsController, 'assign'])
router.post('/api/employee-training-paths/status', [
  EmployeeTrainingPathsController,
  'updateStatus',
])

router
  .group(() => {
    router.get('/training-manuals', [TrainingManualsController, 'index'])
    router.get('/training-manuals/:id', [TrainingManualsController, 'show'])
    router.post('/training-manuals', [TrainingManualsController, 'store'])
    router.put('/training-manuals/:id', [TrainingManualsController, 'update'])
    router.delete('/training-manuals/:id', [TrainingManualsController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

// Luego, en el archivo de rutas (routes.ts o como lo llames):
router.get('/api/positions', [PositionsController, 'index'])
router.post('/api/positions', [PositionsController, 'store'])
router.get('/api/positions/:id', [PositionsController, 'show'])
router.put('/api/positions/:id', [PositionsController, 'update'])
router.delete('/api/positions/:id', [PositionsController, 'destroy'])

// Para listar las rutas asignadas de un empleado X
router.get('/api/employees/:id/training-paths', [
  EmployeeTrainingPathsController,
  'listEmployeePaths',
])

//candidato a employee
router.post('/api/candidates/:id/hire', [CandidatesController, 'hire'])
router
  .group(() => {
    // Exámenes
    router.get('/exams', [RrhhExamsController, 'index'])
    router.get('/exams/:id', [RrhhExamsController, 'show'])
    router.post('/exams', [RrhhExamsController, 'store'])
    router.put('/exams/:id', [RrhhExamsController, 'update'])
    router.delete('/exams/:id', [RrhhExamsController, 'destroy'])

    // Preguntas
    router.get('/preguntas', [RrhhPreguntasController, 'index'])
    router.get('/preguntas/:id', [RrhhPreguntasController, 'show'])
    router.post('/preguntas', [RrhhPreguntasController, 'store'])
    router.put('/preguntas/:id', [RrhhPreguntasController, 'update'])
    router.delete('/preguntas/:id', [RrhhPreguntasController, 'destroy'])

    //iniciar examen
    router.post('/rrhh/preguntas/iniciar-examen', [RrhhPreguntasController, 'iniciarExamen'])
    router.post('/rrhh/preguntas/obtener', [RrhhPreguntasController, 'obtenerPreguntas'])

    // Respuestas
    router.get('/respuestas', [RrhhRespuestasController, 'index'])
    router.get('/respuestas/:id', [RrhhRespuestasController, 'show'])
    router.post('/respuestas', [RrhhRespuestasController, 'store'])
    router.put('/respuestas/:id', [RrhhRespuestasController, 'update'])
    router.delete('/respuestas/:id', [RrhhRespuestasController, 'destroy'])
  })
  .prefix('/api')
router
  .post('/rrhh/respuestas/guardar-masivo', [RrhhRespuestasController, 'storeMasivo'])
  .prefix('/api')

//RUTA RESULTADOS
router
  .group(() => {
    router.get('/resultados', [RrhhResultadosController, 'index'])
    router.post('/resultados/calcular', [RrhhResultadosController, 'calcular'])
  })
  .prefix('/api/rrhh')

//RUTA CANDIDATO IDEAL
router.get('/api/candidatoIdeal/obtener', [CandidatoIdealController, 'index'])

//RUTA PARA RECIBIR LOS DATOS DE LOS examenes
router.get('/api/examscandidates', [ExamsController, 'index']).as('exam.index')
router.get('/api/examsQuery', [ExamsController, 'query']).as('exam.query')
router.get('/api/examscandidates/:id', [ExamsController, 'show']).as('exam.show')
router.post('/api/examscandidates', [ExamsController, 'store']).as('exam.store')

// RUTA PARA OPENAI

router.post('/api/chatgtp', [OpeanaichatsController, 'ask']).as('chatgtpask.ask')

//RUTAS PARA REQUEST DEL MÓDULO SISTEMA WEB
router
  .group(() => {
    // GET /api/tickets-web => ver todos (o los propios si user normal)
    router.get('/tickets-web', [TicketsWebController, 'index']).as('ticketsWeb.index')

    // POST /api/tickets-web => crear un ticket
    router.post('/tickets-web', [TicketsWebController, 'store']).as('ticketsWeb.store')

    // GET /api/tickets-web/:id => ver detalle
    router.get('/tickets-web/:id', [TicketsWebController, 'show']).as('ticketsWeb.show')

    // PUT /api/tickets-web/:id => actualizar
    router.put('/tickets-web/:id', [TicketsWebController, 'update']).as('ticketsWeb.update')

    // DELETE /api/tickets-web/:id => eliminar
    router.delete('/tickets-web/:id', [TicketsWebController, 'destroy']).as('ticketsWeb.destroy')
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

// RUTA PARA SERVIR ARCHIVOS (OPCIONAL) => /api/storage/uploads/requests-web/*
router.get('/api/storage/uploads/requests-web/*', ({ request, response }) => {
  const filePathArray = request.param('*') // array con partes de la ruta
  const filePath = filePathArray.join(sep)

  // Evitamos ataques de path traversal
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  // Armamos la ruta absoluta en el servidor
  const absolutePath = app.makePath('storage/uploads/requests-web', normalizedPath)

  // Devolvemos el archivo
  return response.download(absolutePath)
})

// CRUD de plantillas
router
  .group(() => {
    router.get('/rrhh-checklists', [RrhhChecklistsController, 'index'])
    router.get('/rrhh-checklists/:id', [RrhhChecklistsController, 'show'])
    router.post('/rrhh-checklists', [RrhhChecklistsController, 'store'])
    router.put('/rrhh-checklists/:id', [RrhhChecklistsController, 'update'])
    router.delete('/rrhh-checklists/:id', [RrhhChecklistsController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

// Endpoints de uso diario (empleado)
router
  .group(() => {
    router.get('/checklists/daily', [EmployeeChecklistsController, 'daily'])
    router.post('/checklists/complete', [EmployeeChecklistsController, 'complete'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

router
  .group(() => {
    router.get('/bar-recipes', [RrhhBarRecipesController, 'index'])
    router.get('/bar-recipes/:id', [RrhhBarRecipesController, 'show'])
    router.post('/bar-recipes', [RrhhBarRecipesController, 'store'])
    router.put('/bar-recipes/:id', [RrhhBarRecipesController, 'update'])
    router.delete('/bar-recipes/:id', [RrhhBarRecipesController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })]) // protege si quieres

// Servir fotos:
router.get('/api/storage/uploads/bar_recipes/*', ({ request, response }) => {
  const filePath = request.param('*').join('/')
  const absolute = app.makePath('storage/uploads/bar_recipes', filePath)
  return response.download(absolute)
})

// MÓDULO DE MARKETING

// Crea un ticket CON archivos (adjuntos)
router.post('/api/marketing-tickets/upload', [MarketingTicketsController, 'storeWithAttachments'])

router.get('/api/marketingTickets', [MarketingTicketsController, 'index'])
router.get('/api/marketingTickets/:id', [MarketingTicketsController, 'show'])

// Crea un ticket SIN archivos
router.post('/api/marketingTickets', [MarketingTicketsController, 'store'])

// Actualizar un ticket
router.put('/api/marketingTickets/:id', [MarketingTicketsController, 'update'])

// Eliminar un ticket
router.delete('/api/marketingTickets/:id', [MarketingTicketsController, 'destroy'])

// Ruta para servir los archivos en storage/uploads/marketing
router.get('/api/storage/uploads/marketing/*', ({ request, response }) => {
  const filePathArray = request.param('*') // array de strings
  const filePath = filePathArray.join(sep)

  // Prevenir path traversal
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  // Construir la ruta absoluta
  const absolutePath = app.makePath('storage/uploads/marketing', normalizedPath)

  // Descargar/servir
  return response.download(absolutePath)
})

router.post('/api/marketing-tickets/uploadSingle', [
  MarketingTicketsController,
  'storeWithSingleAttachment',
])
// Módulo de Punto de Venta
router.get('/api/punto-venta-tickets', [PuntoVentaTicketsController, 'index'])
router.get('/api/punto-venta-tickets/:id', [PuntoVentaTicketsController, 'show'])

router
  .group(() => {
    router.get('/overview', [VentasDashboardsController, 'overview'])
    router.get('/products', [VentasDashboardsController, 'products'])
    router.get('/waiters', [VentasDashboardsController, 'waiters'])
    router.get('/payment-mix', [VentasDashboardsController, 'paymentMix'])
  })
  .prefix('/api/ventas-softs')
  .middleware([middleware.auth({ guards: ['api'] })])

// Crear ticket con un archivo
router.post('/api/punto-venta-tickets/uploadSingle', [PuntoVentaTicketsController, 'storeSingle'])

// Actualizar ticket (por ej. cambiar status)
router.put('/api/punto-venta-tickets/:id', [PuntoVentaTicketsController, 'update'])

// Eliminar ticket
router.delete('/api/punto-venta-tickets/:id', [PuntoVentaTicketsController, 'destroy'])

// Ruta para servir archivos en storage/uploads/punto_venta
router.get('/api/storage/uploads/punto_venta/*', ({ request, response }) => {
  // Evitamos path traversal
  const filePathArray = request.param('*') // array de strings
  const filePath = filePathArray.join(sep)
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }
  // Construir la ruta absoluta
  const absolutePath = app.makePath('storage/uploads/punto_venta', normalizedPath)
  return response.download(absolutePath)
})

//MÓDULO DE PROGRAMA DE LEALTAD

// Si usas el router actual de Adonis
router
  .group(() => {
    // Programs
    router.get('/loyalty/programs', [LoyaltyProgramsController, 'index'])
    router.post('/loyalty/programs', [LoyaltyProgramsController, 'store'])
    router.get('/loyalty/programs/:id', [LoyaltyProgramsController, 'show'])
    router.put('/loyalty/programs/:id', [LoyaltyProgramsController, 'update'])
    router.delete('/loyalty/programs/:id', [LoyaltyProgramsController, 'destroy'])

    // Cards
    router.get('/loyalty/cards', [LoyaltyCardsController, 'index'])
    router.post('/loyalty/cards', [LoyaltyCardsController, 'store'])
    router.get('/loyalty/cards/:id', [LoyaltyCardsController, 'show'])
    router.put('/loyalty/cards/:id', [LoyaltyCardsController, 'update'])
    router.delete('/loyalty/cards/:id', [LoyaltyCardsController, 'destroy'])

    // Visits
    router.get('/loyalty/visits', [LoyaltyVisitsController, 'index'])
    router.post('/loyalty/visits', [LoyaltyVisitsController, 'store'])
    router.get('/loyalty/visits/:id', [LoyaltyVisitsController, 'show'])
    router.put('/loyalty/visits/:id', [LoyaltyVisitsController, 'update'])
    router.delete('/loyalty/visits/:id', [LoyaltyVisitsController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })]) // <-- si deseas proteger con auth

// ...
router
  .group(() => {
    // ...
    // Escaneo
    router.get('/loyalty/scan', [LoyaltyScanController, 'scan'])
    router.post('/loyalty/do-scan', [LoyaltyScanController, 'doScan'])

    // Canjear
    // router.post('/loyalty/cards/:id/redeem', [LoyaltyScanController, 'redeem'])
  })
  .prefix('/api')

//QR SCAN
router
  .group(() => {
    // ...
    router.post('/loyalty/generate-qr', [LoyaltyQrController, 'generateQr'])
  })
  .prefix('/api')

router
  .group(() => {
    // CRUD Resource
    router.get('/loyalty/requests', [LoyaltyRequestsController, 'index'])
    router.post('/loyalty/requests', [LoyaltyRequestsController, 'store'])
    router.get('/loyalty/requests/:id', [LoyaltyRequestsController, 'show'])
    router.put('/loyalty/requests/:id', [LoyaltyRequestsController, 'update'])
    router.delete('/loyalty/requests/:id', [LoyaltyRequestsController, 'destroy'])

    // Custom endpoints
    router.post('/loyalty/requests/:id/approve', [LoyaltyRequestsController, 'approve'])
    router.post('/loyalty/requests/:id/reject', [LoyaltyRequestsController, 'reject'])
    router.post('/loyalty/cards/:id/visit', [LoyaltyCardsController, 'incrementVisit'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

//

router.get('/api/loyalty/programs/:programId/cards', [LoyaltyProgramsController, 'cardsByProgram'])

//LEGAL_TICKET MODULE
router
  .group(() => {
    router.get('/legal-tickets', [LegalTicketsController, 'index'])
    router.post('/legal-tickets', [LegalTicketsController, 'store'])
    router.get('/legal-tickets/:id', [LegalTicketsController, 'show'])
    router.put('/legal-tickets/:id', [LegalTicketsController, 'update'])
    router.delete('/legal-tickets/:id', [LegalTicketsController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })]) // Protegido con auth

router
  .group(() => {
    router.post('/permisos-legales', [PermisosLegalesController, 'store'])
    router.get('/permisos-legales/:id', [PermisosLegalesController, 'show'])
    router.put('/permisos-legales/:id', [PermisosLegalesController, 'update'])
    router.delete('/permisos-legales/:id', [PermisosLegalesController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })]) // si deseas proteger

router.get('/api/permisos-legales', [PermisosLegalesController, 'index'])

//MÓDULO DE FINANCIAMIENTO
router
  .group(() => {
    router.get('/financing-requests', [FinancingRequestsController, 'index'])
    router.post('/financing-requests', [FinancingRequestsController, 'store'])
    router.get('/financing-requests/:id', [FinancingRequestsController, 'show'])
    router.put('/financing-requests/:id', [FinancingRequestsController, 'update'])
    router.delete('/financing-requests/:id', [FinancingRequestsController, 'destroy'])

    // Rutas especiales para aprobar / rechazar
    router.post('/financing-requests/:id/approve', [FinancingRequestsController, 'approve'])
    router.post('/financing-requests/:id/reject', [FinancingRequestsController, 'reject'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })]) // si quieres proteger con auth

//MÓDULO DE ENCUESTAS
// RUTAS PÚBLICAS PARA LLENAR LAS ENCUESTAS
router.get('/api/surveys/fill', [SurveyFillController, 'fill'])
router.post('/api/surveys/do-fill', [SurveyFillController, 'doFill'])

router
  .group(() => {
    // Survey Requests
    router.get('/survey-requests', [SurveyRequestsController, 'index'])
    router.post('/survey-requests', [SurveyRequestsController, 'store'])
    router.get('/survey-requests/:id', [SurveyRequestsController, 'show'])
    router.put('/survey-requests/:id', [SurveyRequestsController, 'update'])
    router.delete('/survey-requests/:id', [SurveyRequestsController, 'destroy'])
    router.post('/survey-requests/:id/approve', [SurveyRequestsController, 'approve'])
    router.post('/survey-requests/:id/reject', [SurveyRequestsController, 'reject'])

    // Surveys
    router.get('/surveys', [SurveysController, 'index'])
    router.get('/surveys/:id', [SurveysController, 'show'])
    router.put('/surveys/:id', [SurveysController, 'update'])
    router.delete('/surveys/:id', [SurveysController, 'destroy'])
    // router.post('/surveys', [SurveysController, 'store'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

router
  .group(() => {
    router.get('/survey-responses', [SurveyResponsesController, 'index'])
    // si lo deseas, router.get('/survey-responses/:id', ...)
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

// ...
// MÓDULO DE MONITOREO / CÁMARAS
router
  .group(() => {
    router.get('/camera-tickets', [CameraTicketsController, 'index'])
    router.post('/camera-tickets', [CameraTicketsController, 'store'])
    router.get('/camera-tickets/:id', [CameraTicketsController, 'show'])
    router.put('/camera-tickets/:id', [CameraTicketsController, 'update'])
    router.delete('/camera-tickets/:id', [CameraTicketsController, 'destroy'])

    // <-- Agrega aquí la ruta de un archivo
    router.post('/camera-tickets/uploadSingle', [
      CameraTicketsController,
      'storeWithSingleAttachment',
    ])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

// router.post('/api/camera-tickets', [CameraTicketsController, 'storeWithSingleAttachment'])
// O bien algo como:

router.get('/api/storage/uploads/cameras/*', ({ request, response }) => {
  const filePathArray = request.param('*') // array con partes de la ruta
  const filePath = filePathArray.join(sep)

  // Evitamos ataques de path traversal
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  // Armamos la ruta absoluta en el servidor
  const absolutePath = app.makePath('storage/uploads/cameras', normalizedPath)

  // Devolvemos el archivo
  return response.download(absolutePath)
})

//MÓDULO DE INVENTARIOS

router
  .group(() => {
    router.get('/inventarios', [InventariosController, 'index'])
    router.get('/inventarios/:id', [InventariosController, 'show'])
    router.post('/inventarios', [InventariosController, 'store'])
    router.put('/inventarios/:id', [InventariosController, 'update'])
    router.delete('/inventarios/:id', [InventariosController, 'destroy'])
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] })])

router.get('/api/storage/uploads/inventarios/*', ({ request, response }) => {
  // 1) Obtenemos la parte wildcard del path (arreglo de strings)
  const filePathArray = request.param('*') // p. ej. ["archivo.png"]
  const filePath = filePathArray.join(sep) // "archivo.png"

  // 2) Normalizamos la ruta y prevenimos ataques de path traversal
  const normalizedPath = normalize(filePath)
  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  // 3) Construimos la ruta absoluta hacia: storage/uploads/inventarios
  const absolutePath = app.makePath('storage', 'uploads', 'inventarios', normalizedPath)

  // 4) Servimos el archivo
  return response.download(absolutePath)
})

//blog
router
  .group(() => {
    const BlogPosts = () => import('../app/controllers/blog_posts_controller.js')

    /* ────────────────  Endpoints públicos  ──────────────── */
    // GET /api/blog-posts        → index
    router.get('/blog-posts', [BlogPosts, 'index']).as('blogPosts.index')

    // GET /api/blog-posts/:slug  → show  (usa slug, no ID)
    router.get('/blog-posts/:slug', [BlogPosts, 'show']).as('blogPosts.show')

    /* ────────────────  Endpoints protegidos  ─────────────── */
    // POST /api/blog-posts       → store
    router
      .post('/blog-posts', [BlogPosts, 'store'])
      .as('blogPosts.store')
      .use(middleware.auth({ guards: ['api'] }))

    // PUT /api/blog-posts/:id    → update
    router
      .put('/blog-posts/:id', [BlogPosts, 'update'])
      .as('blogPosts.update')
      .where('id', /^\d+$/)
      .use(middleware.auth({ guards: ['api'] }))

    // DELETE /api/blog-posts/:id → destroy
    router
      .delete('/blog-posts/:id', [BlogPosts, 'destroy'])
      .as('blogPosts.destroy')
      .where('id', /^\d+$/)
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api')
