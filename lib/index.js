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
//#region src/index.ts
const name = "cangzhi";
const inject = [
	"systemPrompt",
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
const CANGZHI_TOOLS = [
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
];
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
The active Cangzhi workspace selected in the UI is also the workspace used by every model tool. Never claim to search another workspace unless the user switches it in the Cangzhi workspace selector first.`;
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
	const mcpProxy = createProxyHandler(apiUrl, { headers: async () => {
		const resolved = await ctx.credentials.resolve(TOKEN_REF);
		if (resolved === void 0) throw new Error("CANGZHI_TOKEN is not configured");
		return {
			authorization: `Bearer ${resolved.value}`,
			"x-cangzhi-workspace": activeWorkspaceSlug
		};
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
	const sessionPolicies = /* @__PURE__ */ new Map();
	const desiredPolicies = /* @__PURE__ */ new Map();
	const applySessionPolicy = (agent, enabled) => {
		const previous = sessionPolicies.get(agent.id);
		previous?.disposePrompt();
		previous?.disposeRestriction();
		if (enabled) {
			sessionPolicies.delete(agent.id);
			return;
		}
		const disposePrompt = agent.ctx.systemPrompt.section({
			name: "integration:cangzhi",
			order: 155,
			text: ""
		});
		const disposeRestriction = agent.ctx.tools.restrict({ deny: [...CANGZHI_TOOLS] });
		sessionPolicies.set(agent.id, {
			disposePrompt,
			disposeRestriction
		});
	};
	ctx.on("agent/created", ({ agent }) => {
		const parentId = agent.session.header.parentSession;
		const enabled = desiredPolicies.get(agent.id) ?? (parentId !== void 0 && desiredPolicies.get(parentId) === false ? false : true);
		desiredPolicies.set(agent.id, enabled);
		applySessionPolicy(agent, enabled);
	});
	ctx.on("agent/disposed", ({ agent }) => {
		const policy = sessionPolicies.get(agent.id);
		policy?.disposePrompt();
		policy?.disposeRestriction();
		sessionPolicies.delete(agent.id);
	});
	ctx.effect(() => () => {
		for (const policy of sessionPolicies.values()) {
			policy.disposePrompt();
			policy.disposeRestriction();
		}
		sessionPolicies.clear();
		desiredPolicies.clear();
	}, "cangzhi session knowledge policy cleanup");
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
				toolCount: 14,
				activeWorkspace: activeWorkspaceSlug,
				connectionSettings: settingsStatus(connectionSettings, activeConnection, config, locks)
			}));
		}
	}), "cangzhi plugin status");
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
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "POST" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
				if (!WORKSPACE_SLUG.test(slug)) throw new Error("知识空间标识格式无效");
				const validationUrl = apiEndpoint(apiUrl, `/api/workspaces/${encodeURIComponent(slug)}`);
				const cookie = req.headers.cookie;
				const validation = await fetch(validationUrl, { headers: cookie === void 0 ? {} : { cookie } });
				if (!validation.ok) throw new Error(`知识空间不可用（HTTP ${String(validation.status)}）`);
				if ((await validation.json()).status !== "active") throw new Error("知识空间已归档");
				activeWorkspaceSlug = slug;
				res.writeHead(204, { "cache-control": "no-store" });
				res.end();
			} catch (error) {
				res.writeHead(400, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store"
				});
				res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
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
			if (req.method !== "POST") {
				res.writeHead(405, { allow: "POST" });
				res.end();
				return;
			}
			try {
				const body = await jsonBody(req);
				const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
				if (sessionId.length === 0 || sessionId.length > 256) throw new Error("会话标识无效");
				if (typeof body.enabled !== "boolean") throw new Error("enabled 必须是布尔值");
				desiredPolicies.set(sessionId, body.enabled);
				const agent = ctx.agents.get(sessionId);
				if (agent !== void 0) applySessionPolicy(agent, body.enabled);
				res.writeHead(204, { "cache-control": "no-store" });
				res.end();
			} catch (error) {
				res.writeHead(400, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store"
				});
				res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
			}
		}
	}), "cangzhi session knowledge policy");
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
					res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
					res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
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
				res.writeHead(400, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store"
				});
				res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
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
				res.writeHead(200, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store"
				});
				res.end(JSON.stringify({
					ok: true,
					apiUrl: candidate.apiUrl
				}));
			} catch (error) {
				res.writeHead(400, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store"
				});
				res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
			}
		}
	}), "cangzhi connection settings test");
}
//#endregion
export { apply, inject, name };
