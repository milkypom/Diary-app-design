const DB_NAME = "daylog_image_store"
const STORE_NAME = "images"
const IMAGE_PREFIX = "idb-image:"

const objectUrls = new Map<string, string>()
const referencesByObjectUrl = new Map<string, string>()

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function imageKey(): string {
  return `${IMAGE_PREFIX}${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

export function isStoredImage(reference: string): boolean {
  return reference.startsWith(IMAGE_PREFIX)
}

export function resolveImageUrl(reference: string): string {
  return objectUrls.get(reference) ?? reference
}

export function toStoredImageReference(url: string): string {
  return referencesByObjectUrl.get(url) ?? url
}

export async function storeImage(file: File): Promise<string> {
  const key = imageKey()
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    transaction.objectStore(STORE_NAME).put(file, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
  db.close()
  const url = URL.createObjectURL(file)
  objectUrls.set(key, url)
  referencesByObjectUrl.set(url, key)
  return key
}

export async function getStoredImage(reference: string): Promise<Blob | null> {
  if (!isStoredImage(reference)) return null
  const db = await openDatabase()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(reference)
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return blob
}

export async function hydrateStoredImages(): Promise<void> {
  const db = await openDatabase()
  const entries = await new Promise<Array<[string, Blob]>>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const request = transaction.objectStore(STORE_NAME).openCursor()
    const result: Array<[string, Blob]> = []
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) return resolve(result)
      result.push([String(cursor.key), cursor.value as Blob])
      cursor.continue()
    }
    request.onerror = () => reject(request.error)
  })
  db.close()
  entries.forEach(([key, blob]) => {
    if (!objectUrls.has(key)) {
      const url = URL.createObjectURL(blob)
      objectUrls.set(key, url)
      referencesByObjectUrl.set(url, key)
    }
  })
}
