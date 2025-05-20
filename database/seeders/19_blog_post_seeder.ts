import BlogPost from '#models/blog_post'
import BlogPostBlock from '#models/blog_post_block'
import { DateTime } from 'luxon'

export default class BlogPostSeeder {
  public async run() {
    const post = await BlogPost.create({
      title: '¿El éxito de un negocio es la excelencia en la atención al cliente?',
      slug: 'excelencia-atencion-cliente',
      excerpt: 'Si quieres conocer la respuesta, no cometas este error...',
      coverImage:
        'https://imagenesrutalab.s3.us-east-1.amazonaws.com/impulsoRestaurantero/blog/adults-enjoying-mexican-food.jpg',
      bannerPhrase: 'Si quieres conocer la respuesta, haz esto',
      authorId: 41,
      publishedAt: DateTime.fromISO('2025-05-20T06:13:05'),
      createdAt: DateTime.fromISO('2025-05-20T06:19:03'),
      updatedAt: DateTime.fromISO('2025-05-20T06:40:00'),
    })

    await post.related('blocks').createMany([
      {
        order: 1,
        type: 'paragraph',
        text: 'Lograr que la experiencia de tus clientes al visitar tu restaurante sea espectacular, es una tarea diaria, una tarea que inclusive puede llevarte años lograr cumplir. Pero eso no es todo, tendrás que buscar activamente nuevos incentivos, detalles que hagan diferente tu restaurante del resto. El paso más importante es convencer a tus colaboradores de que todo lo que hacen por satisfacer a los comensales, sí marca la diferencia y sí cuenta.',
      },
      {
        order: 2,
        type: 'image',
        imageUrl:
          'https://imagenesrutalab.s3.us-east-1.amazonaws.com/impulsoRestaurantero/blog/adults-enjoying-mexican-food.jpg',
      },
      {
        order: 3,
        type: 'heading',
        text: '¿Qué tan importante es la experiencia del cliente?',
      },
      {
        order: 4,
        type: 'paragraph',
        text: 'Una pregunta que puede responderse de distintas maneras; lo que es importante para unos, puede no serlo para otros. Pero, ¿quién tiene la razón? Recuerdo que hace años, en palabras del empresario mexicano Bruno Newman, pude comprender que la experiencia del cliente es el ingrediente clave de todo negocio, en este caso, de los restaurantes. Aquella vez Newman, en un congreso de PRORP, compartió una anécdota que debería ser escuchada por todos los que nos dedicamos a prestar un servicio:',
      },
      {
        order: 5,
        type: 'paragraph',
        text: '“Pasaba todos los días por un pequeño local muy bien ubicado... Al terminar el trabajo, pagué los $150 pesos que me correspondía, y agregué $500 pesos de propina... te aseguro que si haces todo lo que esté en tus manos para que tus clientes se sientan valorados, tendrás por seguro el regreso de cada uno de ellos.”',
      },
      {
        order: 6,
        type: 'paragraph',
        text: 'Sé que puedes pensar que una barbería no tiene mucho que ver con tu restaurante, y tienes razón: no es lo mismo recortar cabello que estar muy pendiente de las peticiones de un comensal y enamorarlo en cada bocado. Sin embargo, la esencia sigue siendo la misma: dar la mejor experiencia. Todos los días debes preguntarte y hacer que tus colaboradores se pregunten, “¿Qué tan importante es la experiencia del cliente?”. La respuesta ya la sabes.',
      },
    ])
  }
}
