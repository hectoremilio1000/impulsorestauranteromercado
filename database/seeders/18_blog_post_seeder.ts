// database/seeders/2025_05_19_blog_post_blocks.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import BlogPost from '#models/blog_post'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    /**
     * 1. Crea (o busca) el post por su slug
     */
    const post = await BlogPost.firstOrCreate(
      { slug: 'excelencia-atencion-cliente' },
      {
        title: '¿El éxito de un negocio…?',
        excerpt: 'Descubre por qué la experiencia de tus comensales es la clave del éxito.',
        coverImage:
          'https://imagenesrutalab.s3.us-east-1.amazonaws.com/impulsoRestaurantero/blog/adults-enjoying-mexican-food.jpg',
        bannerPhrase: 'Convierte cada visita en un recuerdo inolvidable',
        authorId: 1, // ← ajusta al ID real
        publishedAt: DateTime.fromISO('2025-02-20T09:00:00'),
      }
    )

    /**
     * 2. Solo inserta bloques si aún no existen
     */
    const firstBlock = await post.related('blocks').query().first()
    if (!firstBlock) {
      await post.related('blocks').createMany(buildBlocks())
    }
  }
}

/* Bloques en el orden deseado */
function buildBlocks() {
  let i = 1
  return [
    {
      order: i++,
      type: 'heading' as const,
      text: '¿Qué tan importante es la experiencia?',
      imageUrl: null,
    },
    { order: i++, type: 'paragraph' as const, text: 'Lograr que la experiencia…', imageUrl: null },
    { order: i++, type: 'paragraph' as const, text: 'El paso más importante…', imageUrl: null },
    {
      order: i++,
      type: 'image' as const,
      imageUrl:
        'https://imagenesrutalab.s3.us-east-1.amazonaws.com/impulsoRestaurantero/blog/here-take-look-our-menu.jpg',
      text: null,
    },
  ]
}
