import and from "ramda/es/and"
import any from "ramda/es/any"
import find from "ramda/es/find"
import flatten from "ramda/es/flatten"
import includes from "ramda/es/includes"
import is from "ramda/es/is"
import _isEmpty from "ramda/es/isEmpty"
import isNil from "ramda/es/isNil"
import join from "ramda/es/join"
import map from "ramda/es/map"
import none from "ramda/es/none"
import not from "ramda/es/not"
import prop from "ramda/es/prop"
import propSatisfies from "ramda/es/propSatisfies"
import toLower from "ramda/es/toLower"
import trim from "ramda/es/trim"
import values from "ramda/es/values"
import filter from "ramda/es/filter"
import sort from "ramda/es/sort"
import descend from "ramda/es/descend"
import ascend from "ramda/es/ascend"

const isEmpty = (i: any): boolean => isNil(i) || _isEmpty(i)
const isNotEmpty = (i: any): boolean => not(isEmpty(i))
const isPresent = (i: any): boolean => not(isNil(i))

export {
  and,
  any,
  ascend,
  descend,
  filter,
  find,
  flatten,
  includes,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isPresent,
  join,
  map,
  none,
  not,
  prop,
  propSatisfies,
  sort,
  toLower,
  trim,
  values,
}
