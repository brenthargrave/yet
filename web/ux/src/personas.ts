import { DraftConversationSpec } from "./models"

export interface Persona {
  first_name: string
  last_name: string
  name: string
  phone: string
  email: string
  id?: string
}

export const Alice: Persona = {
  name: "Alice",
  first_name: "Alice",
  last_name: "A.",
  phone: "9999999999",
  email: "alice@domain.com",
}

export const Bob: Persona = {
  name: "Bob",
  first_name: "Bob",
  last_name: "B.",
  phone: "9999999998",
  email: "bob@domain.com",
}

export const Charlie: Persona = {
  name: "Charlie",
  first_name: "Charlie",
  last_name: "C.",
  phone: "9999999997",
  email: "charlie@domain.com",
}

export const David: Persona = {
  name: "David",
  first_name: "David",
  last_name: "D.",
  phone: "9999999996",
  email: "david@domain.com",
}
