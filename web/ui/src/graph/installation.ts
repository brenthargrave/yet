import { ulid } from "ulid"

const cacheKey = "graph.install_id"

export const getId = (): string => {
  let id = localStorage.getItem(cacheKey)
  if (!id) {
    id = ulid()
    localStorage.setItem(cacheKey, id)
  }
  return id
}

export const resetId = (): string => {
  localStorage.removeItem(cacheKey)
  return getId()
}
