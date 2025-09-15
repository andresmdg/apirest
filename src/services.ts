// Modules
import fs from 'node:fs'
import path from 'node:path'

// Types
export type Item = Record<string, unknown>
export type Data = Record<string, Item[] | Item>

// Verifying item is an object
export function isItem(obj: unknown): obj is Item {
  return typeof obj === 'object' && obj !== null
}

// Verifying Data is an object
export function isData(obj: unknown): obj is Record<string, Item[]> {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const data = obj as Record<string, unknown>
  return Object.values(data).every(
    value => Array.isArray(value) && value.every(isItem)
  )
}

// Business logic
export class Service {
  #db: Database

  constructor(db: string) {
    // store database instance
    this.#db = new Database(db)
  }

  // Check if the item exists in the database
  has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.#db.data, name)
  }

  // Search the database for the specified collection and return its data
  find(name: string): Item[] | Item | undefined {
    console.log(this.#db.data[name])
    return this.#db.data[name]
  }

  // Same as find but this fetches a single element that matches the id
  findById(name: string, id: number): Item | undefined {
    const collection = this.#db.data[name]
    if (Array.isArray(collection)) {
      return collection.find(item => {
        if (item['id'] !== id) return false

        if (name === 'categories') {
          const dishes = this.find('dishes')
          if (Array.isArray(dishes)) {
            item['dishes'] =
              dishes?.filter(dish => dish['category'] === id) ?? []
          } else {
            item['dishes'] = []
          }
        }
        return true
      })
    }

    return undefined
  }

  // Add data to the database
  async create(name: string, item: Item): Promise<Item> {
    if (!this.has(name)) {
      this.#db.data[name] = []
    }
    if (Array.isArray(this.#db.data[name])) {
      const collection = this.#db.data[name] as Item[]
      const id =
        collection.length > 0 && typeof collection[0]?.['id'] === 'number'
          ? Math.max(...collection.map(i => i['id'] as number)) + 1
          : 1
      const newItem = { ...item, id }
      collection.push(newItem)
      await this.#db.write()
      return newItem
    }
    throw new Error(`${name} is not a collection`)
  }

  // Delete data from the database
  async deleteById(name: string, id: number): Promise<Item | undefined> {
    if (Array.isArray(this.#db.data[name])) {
      const collection = this.#db.data[name] as Item[]
      const index = collection.findIndex(i => i['id'] === id)
      if (index !== -1) {
        const [deleted] = collection.splice(index, 1)
        await this.#db.write()
        return deleted
      }
    }
    return undefined
  }
}

// Database logic
class Database {
  path: string
  data: Record<string, Item[]>

  constructor(dirname: string) {
    this.path = path.resolve(process.cwd(), dirname)
    this.data = this.read()
  }

  // Read the database
  read(): Record<string, Item[]> {
    try {
      const content = fs.readFileSync(this.path, 'utf-8')
      const parsed = JSON.parse(content)
      return parsed
    } catch (err) {
      return {}
    }
  }

  // Write to the database
  async write(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.path,
        JSON.stringify(this.data, null, 2),
        'utf-8',
        err => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }
}
