import { createServer, request } from "node:http";
import { request as request$1 } from "node:https";
//#region bundled cosmokit
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Binary source detection and base64/hex conversion helpers. */
var Binary;
(function(Binary) {
	Binary.is = isArrayBufferLike;
	Binary.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	Binary.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	Binary.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	Binary.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	Binary.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	Binary.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
function deepEqual(a, b, strict) {
	if (a === b) return true;
	if (!strict && isNullable(a) && isNullable(b)) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return false;
	if (!a || !b) return false;
	function check(test, then) {
		return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
	}
	return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
		if (a.byteLength !== b.byteLength) return false;
		const viewA = new Uint8Array(a);
		const viewB = new Uint8Array(b);
		for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
		return true;
	}) ?? Object.keys({
		...a,
		...b
	}).every((key) => deepEqual(a[key], b[key], strict));
}
/** Time constants plus parsing and formatting helpers. */
var Time;
(function(Time) {
	Time.millisecond = 1;
	Time.second = 1e3;
	Time.minute = Time.second * 60;
	Time.hour = Time.minute * 60;
	Time.day = Time.hour * 24;
	Time.week = Time.day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	Time.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	Time.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
	}
	Time.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * Time.day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * Time.minute);
	}
	Time.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
	}
	Time.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	Time.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
		else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
		else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
		else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
		return ms + "ms";
	}
	Time.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	Time.toDigits = toDigits;
	function template(template, time = /* @__PURE__ */ new Date()) {
		return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	Time.template = template;
})(Time || (Time = {}));
//#endregion
//#region bundled schemastery
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options = {}) {
		return Schema.resolve(data, schema, options)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options) => new Schema(options));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options = refs[key];
			options.sKey = getRef(options.sKey);
			options.inner = getRef(options.inner);
			options.list = options.list && options.list.map(getRef);
			options.dict = options.dict && mapValues(options.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value) : value;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
const resolvers = {};
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date = new Date(value);
		if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
		return date;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key in args[index]) {
						if (typeof args[index][key] !== "number") continue;
						schema.bits[key] = args[index][key];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));
