import { openDB } from 'idb'

const storeName = 'video-info'
const dbPromise = openDB('Offliner', 1, {
  upgrade(db) {
    db.createObjectStore(storeName)
  },
})

export async function get(key: string) {
  return (await dbPromise).get(storeName, key)
}
export async function set(key: string, val: any) {
  return (await dbPromise).put(storeName, val, key)
}
export async function del(key: string) {
  return (await dbPromise).delete(storeName, key)
}
export async function clear() {
  return (await dbPromise).clear(storeName)
}
export async function keys() {
  return (await dbPromise).getAllKeys(storeName)
}
