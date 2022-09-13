export const extractULIDs = (path: string) =>
  path.match(/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}/) as string[]
