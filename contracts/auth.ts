import User from '#app/models/user'

declare module '@adonisjs/auth/types' {
  interface ProvidersList {
    /**
     *  Cambia 'api' por el nombre de tu guard, si usas otro.
     *  La línea 'implementation: User' le dice a TS que auth.user es User.
     */
    api: {
      implementation: User
      config: {
        driver: 'lucid'
        identifierKey: 'id'
        uids: ['email']
      }
    }
  }
}
