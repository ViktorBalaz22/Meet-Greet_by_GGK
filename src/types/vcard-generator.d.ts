declare module 'vcard-generator' {
  interface VCardOptions {
    name?: string
    firstName?: string
    lastName?: string
    organization?: string
    title?: string
    phone?: string
    email?: string
    url?: string
    note?: string
  }

  function vCardGenerator(options: VCardOptions): string
  export = vCardGenerator
}

