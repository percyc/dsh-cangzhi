/**
 * DSH storage-domain declaration for per-session Cangzhi state.
 *
 * The plugin never depends on `@deepseek-ai/dsh-storage-domain` or `zod` at
 * runtime. Those packages are not guaranteed to resolve in the file://-style
 * install DSH uses for a hand-mounted adapter — they live in the DSH monorepo
 * under `node_modules/.pnpm/...` and are not symlinked into this plugin's
 * resolution path. Importing them from `lib/index.js` would crash the plugin
 * loader with `ERR_MODULE_NOT_FOUND` the moment DSH tried to import it.
 *
 * The spec we hand to `ctx.storage.domain.open(...)` is structurally
 * identical to what `defineDomain(...)` would have produced: same field
 * names, same literal types, same table shape. DSH's storage-domain runtime
 * never re-runs `defineDomain` on a spec it is asked to open; the validation
 * is the plugin author's responsibility at the call site, which is why the
 * upstream helper is a pure identity function over a constrained object
 * (`return spec` after the guards). We replicate those guards here, with the
 * same `UNIT_NAME_RE` shape, and we replicate the only table-schema feature
 * we actually need — `z.string()` / `z.enum([...])` — as a tiny Zod-like
 * shape with a working `parse` (DSH validates stored records by calling
 * `valueSchema.parse(raw)`).
 *
 * Result: the plugin loads standalone, the spec passed to
 * `ctx.storage.domain.open` is bit-for-bit compatible with what
 * `defineDomain` would emit, and the on-disk medium is round-trip safe.
 */

/**
 * Unit-name pattern enforced by the upstream DSH storage-domain `defineDomain`
 * helper. Domain names and table names must match it. Mirrored verbatim so a
 * plugin-loaded domain is indistinguishable from one declared through the
 * upstream helper.
 */
const UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/

class DomainValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DomainValidationError'
  }
}

/**
 * Declare one table. Mirrors `@deepseek-ai/dsh-storage-domain`'s
 * `domainTable`: a plain `{ valueSchema }` handle. DSH reads `valueSchema.parse`
 * when validating records on open, so the schema must expose that method.
 * @param {object} schema - valueSchema with a Zod-compatible `parse` method.
 * @returns {{ valueSchema: object }}
 */
function domainTable(schema) {
  if (schema === null || typeof schema !== 'object' || typeof schema.parse !== 'function') {
    throw new DomainValidationError('domainTable: schema must expose a parse() method')
  }
  return { valueSchema: schema }
}

/**
 * Validate a domain spec and return it (the upstream helper is an identity
 * function over a validated object; the literal-type narrowing it provides in
 * TypeScript is a compile-time hint, not a runtime contract).
 * @param {object} spec - candidate domain spec.
 * @returns {object} the same spec, validated.
 */
function defineDomain(spec) {
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new DomainValidationError('defineDomain: spec must be a non-array object')
  }
  if (typeof spec.name !== 'string' || !UNIT_NAME_RE.test(spec.name)) {
    throw new DomainValidationError(`domain name '${String(spec.name)}' must match ${UNIT_NAME_RE.toString()}`)
  }
  if (!Number.isInteger(spec.version) || spec.version < 0) {
    throw new DomainValidationError(`domain '${spec.name}' version must be a non-negative integer, got ${String(spec.version)}`)
  }
  if (spec.layout !== undefined && spec.layout !== 'single' && spec.layout !== 'per-record') {
    throw new DomainValidationError(`domain '${spec.name}' layout must be 'single' or 'per-record', got '${String(spec.layout)}'`)
  }
  if (spec.tables === null || typeof spec.tables !== 'object' || Array.isArray(spec.tables)) {
    throw new DomainValidationError(`domain '${spec.name}' tables must be a non-array object`)
  }
  for (const table of Object.keys(spec.tables)) {
    if (!UNIT_NAME_RE.test(table)) {
      throw new DomainValidationError(`domain '${spec.name}' table name '${table}' must match ${UNIT_NAME_RE.toString()}`)
    }
  }
  if (spec.global !== undefined) {
    if (spec.global === null || typeof spec.global !== 'object' || typeof spec.global.schema?.safeParse !== 'function') {
      throw new DomainValidationError(`domain '${spec.name}' global.schema must be a Zod-like schema with safeParse()`)
    }
    if (spec.global.schema.safeParse(null).success === true) {
      throw new DomainValidationError(`domain '${spec.name}' global schema must not accept null: null is the medium's 'never written' sentinel, so a stored null could not round-trip`)
    }
  }
  return spec
}

/**
 * Minimal Zod-compatible schema helpers, scoped to the shapes the storage
 * domain's runtime actually invokes. DSH's storage domain calls:
 *   - `valueSchema.parse(raw)` → must return the validated value or throw.
 *   - `spec.global.schema.safeParse(null)` → must return `{ success }` (only
 *     used when the spec declares a global; we do not).
 *
 * Both `z.string()` and `z.enum([...])` produce frozen schemas with
 * `safeParse` and `parse` methods; nothing else in this plugin (or DSH's
 * domain runtime) reaches into them.
 */
const z = {
  string() {
    const schema = {
      _kind: 'string',
      safeParse(value) {
        if (typeof value === 'string') return { success: true, data: value }
        return { success: false, error: new Error(`expected string, got ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`) }
      },
      parse(value) {
        const result = schema.safeParse(value)
        if (result.success === true) return result.data
        throw result.error
      },
    }
    return Object.freeze(schema)
  },
  enum(values) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new DomainValidationError('z.enum: values must be a non-empty array')
    }
    const set = new Set(values)
    const schema = {
      _kind: 'enum',
      options: values.slice(),
      safeParse(value) {
        if (typeof value === 'string' && set.has(value)) return { success: true, data: value }
        return { success: false, error: new Error(`expected one of [${values.join(', ')}], got ${typeof value === 'string' ? JSON.stringify(value) : String(value)}`) }
      },
      parse(value) {
        const result = schema.safeParse(value)
        if (result.success === true) return result.data
        throw result.error
      },
    }
    return Object.freeze(schema)
  },
}

/** Domain name; must match the storage `UNIT_NAME_RE`. */
export const SESSION_STATE_DOMAIN_NAME = 'cangzhi_session'

/**
 * Declare the Cangzhi per-session state domain: an explicit workspace pin per
 * session and an explicit capability policy pin per session. Absence of a pin
 * is resolution (inherit parent / process default), never an error.
 */
export function sessionStateDomainSpec() {
  return defineDomain({
    name: SESSION_STATE_DOMAIN_NAME,
    version: 1,
    layout: 'per-record',
    tables: {
      workspaces: domainTable(z.string()),
      policies: domainTable(z.enum(['on', 'off'])),
    },
  })
}

export { defineDomain, domainTable, z, UNIT_NAME_RE }
