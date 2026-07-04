import OpenAI from 'openai'

export interface RecommendationInput {
  firstName: string
  lastName: string
  respuestasTexto: string
}

/**
 * Genera las recomendaciones de IA para un prospecto de la encuesta.
 *
 * Está aislado en un servicio (no inline en el controller) para poder mockearlo
 * en tests vía `app.container.swap(RecommendationGenerator, ...)` y no pegarle a
 * la red / gastar tokens en el happy-path.
 */
export default class RecommendationGenerator {
  async generate({ firstName, lastName, respuestasTexto }: RecommendationInput): Promise<string> {
    const openai = new OpenAI()

    const prompt = `
            Hola, ${firstName} ${lastName} soy un asistente especializado en negocios gastronómicos y estratégicos.

            Este es un resumen de las respuestas del usuario ${firstName}:
            ${respuestasTexto}

            REGLA OBLIGATORIA (no romper): NO inventes ni menciones nombres de productos,
            marcas o herramientas comerciales específicas — ni reales ni inventadas
            (nada de "Square", "Toast", "OpenTable", "Foodz", etc.). Habla SIEMPRE por
            CATEGORÍA genérica: "un sistema de punto de venta (POS)", "una plataforma de
            reservas en línea", "un software de inventario", "una herramienta de email
            marketing", "una máquina de café profesional", etc. La ÚNICA marca que puedes
            nombrar es "Impulso Restaurantero". Si no estás seguro del nombre de algo,
            descríbelo por su función; jamás lo inventes.

            REGLAS DE PERSONALIZACIÓN (obligatorias):
            1. USA LAS CIFRAS del usuario. Cita explícitamente TODOS los datos numéricos que
               tengas (si ya opera: su margen tras gastos; en TODOS los casos: su ticket
               promedio y su tamaño de inversión) y ancla los consejos a ellos. NUNCA omitas
               el ticket ni la inversión, aunque no haya margen. Si el margen es bajo o "Nada",
               prioriza rentabilidad (costos y precios) ANTES que crecimiento; si el margen es
               alto, prioriza crecimiento y escala. Adapta las tácticas al ticket y a la
               inversión disponibles. No des recomendaciones que ignoren estos números.
            2. RESPETA SU NIVEL DE EXPERIENCIA. Si declaró experiencia amplia, ve directo a
               lo estratégico y avanzado y NO expliques lo básico (nada de "entrena a tu
               personal", "haz investigación de mercado" o "define tu concepto" como si
               empezara de cero). Si es ninguna o moderada, sé más didáctico y guía paso a
               paso.

            Con base en estas respuestas, proporciona recomendaciones personalizadas y prácticas que incluyan:

            1. **Inspiración Visionaria:**
            - Ofrece ideas innovadoras basadas en ejemplos de líderes mundiales como Danny Meyer, René Redzepi, Howard Schultz, y Massimo Bottura dependiendo de las respuestas que hayan dado los usuarios y sobre el campo en acción que ellos te dirían dependiendo de donde está su mayor skill y de las preguntas y respuestas que respondieron, se muy particular como cada uno de ellos aportaría en cada cuestión dependiendo siempre de analizar las preguntas y respuestas ${respuestasTexto}.
            - Muestra cómo sus estrategias podrían aplicarse en el negocio dependiendo de ${respuestasTexto}.

            2. **Planificación Práctica dependiendo de ${respuestasTexto}:**
            - Detalla un plan de trabajo con un horizonte adecuado a su situación. NO asumas que apenas abre: si ya opera, enfócate en optimizar y crecer (no hables de "el primer año" ni de "abrir").
            - Ajusta la profundidad a su experiencia: si es principiante, incluye pasos fundamentales (definir concepto, estudiar el mercado, productos estrella); si tiene experiencia AMPLIA, OMITE lo básico y ve directo a palancas avanzadas (optimización de costos y margen, pricing, expansión) según ${respuestasTexto}.

            3. **Tecnología y Equipamiento Vanguardista dependiendo de ${respuestasTexto}:**
            - Recomienda las herramientas tecnológicas más recientes para optimizar procesos.
            - Sugiere equipo moderno que se alinee con el presupuesto mencionado.

            #### 4. Soporte Integral con "Impulso Restaurantero":
            - Explica cómo "Impulso Restaurantero" puede ayudar al usuario, basándote en ${respuestasTexto}.
            - Cada punto debe tener un mínimo de **300 palabras** y detallar cómo adaptamos nuestras soluciones a las respuestas proporcionadas.
                  - Ayuda para saber cuáles son los requisitos legales para operar óptimamente tu restaurante.
                  - Estrategias de growth hacking y marketing digital modernas que te ayudaríamos a implementar con inteligencia artificial (di algunos ejemplos innovadores y cómo han impactado en TikTok, en Instagram y en Google Ads).
                  - Inteligencia Artificial para análisis y decisiones (di cuestiones innovadoras y utiliza las últimas relevancias en el mercado para dar ejemplo que obtengas y habla cómo Impulso Restaurantero te ayudaría a generarlas en ti).
                  - Sistemas de punto de venta, reservas, y encuestas inteligentes (siempre di cuestiones innovadoras).
                  - Manuales y capacitación con IA (describe varios puntos de cómo te va a ayudar esto a tener un equipo de alto rendimiento para que tengas una operación sumamente estable).
                  - Creación de tu página web con sistema de calendario eficiente (di cómo lo vamos a crear con tecnología de punta para que siempre tengas el mejor ranking e indexación en Google, define estrategias innovadoras que utilizaríamos con tecnología como Next.js o sistemas modernos como Calendly y qué beneficios tiene).
                  - Inventarios inteligentes y monitoreo en tiempo real (cómo te ayudamos a tener mejores inventarios que se adapten a cómo organizas tus compras, etc).
                  - Financiamiento a tasas bajas (cómo te podríamos ayudar a financiar tu crecimiento, o maquinaria para mejorar tu productividad; menciona por CATEGORÍA qué equipo podríamos ayudarte a financiar para elevar la experiencia del cliente, sin nombrar marcas).
                  - Programas de lealtad para fidelizar clientes (ayudarte a generar algún programa de lealtad para que tengas clientes felices).
                  - Cómo te ayudaríamos a monitorear tu negocio para que no tengas robo hormiga, entre otras cuestiones.

            #### 5. Plan de Ejecución a Corto Plazo:
            - Diseña un plan de acción con objetivos claros para:
              - 15 días.
              - 1 mes.
              - 3 meses.
              - 6 meses.
              - 1 año.
            - Cada etapa debe incluir un mínimo de **200 palabras** con recomendaciones específicas, explicando cómo evaluar resultados y ajustar estrategias según las necesidades del usuario.

            - Termina con una frase inspiradora siempre diferente dependiendo de ${respuestasTexto} y explica cómo "Impulso Restaurantero" aplicará esa visión para apoyar al usuario.

            Asegúrate de que las recomendaciones sean detalladas, específicas y alineadas con las ${respuestasTexto}, evitando generalidades.
          `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente especializado en negocios gastronómicos y estratégicos que va a ayudar con impulso restaurantero a las personas para que crezcan su negocio. Nunca inventes ni menciones nombres de productos, marcas o herramientas comerciales específicas: habla siempre por categoría genérica (ej. "un sistema POS"). La única marca permitida es "Impulso Restaurantero".',
        },
        { role: 'user', content: prompt },
      ],
    })

    return completion.choices[0]?.message?.content || 'No se pudieron generar recomendaciones.'
  }
}
