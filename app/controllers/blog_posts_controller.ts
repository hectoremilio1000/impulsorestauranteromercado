// app/controllers/blog_posts_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import string from '@adonisjs/core/helpers/string'
import { createBlogPostValidator } from '#validators/blog_post'

export default class BlogPostsController {
  /**
   * GET /blog-posts
   * Lista paginada de posts publicados
   */
  public async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const posts = await BlogPost.query()
      .preload('author')
      .whereNotNull('publishedAt')
      .orderBy('publishedAt', 'desc')
      .paginate(page, limit)

    // omitimos "content" para reducir payload
    return posts.serialize({ fields: { omit: ['content'] } })
  }
  public async findById({ params, response }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .preload('author')
      .preload('blocks', (q) => q.orderBy('order'))
      .first()

    if (!post) {
      return response.notFound({ error: 'Post no encontrado' })
    }

    return post.serialize()
  }

  /**
   * GET /blog-posts/:slug
   * Devuelve un post por su slug
   */
  public async show({ params, response }: HttpContext) {
    const post = await BlogPost.query()
      .where('slug', params.slug)
      .preload('author')
      .preload('blocks', (q) => q.orderBy('order'))
      .first()

    if (!post) {
      return response.notFound({ error: 'Post no encontrado' })
    }

    return post.serialize({ fields: { omit: ['content'] } })
  }

  /**
   * GET /blog-posts/create
   * Placeholder para vistas server-side. En API REST no lo usamos.
   */
  public async create() {
    return { message: 'Form to create a new post (no-op in JSON API)' }
  }

  /**
   * POST /blog-posts
   * Crea un post (draft o publicado)
   */
  public async store({ request, auth }: HttpContext) {
    const { blocks, ...meta } = await request.validateUsing(createBlogPostValidator)

    const post = await BlogPost.create({
      ...meta,
      slug: meta.slug ?? string.slug(meta.title),
      authorId: auth.user!.id,
    })

    await post.related('blocks').createMany(blocks)
    await post.refresh() // vuelve a leer la fila
    await post.load('blocks') // carga la relación blocks

    return post // devuelve el modelo listo
  }

  public async update({ params, request }: HttpContext) {
    const { blocks, ...meta } = await request.validateUsing(createBlogPostValidator)

    const post = await BlogPost.findOrFail(params.id)
    post.merge({
      ...meta,
      slug: meta.slug ?? string.slug(meta.title),
    })
    await post.save()
    await post.related('blocks').query().delete()
    await post.related('blocks').createMany(blocks)

    await post.refresh()
    await post.load('blocks')

    return post
  }

  /**
   * GET /blog-posts/:id/edit
   * Placeholder para vistas server-side. En API REST no lo usamos.
   */
  public async edit({ params }: HttpContext) {
    return { message: `Form to edit post #${params.id} (no-op in JSON API)` }
  }

  /**
   * PUT /blog-posts/:id
   * Actualiza un post
   */

  /**
   * DELETE /blog-posts/:id
   * Elimina un post
   */
  public async destroy({ params }: HttpContext) {
    const post = await BlogPost.findOrFail(params.id)
    await post.delete()
    return { success: true }
  }
}
