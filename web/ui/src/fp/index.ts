import and from "ramda/es/and"
import isNil from "ramda/es/isNil"
import toLower from "ramda/es/toLower"
import not from "ramda/es/not"
import isEmpty from "ramda/es/isEmpty"
import includes from "ramda/es/includes"
import prop from "ramda/es/prop"
import any from "ramda/es/any"
import values from "ramda/es/values"
import flatten from "ramda/es/flatten"
import is from "ramda/es/is"

// import { ucFirst as upcaseFirst } from "change-case"

const getProp = prop

const isNotEmpty = (i: any): boolean => not(isEmpty(i))
const isPresent = (i: any): boolean => not(isNil(i))

export {
  and,
  any,
  flatten,
  getProp,
  includes,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isPresent,
  not,
  toLower,
  // upcaseFirst,
  values,
}
