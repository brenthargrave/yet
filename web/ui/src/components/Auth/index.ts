import { h } from "@cycle/react"

import { PhoneSubmit } from "./PhoneSubmit"

export const Auth = () => h(PhoneSubmit)

/**
 * how manage steps?
 * PhoneSubmit, PhoneVerify, PhoneConfirmed
 * how go backwards in process from verify if confused?
 */
