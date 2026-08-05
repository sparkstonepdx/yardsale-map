// utils/json.ts
declare const shape: unique symbol

export type Json<T> = string & { readonly [shape]: T }

export const toJson = <T>(value: T) => JSON.stringify(value) as Json<T>

export const fromJson = <T>(value: Json<T> | T): T =>
  typeof value === 'string' ? (JSON.parse(value) as T) : value
