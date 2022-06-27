import and from "ramda/es/and"
import any from "ramda/es/any"
import find from "ramda/es/find"
import flatten from "ramda/es/flatten"
import includes from "ramda/es/includes"
import is from "ramda/es/is"
import isNil from "ramda/es/isNil"
import not from "ramda/es/not"
import prop from "ramda/es/prop"
import toLower from "ramda/es/toLower"
import values from "ramda/es/values"
import none from "ramda/es/none"
import trim from "ramda/es/trim"
import propSatisfies from "ramda/es/propSatisfies"
import _isEmpty from "ramda/es/isEmpty"

const isEmpty = (i: any): boolean => isNil(i) || _isEmpty(i)
const isNotEmpty = (i: any): boolean => not(isEmpty(i))
const isPresent = (i: any): boolean => not(isNil(i))

export {
  and,
  any,
  flatten,
  includes,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isPresent,
  not,
  toLower,
  values,
  find,
  none,
  prop,
  propSatisfies,
  trim,
}
