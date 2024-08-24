import { openDB } from 'idb'

const defaultOptions = {
  useBgFetch: true,
  autoPlay: true,
}

export type Options = typeof defaultOptions

export type OptionsKeys = keyof typeof defaultOptions

const storeName = 'options'
const dbPromise = openDB('Options', 1, {
  upgrade(db) {
    db.createObjectStore(storeName)
  },
})

export async function getAllOptions(): Promise<Options> {
  const keys = Object.keys(defaultOptions)

  const values = await Promise.all(keys.map((k) => get(k)))
  const options = Object.fromEntries(
    keys
      .map((key, index) => [key, values[index]])
  )

  return {
    ...defaultOptions,
    ...options,
  }
}

export async function getOption<T extends OptionsKeys>(
  key: T
): Promise<Options[T]> {
  const value = await get(key)

  return value ?? defaultOptions[key]
}

export async function setOption(key: OptionsKeys, value: unknown) {
  try {
    await set(key, value)
    return true
  } catch (error) {
    return false
  }
}

async function get(key: string) {
  return (await dbPromise).get(storeName, key)
}

async function set(key: string, val: any) {
  return (await dbPromise).put(storeName, val, key)
}