//#endregion
//#region src/proxy.ts
const HOP_BY_HOP = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade"
]);
function upstreamHeaders(req, target) {
	const headers = {};
	for (const [name, value] of Object.entries(req.headers)) if (!HOP_BY_HOP.has(name.toLowerCase()) && value !== void 0) headers[name] = value;
	headers.host = target.host;
	headers["x-forwarded-host"] = req.headers.host;
	headers["x-forwarded-proto"] = req.socket.encrypted ? "https" : "http";
	return headers;
}
function responseHeaders(headers) {
	const forwarded = {};
	for (const [name, value] of Object.entries(headers)) if (!HOP_BY_HOP.has(name.toLowerCase()) && value !== void 0) forwarded[name] = value;
	delete forwarded["x-frame-options"];
	return forwarded;
}
function createProxyHandler(webUrl, options = {}) {
	const upstream = new URL(webUrl);
	if (upstream.protocol !== "http:" && upstream.protocol !== "https:") throw new Error("cangzhi webUrl must use http or https");
	const send = upstream.protocol === "https:" ? request$1 : request;
	return async (req, res) => {
		const incoming = new URL(req.url ?? "/", "http://dsh.local");
		const target = new URL(upstream);
		const strippedPath = options.stripPrefix && incoming.pathname.startsWith(options.stripPrefix) ? incoming.pathname.slice(options.stripPrefix.length) || "/" : incoming.pathname;
		target.pathname = `${upstream.pathname.replace(/\/$/, "")}${options.upstreamPrefix ?? ""}${strippedPath}`;
		target.search = incoming.search;
		const headers = upstreamHeaders(req, target);
		if (options.headers !== void 0) Object.assign(headers, await options.headers(req));
		const proxy = send({
			protocol: target.protocol,
			hostname: target.hostname,
			port: target.port || void 0,
			method: req.method,
			path: `${target.pathname}${target.search}`,
			headers
		}, (reply) => {
			const headers = responseHeaders(reply.headers);
			if (!options.allowFrames) delete headers["x-frame-options"];
			res.writeHead(reply.statusCode ?? 502, headers);
			reply.pipe(res);
		});
		proxy.on("error", (error) => {
			if (res.headersSent) {
				res.destroy(error);
				return;
			}
			res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify({
				error: "cangzhi_gateway_unavailable",
				message: "藏知管理服务暂时不可用"
			}));
		});
		req.on("aborted", () => {
			proxy.destroy();
		});
		req.pipe(proxy);
	};
}
//#endregion
//#region src/host/session-state.mjs
const POLICY_VALUES = Object.freeze(["on", "off"]);
/** Is a value a valid knowledge capability policy? */
function isPolicy(value) {
	return POLICY_VALUES.includes(value);
}
/** Is a value a plausible workspace slug? (mirrors the Host's slug rule) */
function isWorkspaceSlug(value) {
	return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
}
/**
* Create an in-memory store. The returned object is the shape every adapter
* satisfies; production may attach durable read/write underneath it.
*/
function createMemoryStore() {
	const workspaces = /* @__PURE__ */ new Map();
	const policies = /* @__PURE__ */ new Map();
	return {
		getWorkspace(id) {
			return workspaces.get(id);
		},
		setWorkspace(id, slug) {
			if (slug === void 0 || slug === "") workspaces.delete(id);
			else workspaces.set(id, slug);
		},
		hasWorkspace(id) {
			return workspaces.has(id);
		},
		getPolicy(id) {
			return policies.get(id);
		},
		setPolicy(id, policy) {
			if (policy === void 0 || policy === "") policies.delete(id);
			else policies.set(id, policy);
		},
		/** Snapshot for persistence. */
		entries() {
			return {
				workspaces: [...workspaces.entries()],
				policies: [...policies.entries()]
			};
		},
		load(source) {
			for (const [id, slug] of source?.workspaces ?? []) if (isWorkspaceSlug(slug)) workspaces.set(id, slug);
			for (const [id, policy] of source?.policies ?? []) if (isPolicy(policy)) policies.set(id, policy);
		},
		clear() {
			workspaces.clear();
			policies.clear();
		}
	};
}
/**
* Walk from `id` up the parent chain. Returns the nearest explicit stored value
* for the key accessor, or `undefined` when no session in the chain pinned one.
* The chain is read through the injected `parentOf` callback so this module
* never reaches into DSH agent internals (tests stub it with a simple map).
*/
function firstExplicitInChain(store, id, accessor, parentOf) {
	let current = id;
	const seen = /* @__PURE__ */ new Set();
	while (current !== void 0 && current !== null && !seen.has(current)) {
		seen.add(current);
		const value = accessor(current);
		if (value !== void 0) return {
			value,
			source: current
		};
		current = parentOf(current);
	}
}
/**
* Resolve the effective workspace for a session.
*
* @param {object} store - store with getWorkspace/hasWorkspace.
* @param {string} id - the executing session id (exec.agent.id).
* @param {object} options
* @param {(id:string)=>string|undefined} options.parentOf - parent session id.
* @param {string} options.defaultWorkspace - process-global fallback slug.
* @returns {{ workspace:string, bound:boolean, source?:string }}
*   `bound:true` when the value is session-scoped; `bound:false` means it is
*   the process default (degraded, not isolated).
*/
function resolveWorkspace(store, id, { parentOf, defaultWorkspace }) {
	const found = firstExplicitInChain(store, id, store.getWorkspace, parentOf);
	if (found === void 0) return {
		workspace: defaultWorkspace,
		bound: false
	};
	return {
		workspace: found.value,
		bound: true,
		source: found.source
	};
}
/**
* Resolve the effective capability policy for a session. Falling back to a
* parent's stored policy is correct only for policy "off" (a parent that turned
* off the capability should not have an unconfigured child silently re-enable
* the tools); a parent that left its child unconfigured also leaves it to the
* process default.
*/
function resolvePolicy(store, id, { parentOf }) {
	const found = firstExplicitInChain(store, id, store.getPolicy, parentOf);
	if (found === void 0) return {
		policy: "on",
		bound: false
	};
	return {
		policy: found.value,
		bound: true,
		source: found.source
	};
}
//#endregion
//#region src/host/domain-store.mjs
/**
* Build a store over two table handles.
* @param {{workspaces: object, policies: object}} tables - table handles with
*   `get(key)`, `entries()`, `put(key,value):Promise`, `delete(key):Promise`.
* @returns a store matching `createMemoryStore`'s shape (writes return promises).
*/
function createDomainStore(tables) {
	const workspaces = tables.workspaces;
	const policies = tables.policies;
	return {
		getWorkspace(id) {
			return workspaces.get(id);
		},
		setWorkspace(id, slug) {
			if (slug === void 0 || slug === "") return workspaces.delete(id).then(() => void 0);
			return workspaces.put(id, slug);
		},
		hasWorkspace(id) {
			return workspaces.get(id) !== void 0;
		},
		getPolicy(id) {
			return policies.get(id);
		},
		setPolicy(id, policy) {
			if (policy === void 0 || policy === "") return policies.delete(id).then(() => void 0);
			return policies.put(id, policy);
		},
		entries() {
			return {
				workspaces: [...workspaces.entries()],
				policies: [...policies.entries()]
			};
		},
		/** Durability is the domain's job (writes already await the medium). */
		persist() {
			return Promise.resolve();
		},
		/** The domain preloads from the medium at open; nothing to hydrate. */
		load() {}
	};
}
//#endregion
//#region src/host/mcp-call.mjs
/**
* One-leaf Cangzhi MCP `tools/call` over the plugin's own loopback proxy.
*
* The generic DSH MCP bridge (`cangzhi-mcp`) connects to the plugin's internal
* proxy with a single, process-wide header set — it cannot express which
* session the call belongs to. The per-session scoped tool override therefore
* talks to the SAME loopback proxy itself, but annotates each request with the
* workspace resolved for the executing session (`x-cangzhi-workspace`). The
* proxy owns authentication (Bearer PAT is resolved Host-side and never reaches
* the browser), so this module only needs to marshal the MCP `tools/call`
* envelope and project the result. That keeps the tool schema, result shape and
* cancellation semantics identical to the generic bridge.
*
* The default wall-clock bound per call is 120_000 ms, matching the Cangzhi
* knowledge service's expected latency budget for `knowledge_ask` and dataset
* queries. The DSH mcp-client's built-in default is 60_000 ms; the longer
* bound here is the contract this plugin's overrides preserve. When the
* caller supplies an `exec.signal` (the model's tool-run signal), the bound
* is layered on top of that signal so a model-side cancellation still wins
* over the wall-clock bound, and either aborting will tear down the in-flight
* fetch.
*
* `fetch` is injectable for `node --test`; it defaults to the global fetch.
*/
/** Wall-clock bound for a single MCP `tools/call`; layered on top of `exec.signal`. */
const DEFAULT_MCP_TIMEOUT_MS = 12e4;
/** MCP protocol version pinned by the DSH mcp-client transport. */
const MCP_PROTOCOL_VERSION = "2025-03-26";
/** JSON content type and accepted response kinds for a streamable-http POST. */
const ACCEPT_JSON_SSE = "application/json, text/event-stream";
/**
* Per-workspace MCP session ids so one-shot requests behave like a persistent
* streamable-http connection. A real server may require an `Mcp-Session-Id`;
* we mirror the SDK by storing the one the proxy returns and resending it.
*/
const sessionIds = /* @__PURE__ */ new Map();
/** Monotonic JSON-RPC id so the response can be matched to the request. */
let nextRequestId = 1;
/** Extract the raw MCP tool name from a public `mcp__cangzhi__<raw>` name. */
function rawToolName(publicName, serverName = "cangzhi") {
	const prefix = `mcp__${serverName}__`;
	return publicName.startsWith(prefix) ? publicName.slice(prefix.length) : publicName;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Parse an `application/json` MCP JSON-RPC response body. */
function parseJsonResponse(body) {
	if (typeof body === "string") {
		if (body.trim().length === 0) return void 0;
		return JSON.parse(body);
	}
	return body;
}
/**
* Parse a streamable-http text/event-stream body into an array of SSE data
* payloads, coalescing multi-line `data:` blocks.
* @param {string} text - the SSE payload.
* @returns {Array<unknown>} parsed JSON data payloads.
*/
function parseSseResponse(text) {
	const messages = [];
	let currentData = "";
	let currentEvent = "";
	const flush = () => {
		if (currentData.length === 0) return;
		const trimmed = currentData.replace(/\n$/, "");
		try {
			messages.push(JSON.parse(trimmed));
		} catch {
			messages.push({
				__raw: trimmed,
				__event: currentEvent
			});
		}
		currentData = "";
		currentEvent = "";
	};
	for (const line of text.split(/\r?\n/)) {
		if (line.startsWith(":")) continue;
		if (line === "") {
			flush();
			continue;
		}
		if (line.startsWith("event:")) {
			currentEvent = line.slice(6).trim();
			continue;
		}
		if (line.startsWith("data:")) {
			currentData += `${line.slice(5).replace(/^ /, "")}\n`;
			continue;
		}
	}
	flush();
	return messages;
}
/** Find the JSON-RPC result/error for a matched id across JSON and SSE payloads. */
function extractForId(payloads, id) {
	for (const payload of payloads) {
		if (!isRecord(payload)) continue;
		if ("id" in payload && payload.id !== id) continue;
		if ("result" in payload) return {
			kind: "result",
			payload: payload.result
		};
		if ("error" in payload) return {
			kind: "error",
			payload: payload.error
		};
	}
}
function responseTextToMessages(text, contentType) {
	if (contentType.includes("text/event-stream")) return parseSseResponse(text);
	const parsed = parseJsonResponse(text);
	return parsed === void 0 ? [] : [parsed];
}
/**
* Compose the in-flight AbortSignal: any signal the caller supplied is
* respected (caller cancellation wins), and a wall-clock bound is layered on
* top via a fresh controller. Either side aborting tears down the fetch and
* the controller's timer is cleared so the process never leaks a hanging
* timer.
*/
function composeSignal(callerSignal, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort(new DOMException("cangzhi MCP call exceeded the wall-clock bound", "TimeoutError"));
	}, timeoutMs);
	const onCallerAbort = () => {
		controller.abort(callerSignal?.reason);
	};
	if (callerSignal?.aborted === true) onCallerAbort();
	else if (callerSignal !== void 0) callerSignal.addEventListener("abort", onCallerAbort, { once: true });
	return {
		signal: controller.signal,
		cancel: () => {
			clearTimeout(timer);
			if (callerSignal !== void 0 && !callerSignal.aborted) callerSignal.removeEventListener("abort", onCallerAbort);
		}
	};
}
/**
* Invoke one MCP `tools/call` through the plugin's loopback proxy with an
* explicit workspace header.
*
* @param {object} options
* @param {string} options.internalMcpBaseUrl - e.g. `http://127.0.0.1:3081`.
* @param {string} options.workspace - resolved session workspace slug.
* @param {string} options.rawName - raw MCP tool name (e.g. `knowledge_search`).
* @param {Record<string, unknown>} options.args - parsed tool arguments.
* @param {AbortSignal} [options.signal] - caller cancellation signal.
* @param {number} [options.timeoutMs=DEFAULT_MCP_TIMEOUT_MS] - wall-clock bound.
* @param {typeof fetch} [options.fetch] - fetch implementation (injectable).
* @returns {Promise<{content: unknown[], structuredContent?: unknown}>}
*   the canonical MCP result value, matching the generic bridge's shape.
*/
async function invokeCangzhiMcp({ internalMcpBaseUrl, workspace, rawName, args, signal, timeoutMs = DEFAULT_MCP_TIMEOUT_MS, fetch: fetchImpl = globalThis.fetch }) {
	const id = nextRequestId++;
	const request = {
		jsonrpc: "2.0",
		id,
		method: "tools/call",
		params: {
			name: rawName,
			arguments: args ?? {}
		}
	};
	const headers = {
		"content-type": "application/json",
		accept: ACCEPT_JSON_SSE,
		"mcp-protocol-version": MCP_PROTOCOL_VERSION,
		"x-cangzhi-workspace": workspace
	};
	const sessionId = sessionIds.get(workspace);
	if (sessionId !== void 0) headers["Mcp-Session-Id"] = sessionId;
	const base = internalMcpBaseUrl.replace(/\/$/, "");
	const composed = composeSignal(signal, timeoutMs);
	let response;
	let text;
	try {
		response = await fetchImpl(`${base}/api/mcp`, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
			signal: composed.signal
		});
		text = await response.text();
	} finally {
		composed.cancel();
	}
	const contentType = String(response.headers.get("content-type") ?? "application/json");
	if (!response.ok) {
		sessionIds.delete(workspace);
		if (response.status === 401 || response.status === 403) throw new Error(`cangzhi MCP authentication failed (HTTP ${String(response.status)}); check CANGZHI_TOKEN`);
		throw new Error(`cangzhi MCP call failed (HTTP ${String(response.status)})`);
	}
	const newSessionId = response.headers.get("mcp-session-id");
	if (newSessionId) sessionIds.set(workspace, newSessionId);
	else sessionIds.delete(workspace);
	const matched = extractForId(responseTextToMessages(text, contentType), id);
	if (matched === void 0) throw new Error("cangzhi MCP call returned no matching result");
	if (matched.kind === "error") {
		const message = typeof matched.payload?.message === "string" ? matched.payload.message : "cangzhi MCP tool error";
		throw new Error(message);
	}
	const result = matched.payload;
	if (!isRecord(result)) throw new Error("cangzhi MCP call returned a malformed result");
	const content = Array.isArray(result.content) ? result.content : [];
	if (result.isError === true) {
		const textValue = content.map((block) => isRecord(block) && typeof block.text === "string" ? block.text : "").join("\n");
		throw new Error(textValue || "cangzhi MCP tool returned an error");
	}
	const value = { content };
	if (result.structuredContent !== void 0) value.structuredContent = result.structuredContent;
	return value;
}
//#endregion
//#region src/host/tool-names.mjs
/** All model-facing `mcp__cangzhi__*` tool names. */
const CANGZHI_TOOLS = Object.freeze([
	"mcp__cangzhi__knowledge_list_scopes",
	"mcp__cangzhi__knowledge_list_facets",
	"mcp__cangzhi__knowledge_list_documents",
	"mcp__cangzhi__knowledge_search",
	"mcp__cangzhi__knowledge_ask",
	"mcp__cangzhi__knowledge_get_document",
	"mcp__cangzhi__knowledge_get_chunk",
	"mcp__cangzhi__knowledge_list_datasets",
	"mcp__cangzhi__knowledge_get_dataset_schema",
	"mcp__cangzhi__knowledge_preview_dataset_rows",
	"mcp__cangzhi__knowledge_query_dataset",
	"mcp__cangzhi__knowledge_get_evidence_by_chunk",
	"mcp__cangzhi__knowledge_get_evidence_by_dataset",
	"mcp__cangzhi__knowledge_preview_evidence_rows"
]);
//#endregion
//#region src/host/session-manager.mjs
/**
* Per-session Cangzhi workspace + capability wiring over DSH agents.
*
* This is the DSH-coupled half of `session-state.mjs`: it turns a session's
* resolved policy/workspace into real enforcement. For each live agent it
* shadows the global `mcp__cangzhi__*` tools with SCOPED overrides whose
* `execute` resolves the workspace for the EXECUTING session
* (`exec.agent.id`, parent-inherited) at call time — so two concurrent A/B
* sessions use their own workspace no matter when they were created, and a
* workspace switch takes effect on the very next call.
*
* Race handling:
* - agent created before the generic `cangzhi-mcp` bridge has registered tools
*   (or before it reconnects) → the scoped overrides register with zero tools;
*   a `tools/change` signature check re-points every live "on" session at the
*   current global set the moment the bridge appears.
* - global tools disappear (bridge down) → overrides are disposed for "on"
*   sessions so a stale-schema tool can never execute; nothing falls back to
*   the process-global workspace because once the bridge is down there are no
*   tools to call, and once it returns the overrides re-register with the
*   freshly resolved per-session workspace.
*
* All decisions come from `store` (a `session-state` store) with
* `parentOf` walking live agents, so this module never ships a browser-side
* security boundary.
*/
/**
* Build a session manager.
* @param {object} opts
* @param {object} opts.store - session-state store (memory or domain-backed).
* @param {string} opts.defaultWorkspace - process-global fallback slug.
* @param {string} opts.internalMcpBaseUrl - loopback proxy base, e.g. `http://127.0.0.1:3081`.
* @param {object} opts.agentsFacade - `{ get(id), list() }` over live agents.
* @param {object} opts.tools - the global `ctx.tools` used to copy schemas and
*   to subscribe to `tools/change` (event wiring is done by the Host).
* @param {typeof fetch} [opts.fetchImpl] - fetch for the MCP call (injectable).
* @param {(...a:unknown[])=>void} [opts.log] - logger.
* @returns a session manager handle.
*/
function createSessionManager({ store, defaultWorkspace, internalMcpBaseUrl, agentsFacade, tools, fetchImpl, log = () => {} }) {
	const entries = /* @__PURE__ */ new Map();
	const cangzhiTools = CANGZHI_TOOLS;
	const definitionIds = /* @__PURE__ */ new WeakMap();
	let nextDefinitionId = 1;
	let lastSignature = "";
	const parentOf = (id) => {
		if (id === void 0) return void 0;
		return agentsFacade.get(id)?.session?.header?.parentSession;
	};
	const definitionId = (definition) => {
		if ((typeof definition !== "object" || definition === null) && typeof definition !== "function") return "missing";
		let id = definitionIds.get(definition);
		if (id === void 0) {
			id = nextDefinitionId++;
			definitionIds.set(definition, id);
		}
		return String(id);
	};
	const cangzhiSignature = () => cangzhiTools.map((name) => [name, tools.get(name)]).filter(([, definition]) => definition !== void 0).map(([name, definition]) => `${name}:${definitionId(definition)}`).sort().join(",");
	function registerRestriction(agent) {
		const deny = cangzhiTools.filter((name) => tools.get(name) !== void 0);
		return deny.length === 0 ? () => {} : agent.ctx.tools.restrict({ deny });
	}
	function registerOverrides(agent) {
		const disposers = [];
		try {
			for (const name of cangzhiTools) {
				const global = tools.get(name);
				if (global === void 0) continue;
				const raw = rawToolName(name);
				const timeoutMs = global.timeoutMs ?? 12e4;
				const def = {
					name: global.name,
					description: global.description,
					parameters: global.parameters,
					output: global.output,
					timeoutMs,
					...typeof global.presentCall === "function" ? { presentCall: global.presentCall } : {},
					...typeof global.presentResult === "function" ? { presentResult: global.presentResult } : {},
					...typeof global.isConcurrencySafe === "function" ? { isConcurrencySafe: global.isConcurrencySafe } : {},
					execute: async (args, exec) => {
						const sessionId = exec?.agent?.id;
						if (sessionId === void 0) throw new Error("cangzhi: 无法确定执行会话，拒绝降级到进程级知识空间");
						const { workspace } = resolveWorkspace(store, sessionId, {
							parentOf,
							defaultWorkspace
						});
						return invokeCangzhiMcp({
							internalMcpBaseUrl,
							workspace,
							rawName: raw,
							args,
							signal: exec.signal,
							timeoutMs,
							fetch: fetchImpl
						});
					}
				};
				disposers.push(agent.ctx.tools.register(def));
			}
		} catch (error) {
			for (const dispose of disposers.reverse()) dispose();
			throw error;
		}
		return {
			count: disposers.length,
			dispose: () => {
				for (const d of disposers) d();
			}
		};
	}
	function syncSession(agent) {
		const id = agent.id;
		const prev = entries.get(id);
		const { policy } = resolvePolicy(store, id, { parentOf });
		if (prev !== void 0 && prev.policy === policy) {
			if (policy === "on" && !prev.overridesActive) try {
				const r = registerOverrides(agent);
				prev.overridesActive = r.count > 0;
				prev.disposeOverrides = r.dispose;
			} catch (error) {
				log(`cangzhi: register overrides failed for ${String(id)}: ${String(error)}`);
			}
			return;
		}
		prev?.dispose?.();
		const entry = {
			id,
			agent,
			policy,
			overridesActive: false
		};
		entry.disposeRestriction = registerRestriction(agent);
		if (policy === "on") try {
			const r = registerOverrides(agent);
			entry.overridesActive = r.count > 0;
			entry.disposeOverrides = r.dispose;
		} catch (error) {
			log(`cangzhi: register overrides failed for ${String(id)}: ${String(error)}`);
		}
		else entry.disposePrompt = agent.ctx.systemPrompt.section({
			name: "integration:cangzhi",
			order: 155,
			text: ""
		});
		entry.dispose = () => {
			entry.disposePrompt?.();
			entry.disposeRestriction?.();
			entry.disposeOverrides?.();
		};
		entries.set(id, entry);
	}
	/** Re-point one session's fail-closed mask and optional overrides. */
	function resyncEntry(entry, agent) {
		entry.disposeOverrides?.();
		entry.disposeOverrides = void 0;
		entry.overridesActive = false;
		entry.disposeRestriction?.();
		entry.disposeRestriction = registerRestriction(agent);
		if (entry.policy !== "on") return;
		try {
			const r = registerOverrides(agent);
			entry.disposeOverrides = r.dispose;
			entry.overridesActive = r.count > 0;
		} catch (error) {
			log(`cangzhi: resync overrides failed for ${String(agent.id)}: ${String(error)}`);
		}
	}
	/** Called on every `tools/change`; only reacts when the cangzhi set changed. */
	function onToolsChange() {
		const sig = cangzhiSignature();
		if (sig === lastSignature) return;
		lastSignature = sig;
		for (const agent of agentsFacade.list()) {
			const entry = entries.get(agent.id);
			if (entry === void 0) continue;
			resyncEntry(entry, agent);
		}
	}
	function onAgentCreated(agent) {
		onToolsChange();
		syncSession(agent);
	}
	function onAgentDisposed(agent) {
		entries.get(agent.id)?.dispose?.();
		entries.delete(agent.id);
	}
	function setWorkspace(id, slug) {
		if (slug === void 0 || slug === null) return Promise.resolve(store.setWorkspace(id, "")).then(() => true);
		if (typeof slug !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) return Promise.resolve(false);
		return Promise.resolve(store.setWorkspace(id, slug)).then(() => true);
	}
	function setPolicy(id, policy) {
		const normalized = policy === "off" ? "off" : policy === "on" ? "on" : void 0;
		if (normalized === void 0) return Promise.resolve(false);
		return Promise.resolve(store.setPolicy(id, normalized)).then(() => {
			const agent = agentsFacade.get(id);
			if (agent !== void 0) syncSession(agent);
			for (const candidate of agentsFacade.list()) syncSession(candidate);
			return true;
		});
	}
	function resolveWorkspaceFor(id) {
		return resolveWorkspace(store, id, {
			parentOf,
			defaultWorkspace
		});
	}
	function resolvePolicyFor(id) {
		return resolvePolicy(store, id, { parentOf });
	}
	/** Snapshot live sessions with resolved workspace/policy for diagnostics/status. */
	function snapshot() {
		const out = {};
		for (const [id, entry] of entries) {
			const ws = resolveWorkspace(store, id, {
				parentOf,
				defaultWorkspace
			});
			const pol = entry.policy;
			out[id] = {
				policy: pol,
				defaultedPolicy: pol === "on",
				workspace: ws.workspace,
				bound: ws.bound,
				overridesActive: entry.overridesActive
			};
		}
		return out;
	}
	function disposeAll() {
		for (const entry of entries.values()) entry.dispose?.();
		entries.clear();
	}
	return {
		onAgentCreated,
		onAgentDisposed,
		onToolsChange,
		setWorkspace,
		setPolicy,
		resolveWorkspaceFor,
		resolvePolicyFor,
		snapshot,
		disposeAll
	};
}
//#endregion
//#region src/host/storage-open.mjs
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
const UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/;
var DomainValidationError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "DomainValidationError";
	}
};
/**
* Declare one table. Mirrors `@deepseek-ai/dsh-storage-domain`'s
* `domainTable`: a plain `{ valueSchema }` handle. DSH reads `valueSchema.parse`
* when validating records on open, so the schema must expose that method.
* @param {object} schema - valueSchema with a Zod-compatible `parse` method.
* @returns {{ valueSchema: object }}
*/
function domainTable(schema) {
	if (schema === null || typeof schema !== "object" || typeof schema.parse !== "function") throw new DomainValidationError("domainTable: schema must expose a parse() method");
	return { valueSchema: schema };
}
/**
* Validate a domain spec and return it (the upstream helper is an identity
* function over a validated object; the literal-type narrowing it provides in
* TypeScript is a compile-time hint, not a runtime contract).
* @param {object} spec - candidate domain spec.
* @returns {object} the same spec, validated.
*/
function defineDomain(spec) {
	if (spec === null || typeof spec !== "object" || Array.isArray(spec)) throw new DomainValidationError("defineDomain: spec must be a non-array object");
	if (typeof spec.name !== "string" || !UNIT_NAME_RE.test(spec.name)) throw new DomainValidationError(`domain name '${String(spec.name)}' must match ${UNIT_NAME_RE.toString()}`);
	if (!Number.isInteger(spec.version) || spec.version < 0) throw new DomainValidationError(`domain '${spec.name}' version must be a non-negative integer, got ${String(spec.version)}`);
	if (spec.layout !== void 0 && spec.layout !== "single" && spec.layout !== "per-record") throw new DomainValidationError(`domain '${spec.name}' layout must be 'single' or 'per-record', got '${String(spec.layout)}'`);
	if (spec.tables === null || typeof spec.tables !== "object" || Array.isArray(spec.tables)) throw new DomainValidationError(`domain '${spec.name}' tables must be a non-array object`);
	for (const table of Object.keys(spec.tables)) if (!UNIT_NAME_RE.test(table)) throw new DomainValidationError(`domain '${spec.name}' table name '${table}' must match ${UNIT_NAME_RE.toString()}`);
	if (spec.global !== void 0) {
		if (spec.global === null || typeof spec.global !== "object" || typeof spec.global.schema?.safeParse !== "function") throw new DomainValidationError(`domain '${spec.name}' global.schema must be a Zod-like schema with safeParse()`);
		if (spec.global.schema.safeParse(null).success === true) throw new DomainValidationError(`domain '${spec.name}' global schema must not accept null: null is the medium's 'never written' sentinel, so a stored null could not round-trip`);
	}
	return spec;
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
			_kind: "string",
			safeParse(value) {
				if (typeof value === "string") return {
					success: true,
					data: value
				};
				return {
					success: false,
					error: /* @__PURE__ */ new Error(`expected string, got ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
				};
			},
			parse(value) {
				const result = schema.safeParse(value);
				if (result.success === true) return result.data;
				throw result.error;
			}
		};
		return Object.freeze(schema);
	},
	enum(values) {
		if (!Array.isArray(values) || values.length === 0) throw new DomainValidationError("z.enum: values must be a non-empty array");
		const set = new Set(values);
		const schema = {
			_kind: "enum",
			options: values.slice(),
			safeParse(value) {
				if (typeof value === "string" && set.has(value)) return {
					success: true,
					data: value
				};
				return {
					success: false,
					error: /* @__PURE__ */ new Error(`expected one of [${values.join(", ")}], got ${typeof value === "string" ? JSON.stringify(value) : String(value)}`)
				};
			},
			parse(value) {
				const result = schema.safeParse(value);
				if (result.success === true) return result.data;
				throw result.error;
			}
		};
		return Object.freeze(schema);
	}
};
/** Domain name; must match the storage `UNIT_NAME_RE`. */
const SESSION_STATE_DOMAIN_NAME = "cangzhi_session";
/**
* Declare the Cangzhi per-session state domain: an explicit workspace pin per
* session and an explicit capability policy pin per session. Absence of a pin
* is resolution (inherit parent / process default), never an error.
*/
function sessionStateDomainSpec() {
	return defineDomain({
		name: SESSION_STATE_DOMAIN_NAME,
		version: 1,
		layout: "per-record",
		tables: {
			workspaces: domainTable(z.string()),
			policies: domainTable(z.enum(["on", "off"]))
		}
	});
}
//#endregion
//#region src/index.ts
const name = "cangzhi";
const inject = [
	"systemPrompt",
	"tools",
	"webServer",
	"connection",
	"credentials",
	"settings",
	"agents"
];
const TOKEN_REF = "CANGZHI_TOKEN";
const WEB_ROUTE_PREFIX = "/_cangzhi";
const API_ROUTE_PREFIX = "/_dsh-cangzhi-api";
const CONTROL_ROUTE_PREFIX = "/_cangzhi-plugin";
const DEFAULT_MCP_PORT = 3081;
const WORKSPACE_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SETTINGS_NAMESPACE = "cangzhi";
const ConnectionSettingsSchema = Schema.object({
	apiUrl: Schema.string(),
	webUrl: Schema.string(),
	defaultWorkspace: Schema.string()
});
function upstreamUrl(value, name) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`${name} must be an absolute http(s) URL`);
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`${name} must use http or https`);
	if (url.username !== "" || url.password !== "") throw new Error(`${name} must not contain credentials`);
	url.hash = "";
	url.search = "";
	return url.toString();
}
function mcpPort(value) {
	const port = value ?? DEFAULT_MCP_PORT;
	if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("internalMcpPort must be an integer between 1024 and 65535");
	return port;
}
function apiEndpoint(apiUrl, path) {
	const target = new URL(apiUrl);
	target.pathname = `${target.pathname.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
	return target;
}
function normalizeConnectionSettings(value) {
	const defaultWorkspace = value.defaultWorkspace.trim().toLowerCase();
	if (!WORKSPACE_SLUG.test(defaultWorkspace)) throw new Error("defaultWorkspace is not a valid Cangzhi workspace slug");
	return {
		apiUrl: upstreamUrl(value.apiUrl, "apiUrl"),
		webUrl: upstreamUrl(value.webUrl, "webUrl"),
		defaultWorkspace
	};
}
function resolveConnectionSettings(config, stored, locks) {
	return normalizeConnectionSettings({
		apiUrl: locks.apiUrl ? config.apiUrl : stored.apiUrl,
		webUrl: locks.webUrl ? config.webUrl : stored.webUrl,
		defaultWorkspace: locks.defaultWorkspace ? config.defaultWorkspace ?? "default" : stored.defaultWorkspace
	});
}
function connectionSettingsEqual(left, right) {
	return left.apiUrl === right.apiUrl && left.webUrl === right.webUrl && left.defaultWorkspace === right.defaultWorkspace;
}
function settingsStatus(scope, active, config, locks) {
	const configured = resolveConnectionSettings(config, scope.get(), locks);
	return {
		active,
		configured,
		locks,
		restartRequired: !connectionSettingsEqual(active, configured)
	};
}
async function jsonBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buffer.length;
		if (size > 16384) throw new Error("request body is too large");
		chunks.push(buffer);
	}
	const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("invalid JSON object");
	return value;
}
const GUIDANCE = `Cangzhi is connected as the read-only knowledge system named cangzhi.
Use its mcp__cangzhi__knowledge_* tools whenever the user asks to find, inspect, compare, cite, or answer from their knowledge base.
Prefer knowledge_search for retrieval, knowledge_ask for a synthesized answer with citations, and the dataset schema/preview/query tools for structured data.
Never invent document ids, chunk ids, dataset ids, scope names, evidence, or citations. Discover them with list/search tools first, preserve returned citation metadata, and say clearly when Cangzhi is unavailable or has no supporting result.
The Cangzhi button in the DSH sidebar opens a native DSH knowledge workspace for uploads, documents, categories, spaces and processing maintenance.
The active Cangzhi workspace for this conversation is chosen in the Cangzhi workspace selector and is used by every model tool in this conversation. Never claim to search another workspace unless the user switches it for this conversation first.`;
function validSessionId(value) {
	return typeof value === "string" && value.length > 0 && value.length <= 256;
}
async function openPersistentStore(ctx) {
	const storage = ctx.get("storage");
	if (storage === void 0 || typeof storage.domain?.open !== "function") {
		ctx.logger.warn("cangzhi: DSH storage hub is unavailable; per-session state will not survive a Host restart");
		return {
			store: createMemoryStore(),
			persistence: "memory"
		};
	}
	try {
		const domain = await storage.domain.open(sessionStateDomainSpec());
		if (typeof domain.table !== "function" || typeof domain.close !== "function") throw new Error("opened storage domain is missing the table()/close() surface");
		return {
			store: createDomainStore({
				workspaces: domain.table("workspaces"),
				policies: domain.table("policies")
			}),
			persistence: "domain",
			close: () => domain.close()
		};
	} catch (error) {
		ctx.logger.warn(`cangzhi: storage-domain unavailable, using in-memory session state (will not survive restart): ${String(error)}`);
		return {
			store: createMemoryStore(),
			persistence: "memory"
		};
	}
}
async function apply(ctx, config) {
	const baseSettings = normalizeConnectionSettings({
		apiUrl: config.apiUrl,
		webUrl: config.webUrl,
		defaultWorkspace: config.defaultWorkspace ?? "default"
	});
	const locks = {
		apiUrl: config.lockApiUrl ?? false,
		webUrl: config.lockWebUrl ?? false,
		defaultWorkspace: config.lockDefaultWorkspace ?? false
	};
	const connectionSettings = ctx.settings.register(SETTINGS_NAMESPACE, ConnectionSettingsSchema, {
		base: baseSettings,
		applies: "restart",
		validate: (value) => {
			normalizeConnectionSettings(value);
		}
	});
	const activeConnection = resolveConnectionSettings(config, connectionSettings.get(), locks);
	const webUrl = activeConnection.webUrl;
	const apiUrl = activeConnection.apiUrl;
	const internalMcpPort = mcpPort(config.internalMcpPort);
	let activeWorkspaceSlug = activeConnection.defaultWorkspace;
	const webProxy = createProxyHandler(webUrl, { allowFrames: true });
	const apiProxy = createProxyHandler(apiUrl, {
		stripPrefix: API_ROUTE_PREFIX,
		upstreamPrefix: "/api"
	});
	const mcpProxy = createProxyHandler(apiUrl, { headers: async (req) => {
		const resolved = await ctx.credentials.resolve(TOKEN_REF);
		if (resolved === void 0) throw new Error("CANGZHI_TOKEN is not configured");
		const headers = { authorization: `Bearer ${resolved.value}` };
		const raw = req.headers["x-cangzhi-workspace"];
		const candidate = Array.isArray(raw) ? raw[0] : raw;
		if (typeof candidate === "string" && candidate.length > 0) {
			if (!WORKSPACE_SLUG.test(candidate)) throw new Error(`x-cangzhi-workspace header is not a valid workspace slug: ${candidate}`);
			headers["x-cangzhi-workspace"] = candidate;
		} else headers["x-cangzhi-workspace"] = activeWorkspaceSlug;
		return headers;
	} });
	const mcpServer = createServer((req, res) => {
		mcpProxy(req, res).catch((error) => {
			if (res.headersSent) {
				res.destroy();
				return;
			}
			res.writeHead(503, {
				"content-type": "application/json; charset=utf-8",
				"retry-after": "5"
			});
			res.end(JSON.stringify({
				error: "cangzhi_mcp_not_configured",
				message: error instanceof Error ? error.message : String(error)
			}));
		});
	});
	await new Promise((resolve, reject) => {
		mcpServer.once("error", reject);
		mcpServer.listen(internalMcpPort, "127.0.0.1", () => {
			mcpServer.off("error", reject);
			resolve();
		});
	});
	ctx.effect(() => () => new Promise((resolve) => {
		mcpServer.close(() => resolve());
	}), "cangzhi internal mcp proxy");
	ctx.systemPrompt.section({
		name: "integration:cangzhi",
		order: 155,
		text: GUIDANCE
	});
	const { store, persistence, close: closeStore } = await openPersistentStore(ctx);
	if (closeStore !== void 0) ctx.effect(() => () => void closeStore(), "cangzhi session state domain close");
	const internalMcpBaseUrl = `http://127.0.0.1:${internalMcpPort}`;
	const agentsFacade = {
		get: (id) => ctx.agents.get(id),
		list: () => ctx.agents.list()
	};
	const manager = createSessionManager({
		store,
		defaultWorkspace: activeWorkspaceSlug,
		internalMcpBaseUrl,
		agentsFacade,
		tools: ctx.tools,
		log: (message) => ctx.logger.warn(message)
	});
	ctx.on("agent/created", (payload) => manager.onAgentCreated(payload.agent));
	ctx.on("agent/disposed", (payload) => manager.onAgentDisposed(payload.agent));
	ctx.on("tools/change", () => manager.onToolsChange());
	ctx.effect(() => () => manager.disposeAll(), "cangzhi session knowledge state cleanup");
	for (const live of ctx.agents.list()) manager.onAgentCreated(live);
	manager.onToolsChange();
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: WEB_ROUTE_PREFIX,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection, { "cache-control": "no-store" });
				res.end(rejection === 401 ? "unauthorized" : "forbidden");
				return;
			}
			webProxy(req, res);
		}
	}), `cangzhi gateway: ${WEB_ROUTE_PREFIX}`);
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: API_ROUTE_PREFIX,
		handler: async (req, res) => {
			try {
				const rejection = ctx.connection.requestRejection(req);
				if (rejection !== void 0) {
					res.writeHead(rejection, { "cache-control": "no-store" });
					res.end(rejection === 401 ? "unauthorized" : "forbidden");
					return;
				}
				await apiProxy(req, res);
			} catch (error) {
				res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
				res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
			}
		}
	}), `cangzhi api gateway: ${API_ROUTE_PREFIX}`);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/status`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection, { "cache-control": "no-store" });
				res.end(rejection === 401 ? "unauthorized" : "forbidden");
				return;
			}
			res.writeHead(200, {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store"
			});
			const credential = await ctx.credentials.describe(TOKEN_REF);
			res.end(JSON.stringify({
				apiConnected: true,
				mcpConfigured: credential.configured,
				toolCount: CANGZHI_TOOLS.length,
				activeWorkspace: activeWorkspaceSlug,
				sessionIsolation: true,
				persistence,
				connectionSettings: settingsStatus(connectionSettings, activeConnection, config, locks)
			}));
		}
	}), "cangzhi plugin status");
	const badRequest = (res, message) => {
		res.writeHead(400, {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify({ error: message }));
	};
	const writeJson = (res, value) => {
		res.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify(value));
	};
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/workspace`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection);
				res.end();
				return;
			}
			if (req.method === "GET") {
				const sessionId = new URL(req.url ?? "/", "http://localhost").searchParams.get("sessionId") ?? "";
				if (!validSessionId(sessionId)) {
					badRequest(res, "会话标识无效：workspace 查询必须显式携带 sessionId");
					return;
				}
				const resolved = manager.resolveWorkspaceFor(sessionId);
				const policy = manager.resolvePolicyFor(sessionId);
				writeJson(res, {
					sessionId,
					workspace: resolved.workspace,
					bound: resolved.bound,
					degraded: !resolved.bound,
					policy: policy.policy,
					persistence
				});
				return;
			}
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "GET, POST" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
				const processDefault = body.processDefault === true;
				if (!processDefault && !validSessionId(body.sessionId)) {
					badRequest(res, "请显式携带 sessionId；未绑定会话时不提供进程级空间切换");
					return;
				}
				if (!WORKSPACE_SLUG.test(slug)) throw new Error("知识空间标识格式无效");
				const validationUrl = apiEndpoint(apiUrl, `/api/workspaces/${encodeURIComponent(slug)}`);
				const cookie = req.headers.cookie;
				const validation = await fetch(validationUrl, { headers: cookie === void 0 ? {} : { cookie } });
				if (!validation.ok) throw new Error(`知识空间不可用（HTTP ${String(validation.status)}）`);
				if ((await validation.json()).status !== "active") throw new Error("知识空间已归档");
				if (processDefault) {
					activeWorkspaceSlug = slug;
					res.writeHead(204, { "cache-control": "no-store" });
					res.end();
					return;
				}
				const sessionId = body.sessionId;
				if (!await manager.setWorkspace(sessionId, slug)) throw new Error("知识空间标识无效");
				res.writeHead(204, { "cache-control": "no-store" });
				res.end();
			} catch (error) {
				badRequest(res, error instanceof Error ? error.message : String(error));
			}
		}
	}), "cangzhi workspace selection");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/session-policy`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection);
				res.end();
				return;
			}
			if (req.method === "GET") {
				const sessionId = new URL(req.url ?? "/", "http://localhost").searchParams.get("sessionId") ?? "";
				if (!validSessionId(sessionId)) {
					badRequest(res, "会话标识无效");
					return;
				}
				const policy = manager.resolvePolicyFor(sessionId);
				const agent = agentsFacade.get(sessionId);
				writeJson(res, {
					sessionId,
					enabled: policy.policy === "on",
					desired: policy.policy,
					live: agent !== void 0,
					restricted: policy.policy === "off",
					bound: policy.bound
				});
				return;
			}
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "GET, POST" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
				if (!validSessionId(sessionId)) throw new Error("会话标识无效");
				if (typeof body.enabled !== "boolean") throw new Error("enabled 必须是布尔值");
				if (!await manager.setPolicy(sessionId, body.enabled ? "on" : "off")) throw new Error("策略未生效");
				writeJson(res, {
					applied: true,
					sessionId,
					enabled: body.enabled,
					persistence
				});
			} catch (error) {
				badRequest(res, error instanceof Error ? error.message : String(error));
			}
		}
	}), "cangzhi session knowledge policy");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/session-state`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection);
				res.end();
				return;
			}
			if (req.method !== "GET") {
				res.writeHead(405, { allow: "GET" });
				res.end();
				return;
			}
			const sessionId = (new URL(req.url ?? "/", "http://localhost").searchParams.get("sessionId") ?? "").trim();
			if (!validSessionId(sessionId)) {
				badRequest(res, "会话标识无效");
				return;
			}
			const ws = manager.resolveWorkspaceFor(sessionId);
			const pol = manager.resolvePolicyFor(sessionId);
			writeJson(res, {
				sessionId,
				workspace: ws.workspace,
				workspaceBound: ws.bound,
				policy: pol.policy,
				policyBound: pol.bound,
				degraded: !ws.bound,
				live: agentsFacade.get(sessionId) !== void 0,
				persistence
			});
		}
	}), "cangzhi session state");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/token`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection);
				res.end();
				return;
			}
			if (req.method === "DELETE") {
				try {
					await ctx.credentials.unset(TOKEN_REF);
					res.writeHead(204, { "cache-control": "no-store" });
					res.end();
				} catch (error) {
					badRequest(res, error instanceof Error ? error.message : String(error));
				}
				return;
			}
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "POST, DELETE" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const token = typeof body.token === "string" ? body.token.trim() : "";
				if (token.length < 20 || token.length > 4096) throw new Error("访问令牌格式无效");
				const validationUrl = apiEndpoint(apiUrl, "/api/v1/knowledge/scopes");
				const validation = await fetch(validationUrl, { headers: {
					authorization: `Bearer ${token}`,
					"x-cangzhi-workspace": activeWorkspaceSlug
				} });
				if (!validation.ok) throw new Error(`藏知拒绝了访问令牌（HTTP ${String(validation.status)}）`);
				await ctx.credentials.set(TOKEN_REF, token);
				res.writeHead(204, { "cache-control": "no-store" });
				res.end();
			} catch (error) {
				badRequest(res, error instanceof Error ? error.message : String(error));
			}
		}
	}), "cangzhi token setup");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${CONTROL_ROUTE_PREFIX}/settings/test`,
		handler: async (req, res) => {
			const rejection = ctx.connection.requestRejection(req);
			if (rejection !== void 0) {
				res.writeHead(rejection);
				res.end();
				return;
			}
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "POST" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const current = connectionSettings.get();
				const candidate = resolveConnectionSettings(config, {
					apiUrl: typeof body.apiUrl === "string" ? body.apiUrl : current.apiUrl,
					webUrl: typeof body.webUrl === "string" ? body.webUrl : current.webUrl,
					defaultWorkspace: typeof body.defaultWorkspace === "string" ? body.defaultWorkspace : current.defaultWorkspace
				}, locks);
				const readinessUrl = apiEndpoint(candidate.apiUrl, "/api/readiness");
				const readiness = await fetch(readinessUrl, { signal: AbortSignal.timeout(5e3) });
				if (!readiness.ok) throw new Error(`藏知 API readiness 返回 HTTP ${String(readiness.status)}`);
				writeJson(res, {
					ok: true,
					apiUrl: candidate.apiUrl
				});
			} catch (error) {
				badRequest(res, error instanceof Error ? error.message : String(error));
			}
		}
	}), "cangzhi connection settings test");
}
//#endregion
export { apply, inject, name };
