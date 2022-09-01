import { Persona } from "../generated"

export const canViewNotes = (persona: Persona) =>
  [Persona.Participant, Persona.Contact].includes(persona)
