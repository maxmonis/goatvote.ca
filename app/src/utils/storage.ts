import {Candidate} from "../shared/models"

export class LocalStorage<
  K extends "prefers-dark" | "preferred-lng" | "wip-vote",
  T extends K extends "prefers-dark"
    ? boolean
    : K extends "preferred-lng"
    ? string
    : Array<Candidate>,
  S extends K extends "wip-vote" ? string : never,
> {
  private readonly key: string

  constructor(key: K) {
    this.key = `goat-vote_${key}`
  }

  get(suffix?: S): T | null {
    const item = localStorage.getItem(this.getKey(suffix))
    return item ? JSON.parse(item) : null
  }

  set(item: T, suffix?: S) {
    localStorage.setItem(this.getKey(suffix), JSON.stringify(item))
  }

  remove(suffix?: S) {
    localStorage.removeItem(this.getKey(suffix))
  }

  protected getKey(suffix?: S) {
    let key = this.key
    if (suffix) {
      key += `_${suffix}`
    }
    return key
  }
}

export const localDark = new LocalStorage("prefers-dark")
export const localLanguage = new LocalStorage("preferred-lng")
export const localVote = new LocalStorage("wip-vote")
