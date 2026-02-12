var __create = Object.create;
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __template = (cooked, raw2) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw2 || cooked.slice()) }));

// src/storage/memory.ts
var memory_exports = {};
__export(memory_exports, {
  MemoryStorage: () => MemoryStorage,
  memoryStorage: () => memoryStorage
});
var MemoryStorage, memoryStorage;
var init_memory = __esm({
  "src/storage/memory.ts"() {
    "use strict";
    MemoryStorage = class {
      store = /* @__PURE__ */ new Map();
      async get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expireAt && Date.now() > entry.expireAt) {
          this.store.delete(key);
          return null;
        }
        return entry.value;
      }
      async set(key, value, options) {
        const entry = { value };
        if (options?.ttl) {
          entry.expireAt = Date.now() + options.ttl * 1e3;
        }
        this.store.set(key, entry);
      }
      async delete(key) {
        this.store.delete(key);
      }
      async list(prefix) {
        const keys = [];
        for (const key of this.store.keys()) {
          if (key.startsWith(prefix)) {
            keys.push(key);
          }
        }
        return keys;
      }
      // 用于测试：清空所有数据
      clear() {
        this.store.clear();
      }
    };
    memoryStorage = new MemoryStorage();
  }
});

// src/storage/kv.ts
var kv_exports = {};
__export(kv_exports, {
  KVStorage: () => KVStorage
});
var KVStorage;
var init_kv = __esm({
  "src/storage/kv.ts"() {
    "use strict";
    KVStorage = class {
      constructor(kv) {
        this.kv = kv;
      }
      async get(key) {
        const value = await this.kv.get(key, { type: "json" });
        return value;
      }
      async set(key, value, options) {
        await this.kv.put(key, JSON.stringify(value), {
          expirationTtl: options?.ttl
        });
      }
      async delete(key) {
        await this.kv.delete(key);
      }
      async list(prefix) {
        const result = await this.kv.list({ prefix });
        return result.keys.map((k) => k.name);
      }
    };
  }
});

// src/storage.ts
var STORAGE_KEYS;
var init_storage = __esm({
  "src/storage.ts"() {
    "use strict";
    STORAGE_KEYS = {
      SYNC_RESULT: "sync:result",
      SYNC_LOGS: "sync:logs",
      USERS_PREFIX: "user:",
      USERS_LIST: "users:list",
      AUTO_SYNC_CONFIG: "config:auto_sync",
      // 自动同步配置
      SUBSTORE_CONFIG: "config:substore"
      // Sub-Store 配置
    };
  }
});

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default, isCryptoKey;
var init_webcrypto = __esm({
  "node_modules/jose/dist/browser/runtime/webcrypto.js"() {
    webcrypto_default = crypto;
    isCryptoKey = (key) => key instanceof CryptoKey;
  }
});

// node_modules/jose/dist/browser/lib/buffer_utils.js
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
var encoder, decoder, MAX_INT32;
var init_buffer_utils = __esm({
  "node_modules/jose/dist/browser/lib/buffer_utils.js"() {
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
  }
});

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64, encode, decodeBase64, decode;
var init_base64url = __esm({
  "node_modules/jose/dist/browser/runtime/base64url.js"() {
    init_buffer_utils();
    encodeBase64 = (input) => {
      let unencoded = input;
      if (typeof unencoded === "string") {
        unencoded = encoder.encode(unencoded);
      }
      const CHUNK_SIZE = 32768;
      const arr = [];
      for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
      }
      return btoa(arr.join(""));
    };
    encode = (input) => {
      return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    };
    decodeBase64 = (encoded) => {
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    };
    decode = (input) => {
      let encoded = input;
      if (encoded instanceof Uint8Array) {
        encoded = decoder.decode(encoded);
      }
      encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
      try {
        return decodeBase64(encoded);
      } catch {
        throw new TypeError("The input to be decoded is not correctly encoded.");
      }
    };
  }
});

// node_modules/jose/dist/browser/util/errors.js
var JOSEError, JWTClaimValidationFailed, JWTExpired, JOSEAlgNotAllowed, JOSENotSupported, JWEDecryptionFailed, JWEInvalid, JWSInvalid, JWTInvalid, JWKInvalid, JWKSInvalid, JWKSNoMatchingKey, JWKSMultipleMatchingKeys, JWKSTimeout, JWSSignatureVerificationFailed;
var init_errors = __esm({
  "node_modules/jose/dist/browser/util/errors.js"() {
    JOSEError = class extends Error {
      constructor(message2, options) {
        super(message2, options);
        this.code = "ERR_JOSE_GENERIC";
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
      }
    };
    JOSEError.code = "ERR_JOSE_GENERIC";
    JWTClaimValidationFailed = class extends JOSEError {
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    JWTExpired = class extends JOSEError {
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.code = "ERR_JWT_EXPIRED";
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTExpired.code = "ERR_JWT_EXPIRED";
    JOSEAlgNotAllowed = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
    };
    JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
    JOSENotSupported = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JOSE_NOT_SUPPORTED";
      }
    };
    JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
    JWEDecryptionFailed = class extends JOSEError {
      constructor(message2 = "decryption operation failed", options) {
        super(message2, options);
        this.code = "ERR_JWE_DECRYPTION_FAILED";
      }
    };
    JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
    JWEInvalid = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JWE_INVALID";
      }
    };
    JWEInvalid.code = "ERR_JWE_INVALID";
    JWSInvalid = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JWS_INVALID";
      }
    };
    JWSInvalid.code = "ERR_JWS_INVALID";
    JWTInvalid = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JWT_INVALID";
      }
    };
    JWTInvalid.code = "ERR_JWT_INVALID";
    JWKInvalid = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JWK_INVALID";
      }
    };
    JWKInvalid.code = "ERR_JWK_INVALID";
    JWKSInvalid = class extends JOSEError {
      constructor() {
        super(...arguments);
        this.code = "ERR_JWKS_INVALID";
      }
    };
    JWKSInvalid.code = "ERR_JWKS_INVALID";
    JWKSNoMatchingKey = class extends JOSEError {
      constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
        super(message2, options);
        this.code = "ERR_JWKS_NO_MATCHING_KEY";
      }
    };
    JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
    JWKSMultipleMatchingKeys = class extends JOSEError {
      constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
        super(message2, options);
        this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
      }
    };
    JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
    JWKSTimeout = class extends JOSEError {
      constructor(message2 = "request timed out", options) {
        super(message2, options);
        this.code = "ERR_JWKS_TIMEOUT";
      }
    };
    JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
    JWSSignatureVerificationFailed = class extends JOSEError {
      constructor(message2 = "signature verification failed", options) {
        super(message2, options);
        this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      }
    };
    JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
});

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
var init_crypto_key = __esm({
  "node_modules/jose/dist/browser/lib/crypto_key.js"() {
  }
});

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
var invalid_key_input_default;
var init_invalid_key_input = __esm({
  "node_modules/jose/dist/browser/lib/invalid_key_input.js"() {
    invalid_key_input_default = (actual, ...types2) => {
      return message("Key must be ", actual, ...types2);
    };
  }
});

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default, types;
var init_is_key_like = __esm({
  "node_modules/jose/dist/browser/runtime/is_key_like.js"() {
    init_webcrypto();
    is_key_like_default = (key) => {
      if (isCryptoKey(key)) {
        return true;
      }
      return key?.[Symbol.toStringTag] === "KeyObject";
    };
    types = ["CryptoKey"];
  }
});

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint, is_disjoint_default;
var init_is_disjoint = __esm({
  "node_modules/jose/dist/browser/lib/is_disjoint.js"() {
    isDisjoint = (...headers) => {
      const sources = headers.filter(Boolean);
      if (sources.length === 0 || sources.length === 1) {
        return true;
      }
      let acc;
      for (const header of sources) {
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
          acc = new Set(parameters);
          continue;
        }
        for (const parameter of parameters) {
          if (acc.has(parameter)) {
            return false;
          }
          acc.add(parameter);
        }
      }
      return true;
    };
    is_disjoint_default = isDisjoint;
  }
});

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
var init_is_object = __esm({
  "node_modules/jose/dist/browser/lib/is_object.js"() {
  }
});

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default;
var init_check_key_length = __esm({
  "node_modules/jose/dist/browser/runtime/check_key_length.js"() {
    check_key_length_default = (alg, key) => {
      if (alg.startsWith("RS") || alg.startsWith("PS")) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== "number" || modulusLength < 2048) {
          throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
      }
    };
  }
});

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
var init_is_jwk = __esm({
  "node_modules/jose/dist/browser/lib/is_jwk.js"() {
    init_is_object();
  }
});

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
var parse, jwk_to_key_default;
var init_jwk_to_key = __esm({
  "node_modules/jose/dist/browser/runtime/jwk_to_key.js"() {
    init_webcrypto();
    init_errors();
    parse = async (jwk) => {
      if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
      }
      const { algorithm, keyUsages } = subtleMapping(jwk);
      const rest = [
        algorithm,
        jwk.ext ?? false,
        jwk.key_ops ?? keyUsages
      ];
      const keyData = { ...jwk };
      delete keyData.alg;
      delete keyData.use;
      return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
    };
    jwk_to_key_default = parse;
  }
});

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue, privCache, pubCache, isKeyObject, importAndCache, normalizePublicKey, normalizePrivateKey, normalize_key_default;
var init_normalize_key = __esm({
  "node_modules/jose/dist/browser/runtime/normalize_key.js"() {
    init_is_jwk();
    init_base64url();
    init_jwk_to_key();
    exportKeyValue = (k) => decode(k);
    isKeyObject = (key) => {
      return key?.[Symbol.toStringTag] === "KeyObject";
    };
    importAndCache = async (cache, key, jwk, alg, freeze = false) => {
      let cached = cache.get(key);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
      if (freeze)
        Object.freeze(key);
      if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    };
    normalizePublicKey = (key, alg) => {
      if (isKeyObject(key)) {
        let jwk = key.export({ format: "jwk" });
        delete jwk.d;
        delete jwk.dp;
        delete jwk.dq;
        delete jwk.p;
        delete jwk.q;
        delete jwk.qi;
        if (jwk.k) {
          return exportKeyValue(jwk.k);
        }
        pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
        return importAndCache(pubCache, key, jwk, alg);
      }
      if (isJWK(key)) {
        if (key.k)
          return decode(key.k);
        pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
        const cryptoKey = importAndCache(pubCache, key, key, alg, true);
        return cryptoKey;
      }
      return key;
    };
    normalizePrivateKey = (key, alg) => {
      if (isKeyObject(key)) {
        let jwk = key.export({ format: "jwk" });
        if (jwk.k) {
          return exportKeyValue(jwk.k);
        }
        privCache || (privCache = /* @__PURE__ */ new WeakMap());
        return importAndCache(privCache, key, jwk, alg);
      }
      if (isJWK(key)) {
        if (key.k)
          return decode(key.k);
        privCache || (privCache = /* @__PURE__ */ new WeakMap());
        const cryptoKey = importAndCache(privCache, key, key, alg, true);
        return cryptoKey;
      }
      return key;
    };
    normalize_key_default = { normalizePublicKey, normalizePrivateKey };
  }
});

// node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
var init_import = __esm({
  "node_modules/jose/dist/browser/key/import.js"() {
    init_base64url();
    init_jwk_to_key();
    init_errors();
    init_is_object();
  }
});

// node_modules/jose/dist/browser/lib/check_key_type.js
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
var tag, jwkMatchesOp, symmetricTypeCheck, asymmetricTypeCheck, check_key_type_default, checkKeyTypeWithJwk;
var init_check_key_type = __esm({
  "node_modules/jose/dist/browser/lib/check_key_type.js"() {
    init_invalid_key_input();
    init_is_key_like();
    init_is_jwk();
    tag = (key) => key?.[Symbol.toStringTag];
    jwkMatchesOp = (alg, key, usage) => {
      if (key.use !== void 0 && key.use !== "sig") {
        throw new TypeError("Invalid key for this operation, when present its use must be sig");
      }
      if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
        throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
      }
      if (key.alg !== void 0 && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
      }
      return true;
    };
    symmetricTypeCheck = (alg, key, usage, allowJwk) => {
      if (key instanceof Uint8Array)
        return;
      if (allowJwk && isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
      }
      if (!is_key_like_default(key)) {
        throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
      }
      if (key.type !== "secret") {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
      }
    };
    asymmetricTypeCheck = (alg, key, usage, allowJwk) => {
      if (allowJwk && isJWK(key)) {
        switch (usage) {
          case "sign":
            if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation be a private JWK`);
          case "verify":
            if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation be a public JWK`);
        }
      }
      if (!is_key_like_default(key)) {
        throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
      }
      if (key.type === "secret") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
      }
      if (usage === "sign" && key.type === "public") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
      }
      if (usage === "decrypt" && key.type === "public") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
      }
      if (key.algorithm && usage === "verify" && key.type === "private") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
      }
      if (key.algorithm && usage === "encrypt" && key.type === "private") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
      }
    };
    check_key_type_default = checkKeyType.bind(void 0, false);
    checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);
  }
});

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var validate_crit_default;
var init_validate_crit = __esm({
  "node_modules/jose/dist/browser/lib/validate_crit.js"() {
    init_errors();
    validate_crit_default = validateCrit;
  }
});

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms, validate_algorithms_default;
var init_validate_algorithms = __esm({
  "node_modules/jose/dist/browser/lib/validate_algorithms.js"() {
    validateAlgorithms = (option, algorithms) => {
      if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
      }
      if (!algorithms) {
        return void 0;
      }
      return new Set(algorithms);
    };
    validate_algorithms_default = validateAlgorithms;
  }
});

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
var init_subtle_dsa = __esm({
  "node_modules/jose/dist/browser/runtime/subtle_dsa.js"() {
    init_errors();
  }
});

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
var init_get_sign_verify_key = __esm({
  "node_modules/jose/dist/browser/runtime/get_sign_verify_key.js"() {
    init_webcrypto();
    init_crypto_key();
    init_invalid_key_input();
    init_is_key_like();
    init_normalize_key();
  }
});

// node_modules/jose/dist/browser/runtime/verify.js
var verify, verify_default;
var init_verify = __esm({
  "node_modules/jose/dist/browser/runtime/verify.js"() {
    init_subtle_dsa();
    init_webcrypto();
    init_check_key_length();
    init_get_sign_verify_key();
    verify = async (alg, key, signature, data) => {
      const cryptoKey = await getCryptoKey(alg, key, "verify");
      check_key_length_default(alg, cryptoKey);
      const algorithm = subtleDsa(alg, cryptoKey.algorithm);
      try {
        return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
      } catch {
        return false;
      }
    };
    verify_default = verify;
  }
});

// node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
var init_verify2 = __esm({
  "node_modules/jose/dist/browser/jws/flattened/verify.js"() {
    init_base64url();
    init_verify();
    init_errors();
    init_buffer_utils();
    init_is_disjoint();
    init_is_object();
    init_check_key_type();
    init_validate_crit();
    init_validate_algorithms();
    init_is_jwk();
    init_import();
  }
});

// node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify3 = __esm({
  "node_modules/jose/dist/browser/jws/compact/verify.js"() {
    init_verify2();
    init_errors();
    init_buffer_utils();
  }
});

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default;
var init_epoch = __esm({
  "node_modules/jose/dist/browser/lib/epoch.js"() {
    epoch_default = (date) => Math.floor(date.getTime() / 1e3);
  }
});

// node_modules/jose/dist/browser/lib/secs.js
var minute, hour, day, week, year, REGEX, secs_default;
var init_secs = __esm({
  "node_modules/jose/dist/browser/lib/secs.js"() {
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    year = day * 365.25;
    REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
    secs_default = (str) => {
      const matched = REGEX.exec(str);
      if (!matched || matched[4] && matched[1]) {
        throw new TypeError("Invalid time period format");
      }
      const value = parseFloat(matched[2]);
      const unit = matched[3].toLowerCase();
      let numericDate;
      switch (unit) {
        case "sec":
        case "secs":
        case "second":
        case "seconds":
        case "s":
          numericDate = Math.round(value);
          break;
        case "minute":
        case "minutes":
        case "min":
        case "mins":
        case "m":
          numericDate = Math.round(value * minute);
          break;
        case "hour":
        case "hours":
        case "hr":
        case "hrs":
        case "h":
          numericDate = Math.round(value * hour);
          break;
        case "day":
        case "days":
        case "d":
          numericDate = Math.round(value * day);
          break;
        case "week":
        case "weeks":
        case "w":
          numericDate = Math.round(value * week);
          break;
        default:
          numericDate = Math.round(value * year);
          break;
      }
      if (matched[1] === "-" || matched[4] === "ago") {
        return -numericDate;
      }
      return numericDate;
    };
  }
});

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp, checkAudiencePresence, jwt_claims_set_default;
var init_jwt_claims_set = __esm({
  "node_modules/jose/dist/browser/lib/jwt_claims_set.js"() {
    init_errors();
    init_buffer_utils();
    init_epoch();
    init_secs();
    init_is_object();
    normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, "");
    checkAudiencePresence = (audPayload, audOption) => {
      if (typeof audPayload === "string") {
        return audOption.includes(audPayload);
      }
      if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
      }
      return false;
    };
    jwt_claims_set_default = (protectedHeader, encodedPayload, options = {}) => {
      let payload;
      try {
        payload = JSON.parse(decoder.decode(encodedPayload));
      } catch {
      }
      if (!isObject(payload)) {
        throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
      }
      const { typ } = options;
      if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
      }
      const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
      const presenceCheck = [...requiredClaims];
      if (maxTokenAge !== void 0)
        presenceCheck.push("iat");
      if (audience !== void 0)
        presenceCheck.push("aud");
      if (subject !== void 0)
        presenceCheck.push("sub");
      if (issuer !== void 0)
        presenceCheck.push("iss");
      for (const claim of new Set(presenceCheck.reverse())) {
        if (!(claim in payload)) {
          throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
        }
      }
      if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
        throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
      }
      if (subject && payload.sub !== subject) {
        throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
      }
      if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
        throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
      }
      let tolerance;
      switch (typeof options.clockTolerance) {
        case "string":
          tolerance = secs_default(options.clockTolerance);
          break;
        case "number":
          tolerance = options.clockTolerance;
          break;
        case "undefined":
          tolerance = 0;
          break;
        default:
          throw new TypeError("Invalid clockTolerance option type");
      }
      const { currentDate } = options;
      const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
      if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
        throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
      }
      if (payload.nbf !== void 0) {
        if (typeof payload.nbf !== "number") {
          throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
        }
        if (payload.nbf > now + tolerance) {
          throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
        }
      }
      if (payload.exp !== void 0) {
        if (typeof payload.exp !== "number") {
          throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
        }
        if (payload.exp <= now - tolerance) {
          throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
        }
      }
      if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
        if (age - tolerance > max) {
          throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
        }
        if (age < 0 - tolerance) {
          throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
        }
      }
      return payload;
    };
  }
});

// node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify4 = __esm({
  "node_modules/jose/dist/browser/jwt/verify.js"() {
    init_verify3();
    init_jwt_claims_set();
    init_errors();
  }
});

// node_modules/jose/dist/browser/runtime/sign.js
var sign, sign_default;
var init_sign = __esm({
  "node_modules/jose/dist/browser/runtime/sign.js"() {
    init_subtle_dsa();
    init_webcrypto();
    init_check_key_length();
    init_get_sign_verify_key();
    sign = async (alg, key, data) => {
      const cryptoKey = await getCryptoKey(alg, key, "sign");
      check_key_length_default(alg, cryptoKey);
      const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
      return new Uint8Array(signature);
    };
    sign_default = sign;
  }
});

// node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign;
var init_sign2 = __esm({
  "node_modules/jose/dist/browser/jws/flattened/sign.js"() {
    init_base64url();
    init_sign();
    init_is_disjoint();
    init_errors();
    init_buffer_utils();
    init_check_key_type();
    init_validate_crit();
    FlattenedSign = class {
      constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
          throw new TypeError("payload must be an instance of Uint8Array");
        }
        this._payload = payload;
      }
      setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
          throw new TypeError("setProtectedHeader can only be called once");
        }
        this._protectedHeader = protectedHeader;
        return this;
      }
      setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
          throw new TypeError("setUnprotectedHeader can only be called once");
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
      }
      async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
          throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
        }
        if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
          throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
        }
        const joseHeader = {
          ...this._protectedHeader,
          ...this._unprotectedHeader
        };
        const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has("b64")) {
          b64 = this._protectedHeader.b64;
          if (typeof b64 !== "boolean") {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
          }
        }
        const { alg } = joseHeader;
        if (typeof alg !== "string" || !alg) {
          throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        checkKeyTypeWithJwk(alg, key, "sign");
        let payload = this._payload;
        if (b64) {
          payload = encoder.encode(encode(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
          protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
        } else {
          protectedHeader = encoder.encode("");
        }
        const data = concat(protectedHeader, encoder.encode("."), payload);
        const signature = await sign_default(alg, key, data);
        const jws = {
          signature: encode(signature),
          payload: ""
        };
        if (b64) {
          jws.payload = decoder.decode(payload);
        }
        if (this._unprotectedHeader) {
          jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
          jws.protected = decoder.decode(protectedHeader);
        }
        return jws;
      }
    };
  }
});

// node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign;
var init_sign3 = __esm({
  "node_modules/jose/dist/browser/jws/compact/sign.js"() {
    init_sign2();
    CompactSign = class {
      constructor(payload) {
        this._flattened = new FlattenedSign(payload);
      }
      setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
      }
      async sign(key, options) {
        const jws = await this._flattened.sign(key, options);
        if (jws.payload === void 0) {
          throw new TypeError("use the flattened module for creating JWS with b64: false");
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
      }
    };
  }
});

// node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
var ProduceJWT;
var init_produce = __esm({
  "node_modules/jose/dist/browser/jwt/produce.js"() {
    init_epoch();
    init_is_object();
    init_secs();
    ProduceJWT = class {
      constructor(payload = {}) {
        if (!isObject(payload)) {
          throw new TypeError("JWT Claims Set MUST be an object");
        }
        this._payload = payload;
      }
      setIssuer(issuer) {
        this._payload = { ...this._payload, iss: issuer };
        return this;
      }
      setSubject(subject) {
        this._payload = { ...this._payload, sub: subject };
        return this;
      }
      setAudience(audience) {
        this._payload = { ...this._payload, aud: audience };
        return this;
      }
      setJti(jwtId) {
        this._payload = { ...this._payload, jti: jwtId };
        return this;
      }
      setNotBefore(input) {
        if (typeof input === "number") {
          this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
        } else {
          this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
        }
        return this;
      }
      setExpirationTime(input) {
        if (typeof input === "number") {
          this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
        } else {
          this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
        }
        return this;
      }
      setIssuedAt(input) {
        if (typeof input === "undefined") {
          this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
        } else if (typeof input === "string") {
          this._payload = {
            ...this._payload,
            iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
          };
        } else {
          this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
        }
        return this;
      }
    };
  }
});

// node_modules/jose/dist/browser/jwt/sign.js
var SignJWT;
var init_sign4 = __esm({
  "node_modules/jose/dist/browser/jwt/sign.js"() {
    init_sign3();
    init_errors();
    init_buffer_utils();
    init_produce();
    SignJWT = class extends ProduceJWT {
      setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
      }
      async sign(key, options) {
        const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
          throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
        }
        return sig.sign(key, options);
      }
    };
  }
});

// node_modules/jose/dist/browser/util/base64url.js
var init_base64url2 = __esm({
  "node_modules/jose/dist/browser/util/base64url.js"() {
  }
});

// node_modules/jose/dist/browser/index.js
var init_browser = __esm({
  "node_modules/jose/dist/browser/index.js"() {
    init_verify4();
    init_sign4();
    init_errors();
    init_base64url2();
  }
});

// src/auth.ts
var auth_exports = {};
__export(auth_exports, {
  adminMiddleware: () => adminMiddleware,
  authMiddleware: () => authMiddleware,
  generateToken: () => generateToken,
  hashPassword: () => hashPassword,
  login: () => login,
  verifyPassword: () => verifyPassword,
  verifyToken: () => verifyToken
});
async function generateToken(username, isAdmin, secret) {
  const secretKey = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1e3);
  const token = await new SignJWT({
    sub: username,
    isAdmin
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt(now).setExpirationTime(now + 7 * 24 * 60 * 60).sign(secretKey);
  return token;
}
async function verifyToken(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return {
      sub: payload.sub,
      isAdmin: payload.isAdmin,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch {
    return null;
  }
}
async function hashPassword(password) {
  const encoder2 = new TextEncoder();
  const data = encoder2.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, hash) {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}
async function login(username, password, storage, env) {
  if (username === env.ADMIN_USERNAME) {
    if (password === env.ADMIN_PASSWORD) {
      const token2 = await generateToken(username, true, env.AUTH_SECRET);
      return { success: true, token: token2 };
    }
    return { success: false, error: "\u5BC6\u7801\u9519\u8BEF" };
  }
  const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
  if (!user) {
    return { success: false, error: "\u7528\u6237\u4E0D\u5B58\u5728" };
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "\u5BC6\u7801\u9519\u8BEF" };
  }
  user.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
  await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);
  const token = await generateToken(username, user.isAdmin, env.AUTH_SECRET);
  return { success: true, token };
}
function authMiddleware(env) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.json({ error: "\u672A\u767B\u5F55" }, 401);
    }
    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload) {
      return c.json({ error: "Token \u65E0\u6548\u6216\u5DF2\u8FC7\u671F" }, 401);
    }
    c.set("user", payload);
    await next();
  };
}
function adminMiddleware() {
  return async (c, next) => {
    const user = c.get("user");
    if (!user?.isAdmin) {
      return c.json({ error: "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650" }, 403);
    }
    await next();
  };
}
var init_auth = __esm({
  "src/auth.ts"() {
    "use strict";
    init_browser();
    init_storage();
  }
});

// src/scheduler.ts
var scheduler_exports = {};
__export(scheduler_exports, {
  getAutoSyncConfig: () => getAutoSyncConfig,
  setAutoSyncConfig: () => setAutoSyncConfig,
  syncAllUsers: () => syncAllUsers,
  syncUserSubscription: () => syncUserSubscription
});
async function syncUserSubscription(storage, user, baseUrl) {
  if (!user.subscriptionConfig) {
    return { success: false, error: "\u7528\u6237\u672A\u7ED1\u5B9A\u8BA2\u9605" };
  }
  const { collectionName, token } = user.subscriptionConfig;
  const encodedName = encodeURIComponent(collectionName);
  const url = `${baseUrl}/share/col/${encodedName}?token=${token}`;
  console.log(`[Scheduler] \u540C\u6B65\u7528\u6237 ${user.username}\uFF0CURL: ${url}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "SubSync/1.0" },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    let text = await response.text();
    const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) && !text.includes("://") && text.trim().length > 100;
    if (isBase64) {
      try {
        text = atob(text.trim().replace(/\s/g, ""));
      } catch {
      }
    }
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    const validLines = lines.filter(
      (line) => line.startsWith("vless://") || line.startsWith("vmess://") || line.startsWith("trojan://") || line.startsWith("ss://") || line.startsWith("ssr://")
    );
    let earliestExpire = null;
    let totalRemainGB = null;
    for (const line of validLines) {
      const match2 = line.match(/剩余\s*(\d+)\s*天/);
      if (match2) {
        const daysLeft = parseInt(match2[1], 10);
        const expireDate = /* @__PURE__ */ new Date();
        expireDate.setDate(expireDate.getDate() + daysLeft);
        const expireDateStr = expireDate.toISOString().split("T")[0];
        if (!earliestExpire || expireDateStr < earliestExpire) {
          earliestExpire = expireDateStr;
        }
      }
    }
    user.lastSyncResult = {
      lastSync: (/* @__PURE__ */ new Date()).toISOString(),
      nodeCount: validLines.length,
      earliestExpire,
      totalRemainGB
    };
    await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${user.username}`, user);
    console.log(`[Scheduler] \u7528\u6237 ${user.username} \u540C\u6B65\u5B8C\u6210\uFF0C\u8282\u70B9\u6570: ${validLines.length}`);
    return { success: true, nodeCount: validLines.length };
  } catch (error) {
    const message2 = error instanceof Error ? error.message : String(error);
    console.error(`[Scheduler] \u7528\u6237 ${user.username} \u540C\u6B65\u5931\u8D25: ${message2}`);
    return { success: false, error: message2 };
  }
}
async function syncAllUsers(storage, env) {
  console.log("[Scheduler] \u5F00\u59CB\u540C\u6B65\u6240\u6709\u7528\u6237...");
  const substoreConfig = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
  const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
  if (!baseUrl) {
    console.error("[Scheduler] \u672A\u914D\u7F6E Sub-Store \u5730\u5740\uFF0C\u65E0\u6CD5\u540C\u6B65");
    return { total: 0, success: 0, failed: 0, synced: 0 };
  }
  const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
  let successCount = 0;
  let failedCount = 0;
  let syncedCount = 0;
  for (const key of userKeys) {
    const user = await storage.get(key);
    if (user && user.subscriptionConfig) {
      syncedCount++;
      const result = await syncUserSubscription(storage, user, baseUrl);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }
  }
  const config = await storage.get(STORAGE_KEYS.AUTO_SYNC_CONFIG);
  if (config) {
    config.lastScheduledSync = (/* @__PURE__ */ new Date()).toISOString();
    await storage.set(STORAGE_KEYS.AUTO_SYNC_CONFIG, config);
  }
  console.log(`[Scheduler] \u540C\u6B65\u5B8C\u6210\uFF0C\u6210\u529F: ${successCount}\uFF0C\u5931\u8D25: ${failedCount}`);
  return {
    total: userKeys.length,
    success: successCount,
    failed: failedCount,
    synced: syncedCount
  };
}
async function getAutoSyncConfig(storage) {
  const config = await storage.get(STORAGE_KEYS.AUTO_SYNC_CONFIG);
  return config || {
    enabled: false,
    intervalMinutes: 60
  };
}
async function setAutoSyncConfig(storage, config) {
  const current = await getAutoSyncConfig(storage);
  const updated = {
    ...current,
    ...config
  };
  await storage.set(STORAGE_KEYS.AUTO_SYNC_CONFIG, updated);
  return updated;
}
var init_scheduler = __esm({
  "src/scheduler.ts"() {
    "use strict";
    init_storage();
  }
});

// node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p2 = 0; p2 < numPatterns; p2++) {
        setupFormatFunc(p2);
        exports.applyMask(p2, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p2, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p2;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x2 = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x2;
        LOG_TABLE[x2] = i;
        x2 <<= 1;
        if (x2 & 256) {
          x2 ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log2(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x2, y) {
      if (x2 === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x2] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode2(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d2 = version << 12;
      while (Utils.getBCHDigit(d2) - G18_BCH >= 0) {
        d2 ^= G18 << Utils.getBCHDigit(d2) - G18_BCH;
      }
      return version << 12 | d2;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d2 = data << 10;
      while (Utils.getBCHDigit(d2) - G15_BCH >= 0) {
        d2 ^= G15 << Utils.getBCHDigit(d2) - G15_BCH;
      }
      return (data << 10 | d2) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d2) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v2, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v2 in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v2)) {
              cost_of_e = adjacent_nodes[v2];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v2];
              first_visit = typeof costs[v2] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v2] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v2, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v2] = u;
              }
            }
          }
        }
        if (typeof d2 !== "undefined" && typeof costs[d2] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d2, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d2) {
        var nodes = [];
        var u = d2;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d2) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d2);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d2
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T2 = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T2) {
            if (T2.hasOwnProperty(key)) {
              t[key] = T2[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T2.default_sorter;
          return t;
        },
        default_sorter: function(a2, b2) {
          return a2.cost - b2.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b2 = 0; b2 < ecTotalBlocks; b2++) {
        const dataSize = b2 < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b2] = buffer.slice(offset, offset + dataSize);
        ecData[b2] = rs.encode(dcData[b2]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x2, y) {
      let str = cmd + x2;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v2, i, a2) => a2.indexOf(v2) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var escapeRe = /[&<>'"]/;
var stringBufferToString = async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
};
var escapeToBuffer = (str, buffer) => {
  const match2 = str.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
};
var resolveCallbackSync = (str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v2] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v2);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          responseHeaders.set(k, v2);
        } else {
          responseHeaders.delete(k);
          for (const v22 of v2) {
            responseHeaders.append(k, v22);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html2, arg, headers) => {
    const res = (html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p2 of [path].flat()) {
        this.#path = p2;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a2, b2) {
  if (a2.length === 1) {
    return b2.length === 1 ? a2 < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a2 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a2.length === b2.length ? a2 < b2 ? -1 : 1 : b2.length - a2.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m2];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a2, b2) => b2.length - a2.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m2];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p2 = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p2, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p2;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v2, i, a2) => a2.indexOf(v2) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m2 = node.#methods[i];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m2 = matcher.exec(restPathString);
            if (m2) {
              params[name] = m2[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m2[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a2, b2) => {
        return a2.score - b2.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process, Deno } = globalThis;
  const isNoColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : process !== void 0 ? (
    // eslint-disable-next-line no-unsafe-optional-chaining
    "NO_COLOR" in process?.env
  ) : false;
  return !isNoColor;
}
async function getColorEnabledAsync() {
  const { navigator } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator !== void 0 && navigator.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}

// node_modules/hono/dist/middleware/logger/index.js
var humanize = (times) => {
  const [delimiter, separator] = [",", "."];
  const orderTimes = times.map((v2) => v2.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
  return orderTimes.join(separator);
};
var time = (start) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
};
var colorStatus = async (status) => {
  const colorEnabled = await getColorEnabledAsync();
  if (colorEnabled) {
    switch (status / 100 | 0) {
      case 5:
        return `\x1B[31m${status}\x1B[0m`;
      case 4:
        return `\x1B[33m${status}\x1B[0m`;
      case 3:
        return `\x1B[36m${status}\x1B[0m`;
      case 2:
        return `\x1B[32m${status}\x1B[0m`;
    }
  }
  return `${status}`;
};
async function log(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
var logger = (fn = console.log) => {
  return async function logger2(c, next) {
    const { method, url } = c.req;
    const path = url.slice(url.indexOf("/", 8));
    await log(fn, "<--", method, path);
    const start = Date.now();
    await next();
    await log(fn, "-->", method, path, c.res.status, time(start));
  };
};

// src/index.ts
init_memory();
init_kv();

// node_modules/@neondatabase/serverless/index.mjs
var So = Object.create;
var Ie = Object.defineProperty;
var Eo = Object.getOwnPropertyDescriptor;
var Ao = Object.getOwnPropertyNames;
var Co = Object.getPrototypeOf;
var _o = Object.prototype.hasOwnProperty;
var Io = (r, e, t) => e in r ? Ie(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t;
var a = (r, e) => Ie(r, "name", { value: e, configurable: true });
var G = (r, e) => () => (r && (e = r(r = 0)), e);
var T = (r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports);
var ie = (r, e) => {
  for (var t in e) Ie(r, t, {
    get: e[t],
    enumerable: true
  });
};
var Dn = (r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i of Ao(e)) !_o.call(r, i) && i !== t && Ie(r, i, { get: () => e[i], enumerable: !(n = Eo(e, i)) || n.enumerable });
  return r;
};
var Se = (r, e, t) => (t = r != null ? So(Co(r)) : {}, Dn(e || !r || !r.__esModule ? Ie(t, "default", { value: r, enumerable: true }) : t, r));
var O = (r) => Dn(Ie({}, "__esModule", { value: true }), r);
var E = (r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t);
var Qn = T((lt) => {
  "use strict";
  p();
  lt.byteLength = Po;
  lt.toByteArray = Ro;
  lt.fromByteArray = ko;
  var ae = [], te = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (Ee = 0, On = qt.length; Ee < On; ++Ee) ae[Ee] = qt[Ee], te[qt.charCodeAt(Ee)] = Ee;
  var Ee, On;
  te[45] = 62;
  te[95] = 63;
  function qn(r) {
    var e = r.length;
    if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  a(qn, "getLens");
  function Po(r) {
    var e = qn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  a(Po, "byteLength");
  function Bo(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  a(Bo, "_byteLength");
  function Ro(r) {
    var e, t = qn(r), n = t[0], i = t[1], s = new To(Bo(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
    for (c = 0; c < u; c += 4) e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i === 2 && (e = te[r.charCodeAt(
      c
    )] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = te[r.charCodeAt(c)] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  a(Ro, "toByteArray");
  function Lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  a(Lo, "tripletToBase64");
  function Fo(r, e, t) {
    for (var n, i = [], s = e; s < t; s += 3) n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(Lo(n));
    return i.join("");
  }
  a(Fo, "encodeChunk");
  function ko(r) {
    for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s) i.push(Fo(
      r,
      o,
      o + s > u ? u : o + s
    ));
    return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
  }
  a(ko, "fromByteArray");
});
var Nn = T((Qt) => {
  p();
  Qt.read = function(r, e, t, n, i) {
    var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i - 1 : 0, g = t ? -1 : 1, A = r[e + y];
    for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u; f > 0; s = s * 256 + r[e + y], y += g, f -= 8) ;
    for (o = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; o = o * 256 + r[e + y], y += g, f -= 8) ;
    if (s === 0) s = 1 - l;
    else {
      if (s === c) return o ? NaN : (A ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - l;
    }
    return (A ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Qt.write = function(r, e, t, n, i, s) {
    var o, u, c, l = s * 8 - i - 1, f = (1 << l) - 1, y = f >> 1, g = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + A] = u & 255, A += C, u /= 256, i -= 8) ;
    for (o = o << i | u, l += i; l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8) ;
    r[t + A - C] |= D * 128;
  };
});
var ii = T((Re) => {
  "use strict";
  p();
  var Nt = Qn(), Pe = Nn(), Wn = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
  Re.Buffer = h;
  Re.SlowBuffer = Qo;
  Re.INSPECT_MAX_BYTES = 50;
  var ft = 2147483647;
  Re.kMaxLength = ft;
  h.TYPED_ARRAY_SUPPORT = Mo();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Mo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return false;
    }
  }
  a(Mo, "typedArraySupport");
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
    if (h.isBuffer(this)) return this.buffer;
  }, "get") });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
    if (h.isBuffer(
      this
    )) return this.byteOffset;
  }, "get") });
  function he(r) {
    if (r > ft) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(r);
    return Object.setPrototypeOf(e, h.prototype), e;
  }
  a(he, "createBuffer");
  function h(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string") throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      );
      return $t(r);
    }
    return Gn(r, e, t);
  }
  a(h, "Buffer");
  h.poolSize = 8192;
  function Gn(r, e, t) {
    if (typeof r == "string") return Do(r, e);
    if (ArrayBuffer.isView(r)) return Oo(r);
    if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(
      r.buffer,
      SharedArrayBuffer
    ))) return jt(r, e, t);
    if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return h.from(n, e, t);
    let i = qo(r);
    if (i) return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return h.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  a(Gn, "from");
  h.from = function(r, e, t) {
    return Gn(r, e, t);
  };
  Object.setPrototypeOf(
    h.prototype,
    Uint8Array.prototype
  );
  Object.setPrototypeOf(h, Uint8Array);
  function Vn(r) {
    if (typeof r != "number") throw new TypeError(
      '"size" argument must be of type number'
    );
    if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  a(Vn, "assertSize");
  function Uo(r, e, t) {
    return Vn(r), r <= 0 ? he(r) : e !== void 0 ? typeof t == "string" ? he(r).fill(e, t) : he(r).fill(e) : he(r);
  }
  a(Uo, "alloc");
  h.alloc = function(r, e, t) {
    return Uo(r, e, t);
  };
  function $t(r) {
    return Vn(r), he(r < 0 ? 0 : Gt(r) | 0);
  }
  a($t, "allocUnsafe");
  h.allocUnsafe = function(r) {
    return $t(
      r
    );
  };
  h.allocUnsafeSlow = function(r) {
    return $t(r);
  };
  function Do(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
    let t = zn(r, e) | 0, n = he(t), i = n.write(
      r,
      e
    );
    return i !== t && (n = n.slice(0, i)), n;
  }
  a(Do, "fromString");
  function Wt(r) {
    let e = r.length < 0 ? 0 : Gt(r.length) | 0, t = he(e);
    for (let n = 0; n < e; n += 1) t[n] = r[n] & 255;
    return t;
  }
  a(Wt, "fromArrayLike");
  function Oo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return jt(e.buffer, e.byteOffset, e.byteLength);
    }
    return Wt(r);
  }
  a(Oo, "fromArrayView");
  function jt(r, e, t) {
    if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(
      r,
      e,
      t
    ), Object.setPrototypeOf(n, h.prototype), n;
  }
  a(jt, "fromArrayBuffer");
  function qo(r) {
    if (h.isBuffer(r)) {
      let e = Gt(r.length) | 0, t = he(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0) return typeof r.length != "number" || zt(r.length) ? he(0) : Wt(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return Wt(r.data);
  }
  a(qo, "fromObject");
  function Gt(r) {
    if (r >= ft) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ft.toString(16) + " bytes");
    return r | 0;
  }
  a(Gt, "checked");
  function Qo(r) {
    return +r != r && (r = 0), h.alloc(+r);
  }
  a(Qo, "SlowBuffer");
  h.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== h.prototype;
  }, "isBuffer");
  h.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t)) throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    );
    if (e === t) return 0;
    let n = e.length, i = t.length;
    for (let s = 0, o = Math.min(n, i); s < o; ++s) if (e[s] !== t[s]) {
      n = e[s], i = t[s];
      break;
    }
    return n < i ? -1 : i < n ? 1 : 0;
  }, "compare");
  h.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  h.concat = a(function(e, t) {
    if (!Array.isArray(e)) throw new TypeError(
      '"list" argument must be an Array of Buffers'
    );
    if (e.length === 0) return h.alloc(0);
    let n;
    if (t === void 0)
      for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
    let i = h.allocUnsafe(t), s = 0;
    for (n = 0; n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array)) s + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
      else if (h.isBuffer(o)) o.copy(i, s);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i;
  }, "concat");
  function zn(r, e) {
    if (h.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string") throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
    );
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0) return 0;
    let i = false;
    for (; ; ) switch (e) {
      case "ascii":
      case "latin1":
      case "binary":
        return t;
      case "utf8":
      case "utf-8":
        return Ht(r).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t * 2;
      case "hex":
        return t >>> 1;
      case "base64":
        return ni(r).length;
      default:
        if (i) return n ? -1 : Ht(r).length;
        e = ("" + e).toLowerCase(), i = true;
    }
  }
  a(zn, "byteLength");
  h.byteLength = zn;
  function No(r, e, t) {
    let n = false;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
    for (r || (r = "utf8"); ; ) switch (r) {
      case "hex":
        return Zo(this, e, t);
      case "utf8":
      case "utf-8":
        return Yn(this, e, t);
      case "ascii":
        return Ko(this, e, t);
      case "latin1":
      case "binary":
        return Yo(
          this,
          e,
          t
        );
      case "base64":
        return Vo(this, e, t);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Jo(
          this,
          e,
          t
        );
      default:
        if (n) throw new TypeError("Unknown encoding: " + r);
        r = (r + "").toLowerCase(), n = true;
    }
  }
  a(
    No,
    "slowToString"
  );
  h.prototype._isBuffer = true;
  function Ae(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  a(Ae, "swap");
  h.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2) Ae(this, t, t + 1);
    return this;
  }, "swap16");
  h.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4) Ae(this, t, t + 3), Ae(this, t + 1, t + 2);
    return this;
  }, "swap32");
  h.prototype.swap64 = a(
    function() {
      let e = this.length;
      if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < e; t += 8) Ae(this, t, t + 7), Ae(this, t + 1, t + 6), Ae(this, t + 2, t + 5), Ae(this, t + 3, t + 4);
      return this;
    },
    "swap64"
  );
  h.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Yn(
      this,
      0,
      e
    ) : No.apply(this, arguments);
  }, "toString");
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = a(function(e) {
    if (!h.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
    return this === e ? true : h.compare(this, e) === 0;
  }, "equals");
  h.prototype.inspect = a(function() {
    let e = "", t = Re.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Wn && (h.prototype[Wn] = h.prototype.inspect);
  h.prototype.compare = a(function(e, t, n, i, s) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length) throw new RangeError("out of range index");
    if (i >= s && t >= n) return 0;
    if (i >= s) return -1;
    if (t >= n) return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e) return 0;
    let o = s - i, u = n - t, c = Math.min(o, u), l = this.slice(
      i,
      s
    ), f = e.slice(t, n);
    for (let y = 0; y < c; ++y) if (l[y] !== f[y]) {
      o = l[y], u = f[y];
      break;
    }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Kn(r, e, t, n, i) {
    if (r.length === 0) return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, zt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i) return -1;
      t = r.length - 1;
    } else if (t < 0) if (i) t = 0;
    else return -1;
    if (typeof e == "string" && (e = h.from(
      e,
      n
    )), h.isBuffer(e)) return e.length === 0 ? -1 : jn(r, e, t, n, i);
    if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : jn(r, [e], t, n, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  a(Kn, "bidirectionalIndexOf");
  function jn(r, e, t, n, i) {
    let s = 1, o = r.length, u = e.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2) return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(f, y) {
      return s === 1 ? f[y] : f.readUInt16BE(y * s);
    }
    a(c, "read");
    let l;
    if (i) {
      let f = -1;
      for (l = t; l < o; l++) if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
        if (f === -1 && (f = l), l - f + 1 === u) return f * s;
      } else f !== -1 && (l -= l - f), f = -1;
    } else for (t + u > o && (t = o - u), l = t; l >= 0; l--) {
      let f = true;
      for (let y = 0; y < u; y++) if (c(r, l + y) !== c(e, y)) {
        f = false;
        break;
      }
      if (f) return l;
    }
    return -1;
  }
  a(jn, "arrayIndexOf");
  h.prototype.includes = a(function(e, t, n) {
    return this.indexOf(
      e,
      t,
      n
    ) !== -1;
  }, "includes");
  h.prototype.indexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, true);
  }, "indexOf");
  h.prototype.lastIndexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, false);
  }, "lastIndexOf");
  function Wo(r, e, t, n) {
    t = Number(t) || 0;
    let i = r.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0; o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (zt(u)) return o;
      r[t + o] = u;
    }
    return o;
  }
  a(Wo, "hexWrite");
  function jo(r, e, t, n) {
    return ht(Ht(e, r.length - t), r, t, n);
  }
  a(jo, "utf8Write");
  function Ho(r, e, t, n) {
    return ht(ra(e), r, t, n);
  }
  a(
    Ho,
    "asciiWrite"
  );
  function $o(r, e, t, n) {
    return ht(ni(e), r, t, n);
  }
  a($o, "base64Write");
  function Go(r, e, t, n) {
    return ht(
      na(e, r.length - t),
      r,
      t,
      n
    );
  }
  a(Go, "ucs2Write");
  h.prototype.write = a(function(e, t, n, i) {
    if (t === void 0) i = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string") i = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let o = false;
    for (; ; ) switch (i) {
      case "hex":
        return Wo(this, e, t, n);
      case "utf8":
      case "utf-8":
        return jo(this, e, t, n);
      case "ascii":
      case "latin1":
      case "binary":
        return Ho(this, e, t, n);
      case "base64":
        return $o(this, e, t, n);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Go(this, e, t, n);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i);
        i = ("" + i).toLowerCase(), o = true;
    }
  }, "write");
  h.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Vo(r, e, t) {
    return e === 0 && t === r.length ? Nt.fromByteArray(r) : Nt.fromByteArray(r.slice(e, t));
  }
  a(Vo, "base64Slice");
  function Yn(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i = e;
    for (; i < t; ) {
      let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i + u <= t) {
        let c, l, f, y;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
            break;
          case 3:
            c = r[i + 1], l = r[i + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            c = r[i + 1], l = r[i + 2], f = r[i + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
    }
    return zo(n);
  }
  a(Yn, "utf8Slice");
  var Hn = 4096;
  function zo(r) {
    let e = r.length;
    if (e <= Hn) return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (; n < e; ) t += String.fromCharCode.apply(String, r.slice(n, n += Hn));
    return t;
  }
  a(zo, "decodeCodePointsArray");
  function Ko(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i] & 127);
    return n;
  }
  a(Ko, "asciiSlice");
  function Yo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i]);
    return n;
  }
  a(Yo, "latin1Slice");
  function Zo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let s = e; s < t; ++s) i += ia[r[s]];
    return i;
  }
  a(Zo, "hexSlice");
  function Jo(r, e, t) {
    let n = r.slice(e, t), i = "";
    for (let s = 0; s < n.length - 1; s += 2) i += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i;
  }
  a(Jo, "utf16leSlice");
  h.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i = this.subarray(e, t);
    return Object.setPrototypeOf(i, h.prototype), i;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + e > t) throw new RangeError("Trying to access beyond buffer length");
  }
  a(q, "checkOffset");
  h.prototype.readUintLE = h.prototype.readUIntLE = a(
    function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
      let i = this[e], s = 1, o = 0;
      for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
      return i;
    },
    "readUIntLE"
  );
  h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e + --t], s = 1;
    for (; t > 0 && (s *= 256); ) i += this[e + --t] * s;
    return i;
  }, "readUIntBE");
  h.prototype.readUint8 = h.prototype.readUInt8 = a(
    function(e, t) {
      return e = e >>> 0, t || q(e, 1, this.length), this[e];
    },
    "readUInt8"
  );
  h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(
      e,
      2,
      this.length
    ), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  h.prototype.readBigUInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  h.prototype.readBigUInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(s);
  }, "readBigUInt64BE"));
  h.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
    return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
  }, "readIntLE");
  h.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = t, s = 1, o = this[e + --i];
    for (; i > 0 && (s *= 256); ) o += this[e + --i] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  h.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  h.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(
      e,
      2,
      this.length
    );
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  h.prototype.readInt16BE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e + 1] | this[e] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16BE");
  h.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  h.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  h.prototype.readBigInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  h.prototype.readBigInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i) << BigInt(32)) + BigInt(
      this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
    );
  }, "readBigInt64BE"));
  h.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, true, 23, 4);
  }, "readFloatLE");
  h.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  h.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  h.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(
      this,
      e,
      false,
      52,
      8
    );
  }, "readDoubleBE");
  function V(r, e, t, n, i, s) {
    if (!h.isBuffer(r)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < s) throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length) throw new RangeError("Index out of range");
  }
  a(V, "checkInt");
  h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(
        this,
        e,
        t,
        n,
        u,
        0
      );
    }
    let s = 1, o = 0;
    for (this[t] = e & 255; ++o < n && (s *= 256); ) this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Zn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  a(Zn, "wrtBigUInt64LE");
  function Jn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  a(Jn, "wrtBigUInt64BE");
  h.prototype.writeBigUInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64LE"));
  h.prototype.writeBigUInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64BE"));
  h.prototype.writeIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255; ++s < n && (o *= 256); )
      e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  h.prototype.writeIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  h.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  h.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  h.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  h.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  h.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  h.prototype.writeBigInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  h.prototype.writeBigInt64BE = we(
    a(function(e, t = 0) {
      return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE")
  );
  function Xn(r, e, t, n, i, s) {
    if (t + n > r.length) throw new RangeError("Index out of range");
    if (t < 0) throw new RangeError("Index out of range");
  }
  a(Xn, "checkIEEE754");
  function ei(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(r, e, t, n, 23, 4), t + 4;
  }
  a(
    ei,
    "writeFloat"
  );
  h.prototype.writeFloatLE = a(function(e, t, n) {
    return ei(this, e, t, true, n);
  }, "writeFloatLE");
  h.prototype.writeFloatBE = a(function(e, t, n) {
    return ei(this, e, t, false, n);
  }, "writeFloatBE");
  function ti(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Pe.write(
      r,
      e,
      t,
      n,
      52,
      8
    ), t + 8;
  }
  a(ti, "writeDouble");
  h.prototype.writeDoubleLE = a(function(e, t, n) {
    return ti(this, e, t, true, n);
  }, "writeDoubleLE");
  h.prototype.writeDoubleBE = a(function(e, t, n) {
    return ti(this, e, t, false, n);
  }, "writeDoubleBE");
  h.prototype.copy = a(function(e, t, n, i) {
    if (!h.isBuffer(e)) throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0) return 0;
    if (t < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (i < 0) throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
    let s = i - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
  }, "copy");
  h.prototype.fill = a(function(e, t, n, i) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !h.isEncoding(i)) throw new TypeError(
        "Unknown encoding: " + i
      );
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (e = o);
      }
    } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
    if (n <= t) return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number") for (s = t; s < n; ++s) this[s] = e;
    else {
      let o = h.isBuffer(e) ? e : h.from(
        e,
        i
      ), u = o.length;
      if (u === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (s = 0; s < n - t; ++s) this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Te = {};
  function Vt(r, e, t) {
    var n;
    Te[r] = (n = class extends t {
      constructor() {
        super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(
          this,
          "code",
          { configurable: true, enumerable: true, value: s, writable: true }
        );
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  a(Vt, "E");
  Vt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vt(
    "ERR_INVALID_ARG_TYPE",
    function(r, e) {
      return `The "${r}" argument must be of type number. Received type ${typeof e}`;
    },
    TypeError
  );
  Vt("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = $n(String(t)) : typeof t == "bigint" && (i = String(
      t
    ), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = $n(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
  }, RangeError);
  function $n(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3) e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  a($n, "addNumericalSeparator");
  function Xo(r, e, t) {
    Be(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && je(e, r.length - (t + 1));
  }
  a(Xo, "checkBounds");
  function ri(r, e, t, n, i, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Te.ERR_OUT_OF_RANGE("value", u, r);
    }
    Xo(n, i, s);
  }
  a(ri, "checkIntBI");
  function Be(r, e) {
    if (typeof r != "number") throw new Te.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  a(Be, "validateNumber");
  function je(r, e, t) {
    throw Math.floor(r) !== r ? (Be(r, t), new Te.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Te.ERR_BUFFER_OUT_OF_BOUNDS() : new Te.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  a(je, "boundsError");
  var ea = /[^+/0-9A-Za-z-_]/g;
  function ta(r) {
    if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2) return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  a(ta, "base64clean");
  function Ht(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i = null, s = [];
    for (let o = 0; o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(239, 191, 189), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else i && (e -= 3) > -1 && s.push(239, 191, 189);
      if (i = null, t < 128) {
        if ((e -= 1) < 0) break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0) break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0) break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0) break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return s;
  }
  a(Ht, "utf8ToBytes");
  function ra(r) {
    let e = [];
    for (let t = 0; t < r.length; ++t) e.push(r.charCodeAt(t) & 255);
    return e;
  }
  a(
    ra,
    "asciiToBytes"
  );
  function na(r, e) {
    let t, n, i, s = [];
    for (let o = 0; o < r.length && !((e -= 2) < 0); ++o) t = r.charCodeAt(
      o
    ), n = t >> 8, i = t % 256, s.push(i), s.push(n);
    return s;
  }
  a(na, "utf16leToBytes");
  function ni(r) {
    return Nt.toByteArray(
      ta(r)
    );
  }
  a(ni, "base64ToBytes");
  function ht(r, e, t, n) {
    let i;
    for (i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)
      e[i + t] = r[i];
    return i;
  }
  a(ht, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  a(ue, "isInstance");
  function zt(r) {
    return r !== r;
  }
  a(zt, "numberIsNaN");
  var ia = (function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      let n = t * 16;
      for (let i = 0; i < 16; ++i) e[n + i] = r[t] + r[i];
    }
    return e;
  })();
  function we(r) {
    return typeof BigInt > "u" ? sa : r;
  }
  a(we, "defineBigIntMethod");
  function sa() {
    throw new Error("BigInt not supported");
  }
  a(sa, "BufferBigIntNotDefined");
});
var b;
var v;
var x;
var d;
var m;
var p = G(() => {
  "use strict";
  b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : ii().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var ge = T((Rl, Kt) => {
  "use strict";
  p();
  var Le = typeof Reflect == "object" ? Reflect : null, si = Le && typeof Le.apply == "function" ? Le.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), pt;
  Le && typeof Le.ownKeys == "function" ? pt = Le.ownKeys : Object.getOwnPropertySymbols ? pt = a(function(e) {
    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : pt = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function oa(r) {
    console && console.warn && console.warn(r);
  }
  a(
    oa,
    "ProcessEmitWarning"
  );
  var ai = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function B() {
    B.init.call(this);
  }
  a(B, "EventEmitter");
  Kt.exports = B;
  Kt.exports.once = la;
  B.EventEmitter = B;
  B.prototype._events = void 0;
  B.prototype._eventsCount = 0;
  B.prototype._maxListeners = void 0;
  var oi = 10;
  function dt(r) {
    if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  a(dt, "checkListener");
  Object.defineProperty(B, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return oi;
  }, "get"), set: a(
    function(r) {
      if (typeof r != "number" || r < 0 || ai(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
      oi = r;
    },
    "set"
  ) });
  B.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  B.prototype.setMaxListeners = a(function(e) {
    if (typeof e != "number" || e < 0 || ai(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
    return this._maxListeners = e, this;
  }, "setMaxListeners");
  function ui(r) {
    return r._maxListeners === void 0 ? B.defaultMaxListeners : r._maxListeners;
  }
  a(ui, "_getMaxListeners");
  B.prototype.getMaxListeners = a(function() {
    return ui(this);
  }, "getMaxListeners");
  B.prototype.emit = a(function(e) {
    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
    var i = e === "error", s = this._events;
    if (s !== void 0) i = i && s.error === void 0;
    else if (!i) return false;
    if (i) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === void 0) return false;
    if (typeof c == "function") si(c, this, t);
    else for (var l = c.length, f = pi(c, l), n = 0; n < l; ++n) si(f[n], this, t);
    return true;
  }, "emit");
  function ci(r, e, t, n) {
    var i, s, o;
    if (dt(
      t
    ), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = ui(r), i > 0 && o.length > i && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
    }
    return r;
  }
  a(ci, "_addListener");
  B.prototype.addListener = a(function(e, t) {
    return ci(this, e, t, false);
  }, "addListener");
  B.prototype.on = B.prototype.addListener;
  B.prototype.prependListener = a(function(e, t) {
    return ci(this, e, t, true);
  }, "prependListener");
  function aa() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  a(aa, "onceWrapper");
  function li(r, e, t) {
    var n = {
      fired: false,
      wrapFn: void 0,
      target: r,
      type: e,
      listener: t
    }, i = aa.bind(n);
    return i.listener = t, n.wrapFn = i, i;
  }
  a(li, "_onceWrap");
  B.prototype.once = a(function(e, t) {
    return dt(t), this.on(e, li(this, e, t)), this;
  }, "once");
  B.prototype.prependOnceListener = a(function(e, t) {
    return dt(t), this.prependListener(e, li(this, e, t)), this;
  }, "prependOnceListener");
  B.prototype.removeListener = a(function(e, t) {
    var n, i, s, o, u;
    if (dt(t), i = this._events, i === void 0) return this;
    if (n = i[e], n === void 0) return this;
    if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
    else if (typeof n != "function") {
      for (s = -1, o = n.length - 1; o >= 0; o--) if (n[o] === t || n[o].listener === t) {
        u = n[o].listener, s = o;
        break;
      }
      if (s < 0) return this;
      s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
    }
    return this;
  }, "removeListener");
  B.prototype.off = B.prototype.removeListener;
  B.prototype.removeAllListeners = a(function(e) {
    var t, n, i;
    if (n = this._events, n === void 0) return this;
    if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i = 0; i < s.length; ++i) o = s[i], o !== "removeListener" && this.removeAllListeners(
        o
      );
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function") this.removeListener(e, t);
    else if (t !== void 0) for (i = t.length - 1; i >= 0; i--) this.removeListener(e, t[i]);
    return this;
  }, "removeAllListeners");
  function fi(r, e, t) {
    var n = r._events;
    if (n === void 0) return [];
    var i = n[e];
    return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? ca(i) : pi(i, i.length);
  }
  a(fi, "_listeners");
  B.prototype.listeners = a(function(e) {
    return fi(this, e, true);
  }, "listeners");
  B.prototype.rawListeners = a(function(e) {
    return fi(this, e, false);
  }, "rawListeners");
  B.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : hi.call(r, e);
  };
  B.prototype.listenerCount = hi;
  function hi(r) {
    var e = this._events;
    if (e !== void 0) {
      var t = e[r];
      if (typeof t == "function")
        return 1;
      if (t !== void 0) return t.length;
    }
    return 0;
  }
  a(hi, "listenerCount");
  B.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? pt(this._events) : [];
  }, "eventNames");
  function pi(r, e) {
    for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
    return t;
  }
  a(pi, "arrayClone");
  function ua(r, e) {
    for (; e + 1 < r.length; e++) r[e] = r[e + 1];
    r.pop();
  }
  a(ua, "spliceOne");
  function ca(r) {
    for (var e = new Array(r.length), t = 0; t < e.length; ++t) e[t] = r[t].listener || r[t];
    return e;
  }
  a(ca, "unwrapListeners");
  function la(r, e) {
    return new Promise(function(t, n) {
      function i(o) {
        r.removeListener(e, s), n(o);
      }
      a(i, "errorListener");
      function s() {
        typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
      }
      a(s, "resolver"), di(r, e, s, { once: true }), e !== "error" && fa(r, i, { once: true });
    });
  }
  a(la, "once");
  function fa(r, e, t) {
    typeof r.on == "function" && di(r, "error", e, t);
  }
  a(
    fa,
    "addErrorHandlerIfEventEmitter"
  );
  function di(r, e, t, n) {
    if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function") r.addEventListener(e, a(function i(s) {
      n.once && r.removeEventListener(e, i), t(s);
    }, "wrapListener"));
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  a(di, "eventTargetAgnosticAddListener");
});
var wi = {};
ie(wi, { Socket: () => ce, isIP: () => ha });
function ha(r) {
  return 0;
}
var mi;
var yi;
var S;
var ce;
var Fe = G(() => {
  "use strict";
  p();
  mi = Se(ge(), 1);
  a(ha, "isIP");
  yi = /^[^.]+\./, S = class S2 extends mi.EventEmitter {
    constructor() {
      super(...arguments);
      E(this, "opts", {});
      E(this, "connecting", false);
      E(this, "pending", true);
      E(
        this,
        "writable",
        true
      );
      E(this, "encrypted", false);
      E(this, "authorized", false);
      E(this, "destroyed", false);
      E(this, "ws", null);
      E(this, "writeBuffer");
      E(this, "tlsState", 0);
      E(this, "tlsRead");
      E(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      S2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      S2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      S2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      S2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return S2.opts.wsProxy ?? S2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      S2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? S2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      S2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? S2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      S2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      S2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return S2.opts.disableSNI ?? S2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      S2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? S2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get disableWarningInBrowsers() {
      return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
    }
    static set disableWarningInBrowsers(t) {
      S2.opts.disableWarningInBrowsers = t;
    }
    get disableWarningInBrowsers() {
      return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
    }
    set disableWarningInBrowsers(t) {
      this.opts.disableWarningInBrowsers = t;
    }
    static get pipelineConnect() {
      return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      S2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? S2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return S2.opts.subtls ?? S2.defaults.subtls;
    }
    static set subtls(t) {
      S2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? S2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      S2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? S2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return S2.opts.rootCerts ?? S2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      S2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? S2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i = this.wsProxy;
      if (i === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i) {
      this.connecting = true, i && this.once("connect", i);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, l = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
          this.emit("error", f), this.emit("close");
        }), c.addEventListener("message", (f) => {
          if (this.tlsState === 0) {
            let y = d.from(f.data);
            this.emit("data", y);
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), l ? s() : c.addEventListener(
          "open",
          s
        );
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(l), o(this.ws);
        else try {
          this.ws = new WebSocket(l), o(this.ws);
        } catch {
          this.ws = new __unstable_WebSocket(l), o(this.ws);
        }
      } catch (c) {
        let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(f, { headers: { Upgrade: "websocket" } }).then(
          (y) => {
            if (this.ws = y.webSocket, this.ws == null) throw c;
            this.ws.accept(), o(this.ws, true);
          }
        ).catch((y) => {
          this.emit(
            "error",
            new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)
          ), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === void 0) throw new Error(
        "For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information."
      );
      this.tlsState = 1;
      let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t = await this.tlsRead();
        if (t === void 0) break;
        {
          let n = d.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws && this.ws.send(t);
        return;
      }
      if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(() => {
        this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
      }, 0);
      else {
        let n = new Uint8Array(
          this.writeBuffer.length + t.length
        );
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i = (s) => {
    }) {
      return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t,
          n,
          i
        );
      }) : (this.tlsWrite(t), i()), true);
    }
    end(t = d.alloc(0), n = "utf8", i = () => {
    }) {
      return this.write(t, n, () => {
        this.ws.close(), i();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(S, "Socket"), E(S, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t, n, i) => {
      let s;
      return i?.jwtAuth ? s = t.replace(yi, "apiauth.") : s = t.replace(yi, "api."), "https://" + s + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false,
    disableWarningInBrowsers: false
  }), E(S, "opts", {});
  ce = S;
});
var gi = {};
ie(gi, { parse: () => Yt });
function Yt(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(
    t.length
  ), { username: i, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(
    n
  );
  s = decodeURIComponent(s), i = decodeURIComponent(i), l = decodeURIComponent(l);
  let A = i + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
  return {
    href: r,
    protocol: t,
    auth: A,
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: l,
    search: f,
    query: C,
    hash: g
  };
}
var Zt = G(() => {
  "use strict";
  p();
  a(Yt, "parse");
});
var tr = T((Ai) => {
  "use strict";
  p();
  Ai.parse = function(r, e) {
    return new er(r, e).parse();
  };
  var vt = class vt2 {
    constructor(e, t) {
      this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(
        e
      );
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[") for (; !this.isEof(); ) {
        var e = this.nextCharacter();
        if (e.value === "=") break;
      }
    }
    parse(e) {
      var t, n, i;
      for (this.consumeDimensions(); !this.isEof(); ) if (t = this.nextCharacter(), t.value === "{" && !i) this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(
        true
      )), this.position += n.position - 2);
      else if (t.value === "}" && !i) {
        if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
      } else t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
      if (this.dimension !== 0) throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(vt, "ArrayParser");
  var er = vt;
  function Ca(r) {
    return r;
  }
  a(Ca, "identity");
});
var rr = T((Zl, Ci) => {
  p();
  var _a2 = tr();
  Ci.exports = { create: a(function(r, e) {
    return { parse: a(function() {
      return _a2.parse(r, e);
    }, "parse") };
  }, "create") };
});
var Ti = T((ef, Ii) => {
  "use strict";
  p();
  var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ba = /^-?infinity$/;
  Ii.exports = a(function(e) {
    if (Ba.test(e)) return Number(e.replace("i", "I"));
    var t = Ia.exec(e);
    if (!t) return Ra(
      e
    ) || null;
    var n = !!t[8], i = parseInt(t[1], 10);
    n && (i = _i(i));
    var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(
      t[4],
      10
    ), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
    f = f ? 1e3 * parseFloat(f) : 0;
    var y, g = La(e);
    return g != null ? (y = new Date(Date.UTC(i, s, o, u, c, l, f)), nr(i) && y.setUTCFullYear(i), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i, s, o, u, c, l, f), nr(i) && y.setFullYear(i)), y;
  }, "parseDate");
  function Ra(r) {
    var e = Ta.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = _i(t));
      var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
      return nr(
        t
      ) && o.setFullYear(t), o;
    }
  }
  a(Ra, "getDate");
  function La(r) {
    if (r.endsWith("+00")) return 0;
    var e = Pa.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z") return 0;
      var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(
        e[3] || 0,
        10
      ) * 60 + parseInt(e[4] || 0, 10);
      return i * n * 1e3;
    }
  }
  a(La, "timeZoneOffset");
  function _i(r) {
    return -(r - 1);
  }
  a(_i, "bcYearToNegativeYear");
  function nr(r) {
    return r >= 0 && r < 100;
  }
  a(nr, "is0To99");
});
var Bi = T((nf, Pi) => {
  p();
  Pi.exports = ka;
  var Fa = Object.prototype.hasOwnProperty;
  function ka(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Fa.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }
  a(ka, "extend");
});
var Fi = T((af, Li) => {
  "use strict";
  p();
  var Ma = Bi();
  Li.exports = ke;
  function ke(r) {
    if (!(this instanceof ke))
      return new ke(r);
    Ma(this, Va(r));
  }
  a(ke, "PostgresInterval");
  var Ua = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "years"
  ];
  ke.prototype.toPostgres = function() {
    var r = Ua.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t + " " + e;
    }, this).join(" ");
  };
  var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
  ke.prototype.toISOString = ke.prototype.toISO = function() {
    var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i + Da[n];
    }
  };
  var ir = "([+-]?\\d+)", Qa = ir + "\\s+years?", Na = ir + "\\s+mons?", Wa = ir + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), Ri = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
  function Ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(
      e,
      10
    ) / 1e3;
  }
  a(Ga, "parseMilliseconds");
  function Va(r) {
    if (!r) return {};
    var e = Ha.exec(r), t = e[8] === "-";
    return Object.keys(Ri).reduce(function(n, i) {
      var s = Ri[i], o = e[s];
      return !o || (o = i === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i) && (o *= -1), n[i] = o), n;
    }, {});
  }
  a(Va, "parse");
});
var Mi = T((lf, ki) => {
  "use strict";
  p();
  ki.exports = a(function(e) {
    if (/^\\x/.test(e)) return new d(e.substr(
      2
    ), "hex");
    for (var t = "", n = 0; n < e.length; ) if (e[n] !== "\\") t += e[n], ++n;
    else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
    else {
      for (var i = 1; n + i < e.length && e[n + i] === "\\"; ) i++;
      for (var s = 0; s < Math.floor(i / 2); ++s) t += "\\";
      n += Math.floor(i / 2) * 2;
    }
    return new d(t, "binary");
  }, "parseBytea");
});
var Wi = T((pf, Ni) => {
  p();
  var Ve = tr(), ze = rr(), xt = Ti(), Di = Fi(), Oi = Mi();
  function St(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  a(St, "allowNull");
  function qi(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  a(qi, "parseBool");
  function za(r) {
    return r ? Ve.parse(r, qi) : null;
  }
  a(za, "parseBoolArray");
  function Ka(r) {
    return parseInt(r, 10);
  }
  a(Ka, "parseBaseTenInt");
  function sr(r) {
    return r ? Ve.parse(r, St(Ka)) : null;
  }
  a(sr, "parseIntegerArray");
  function Ya(r) {
    return r ? Ve.parse(r, St(function(e) {
      return Qi(e).trim();
    })) : null;
  }
  a(Ya, "parseBigIntegerArray");
  var Za = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = cr(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), or = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r) return null;
    var e = ze.create(r);
    return e.parse();
  }, "parseStringArray"), ar = a(function(r) {
    if (!r) return null;
    var e = ze.create(
      r,
      function(t) {
        return t !== null && (t = xt(t)), t;
      }
    );
    return e.parse();
  }, "parseDateArray"), Ja = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = Di(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), Xa = a(function(r) {
    return r ? Ve.parse(r, St(Oi)) : null;
  }, "parseByteAArray"), ur = a(function(r) {
    return parseInt(r, 10);
  }, "parseInteger"), Qi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), Ui = a(function(r) {
    return r ? Ve.parse(r, St(JSON.parse)) : null;
  }, "parseJsonArray"), cr = a(
    function(r) {
      return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(
        r[1]
      ) });
    },
    "parsePoint"
  ), eu = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(") return null;
    for (var e = "(", t = "", n = false, i = 2; i < r.length - 1; i++) {
      if (n || (e += r[i]), r[i] === ")") {
        n = true;
        continue;
      } else if (!n) continue;
      r[i] !== "," && (t += r[i]);
    }
    var s = cr(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), tu = a(function(r) {
    r(20, Qi), r(21, ur), r(23, ur), r(26, ur), r(700, parseFloat), r(701, parseFloat), r(16, qi), r(1082, xt), r(1114, xt), r(1184, xt), r(
      600,
      cr
    ), r(651, re), r(718, eu), r(1e3, za), r(1001, Xa), r(1005, sr), r(1007, sr), r(1028, sr), r(1016, Ya), r(1017, Za), r(1021, or), r(1022, or), r(1231, or), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(
      1115,
      ar
    ), r(1182, ar), r(1185, ar), r(1186, Di), r(1187, Ja), r(17, Oi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Ui), r(3807, Ui), r(3907, re), r(2951, re), r(791, re), r(1183, re), r(1270, re);
  }, "init");
  Ni.exports = { init: tu };
});
var Hi = T((mf, ji) => {
  "use strict";
  p();
  var z = 1e6;
  function ru(r) {
    var e = r.readInt32BE(0), t = r.readUInt32BE(
      4
    ), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i = "", s, o, u, c, l, f;
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i;
  }
  a(ru, "readInt8");
  ji.exports = ru;
});
var Ki = T((bf, zi) => {
  p();
  var nu = Hi(), L = a(function(r, e, t, n, i) {
    t = t || 0, n = n || false, i = i || function(A, C, D) {
      return A * Math.pow(2, D) + C;
    };
    var s = t >> 3, o = a(function(A) {
      return n ? ~A & 255 : A;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var l = 0;
    t % 8 + e >= 8 && (l = i(0, o(r[s]) & u, c));
    for (var f = e + t >> 3, y = s + 1; y < f; y++) l = i(l, o(
      r[y]
    ), 8);
    var g = (e + t) % 8;
    return g > 0 && (l = i(l, o(r[f]) >> 8 - g, g)), l;
  }, "parseBits"), Vi = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i = L(r, 1), s = L(r, t, 1);
    if (s === 0) return 0;
    var o = 1, u = a(function(l, f, y) {
      l === 0 && (l = 1);
      for (var g = 1; g <= y; g++) o /= 2, (f & 1 << y - g) > 0 && (l += o);
      return l;
    }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
    return s == Math.pow(
      2,
      t + 1
    ) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), iu = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
  }, "parseInt16"), $i = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(
      r,
      31,
      1,
      true
    ) + 1) : L(r, 31, 1);
  }, "parseInt32"), su = a(function(r) {
    return Vi(r, 23, 8);
  }, "parseFloat32"), ou = a(function(r) {
    return Vi(r, 52, 11);
  }, "parseFloat64"), au = a(function(r) {
    var e = L(r, 16, 32);
    if (e == 49152) return NaN;
    for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i = [], s = L(r, 16), o = 0; o < s; o++) n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, L(
      r,
      16,
      48
    ));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Gi = a(function(r, e) {
    var t = L(e, 1), n = L(
      e,
      63,
      1
    ), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
    return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
      return this.usec;
    }, i.setMicroSeconds = function(s) {
      this.usec = s;
    }, i.getUTCMicroSeconds = function() {
      return this.usec;
    }, i;
  }, "parseDate"), Ke = a(
    function(r) {
      for (var e = L(
        r,
        32
      ), t = L(r, 32, 32), n = L(r, 32, 64), i = 96, s = [], o = 0; o < e; o++) s[o] = L(r, 32, i), i += 32, i += 32;
      var u = a(function(l) {
        var f = L(r, 32, i);
        if (i += 32, f == 4294967295) return null;
        var y;
        if (l == 23 || l == 20) return y = L(r, f * 8, i), i += f * 8, y;
        if (l == 25) return y = r.toString(this.encoding, i >> 3, (i += f << 3) >> 3), y;
        console.log("ERROR: ElementType not implemented: " + l);
      }, "parseElement"), c = a(function(l, f) {
        var y = [], g;
        if (l.length > 1) {
          var A = l.shift();
          for (g = 0; g < A; g++) y[g] = c(l, f);
          l.unshift(A);
        } else for (g = 0; g < l[0]; g++) y[g] = u(f);
        return y;
      }, "parse");
      return c(s, n);
    },
    "parseArray"
  ), uu = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), cu = a(function(r) {
    return r === null ? null : L(r, 8) > 0;
  }, "parseBool"), lu = a(function(r) {
    r(20, nu), r(21, iu), r(23, $i), r(26, $i), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Gi.bind(null, false)), r(1184, Gi.bind(null, true)), r(1e3, Ke), r(1007, Ke), r(1016, Ke), r(1008, Ke), r(1009, Ke), r(25, uu);
  }, "init");
  zi.exports = { init: lu };
});
var Zi = T((Sf, Yi) => {
  p();
  Yi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = T((Ze) => {
  p();
  var fu = Wi(), hu = Ki(), pu = rr(), du = Zi();
  Ze.getTypeParser = yu;
  Ze.setTypeParser = mu;
  Ze.arrayParser = pu;
  Ze.builtins = du;
  var Ye = { text: {}, binary: {} };
  function Ji(r) {
    return String(r);
  }
  a(Ji, "noParse");
  function yu(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Ji;
  }
  a(yu, "getTypeParser");
  function mu(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  a(mu, "setTypeParser");
  fu.init(function(r, e) {
    Ye.text[r] = e;
  });
  hu.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var At = T((If, Xi) => {
  "use strict";
  p();
  var wu = Je();
  function Et(r) {
    this._types = r || wu, this.text = {}, this.binary = {};
  }
  a(Et, "TypeOverrides");
  Et.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  Et.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  Et.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Xi.exports = Et;
});
function Xe(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
    for (let R = 0, j = 0; R < 16; R++, j += 4) A[R] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
    for (let R = 16; R < 64; R++) {
      let j = g(A[R - 15], 7) ^ g(A[R - 15], 18) ^ A[R - 15] >>> 3, le = g(
        A[R - 2],
        17
      ) ^ g(A[R - 2], 19) ^ A[R - 2] >>> 10;
      A[R] = A[R - 16] + j + A[R - 7] + le | 0;
    }
    let I = e, w = t, Z = n, W = i, J = s, X = o, se = u, oe = c;
    for (let R = 0; R < 64; R++) {
      let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), le = J & X ^ ~J & se, de = oe + j + le + y[R] + A[R] | 0, We = g(I, 2) ^ g(
        I,
        13
      ) ^ g(I, 22), fe = I & w ^ I & Z ^ w & Z, _e = We + fe | 0;
      oe = se, se = X, X = J, J = W + de | 0, W = Z, Z = w, w = I, I = de + _e | 0;
    }
    e = e + I | 0, t = t + w | 0, n = n + Z | 0, i = i + W | 0, s = s + J | 0, o = o + X | 0, u = u + se | 0, c = c + oe | 0, f = 0;
  }, "process"), Y = a((I) => {
    typeof I == "string" && (I = new TextEncoder().encode(I));
    for (let w = 0; w < I.length; w++) C[f++] = I[w], f === 64 && D();
    l += I.length;
  }, "add"), P = a(() => {
    if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
      for (; f < 64; ) C[f++] = 0;
      D();
    }
    for (; f < 58; ) C[f++] = 0;
    let I = l * 8;
    C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
    let w = new Uint8Array(
      32
    );
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === void 0 ? { add: Y, digest: P } : (Y(r), P());
}
var es = G(() => {
  "use strict";
  p();
  a(Xe, "sha256");
});
var U;
var et;
var ts = G(() => {
  "use strict";
  p();
  U = class U2 {
    constructor() {
      E(this, "_dataLength", 0);
      E(this, "_bufferLength", 0);
      E(this, "_state", new Int32Array(4));
      E(this, "_buffer", new ArrayBuffer(68));
      E(this, "_buffer8");
      E(this, "_buffer32");
      this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(
        e
      ).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let t = U2.hexChars, n = U2.hexOut, i, s, o, u;
      for (u = 0; u < 4; u += 1) for (s = u * 8, i = e[u], o = 0; o < 8; o += 2) n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(
        i & 15
      ), i >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i = e[1], s = e[2], o = e[3];
      n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
      for (o = 0; o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128) t[i++] = s;
        else if (s < 2048) t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
        else if (s < 55296 || s > 56319) t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
          t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        }
        i >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e.charCodeAt(o++);
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e[o++];
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let t = e.buffer, n = e.state, i = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1) this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i), i.set(U2.buffer32Identity)), o <= 4294967295) i[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null) return;
        let c = parseInt(
          u[2],
          16
        ), l = parseInt(u[1], 16) || 0;
        i[14] = c, i[15] = l;
      }
      return U2._md5cycle(this._state, i), e ? this._state : U2._hex(
        this._state
      );
    }
  };
  a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U());
  et = U;
});
var lr = {};
ie(lr, { createHash: () => bu, createHmac: () => vu, randomBytes: () => gu });
function gu(r) {
  return crypto.getRandomValues(d.alloc(r));
}
function bu(r) {
  if (r === "sha256") return { update: a(function(e) {
    return { digest: a(
      function() {
        return d.from(Xe(e));
      },
      "digest"
    ) };
  }, "update") };
  if (r === "md5") return { update: a(function(e) {
    return {
      digest: a(function() {
        return typeof e == "string" ? et.hashStr(e) : et.hashByteArray(e);
      }, "digest")
    };
  }, "update") };
  throw new Error(`Hash type '${r}' not supported`);
}
function vu(r, e) {
  if (r !== "sha256") throw new Error(`Only sha256 is supported (requested: '${r}')`);
  return { update: a(function(t) {
    return { digest: a(
      function() {
        typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(
          t
        ));
        let n = e.length;
        if (n > 64) e = Xe(e);
        else if (n < 64) {
          let c = new Uint8Array(64);
          c.set(e), e = c;
        }
        let i = new Uint8Array(
          64
        ), s = new Uint8Array(64);
        for (let c = 0; c < 64; c++) i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
        let o = new Uint8Array(t.length + 64);
        o.set(i, 0), o.set(t, 64);
        let u = new Uint8Array(96);
        return u.set(s, 0), u.set(Xe(o), 64), d.from(Xe(u));
      },
      "digest"
    ) };
  }, "update") };
}
var fr = G(() => {
  "use strict";
  p();
  es();
  ts();
  a(gu, "randomBytes");
  a(bu, "createHash");
  a(vu, "createHmac");
});
var tt = T((Qf, hr) => {
  "use strict";
  p();
  hr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), xu = Me.getTypeParser(20, "text"), Su = Me.getTypeParser(
    1016,
    "text"
  );
  hr.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(
      23,
      "text"
    ) : xu), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : Su);
  });
});
var rt = T((Wf, ns) => {
  "use strict";
  p();
  var Eu = (fr(), O(lr)), Au = tt();
  function Cu(r) {
    var e = r.replace(
      /\\/g,
      "\\\\"
    ).replace(/"/g, '\\"');
    return '"' + e + '"';
  }
  a(Cu, "escapeElement");
  function rs(r) {
    for (var e = "{", t = 0; t < r.length; t++) t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + rs(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
    return e = e + "}", e;
  }
  a(rs, "arrayString");
  var Ct = a(function(r, e) {
    if (r == null) return null;
    if (r instanceof d) return r;
    if (ArrayBuffer.isView(r)) {
      var t = d.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? rs(r) : typeof r == "object" ? _u(r, e) : r.toString();
  }, "prepareValue");
  function _u(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), Ct(r.toPostgres(Ct), e);
    }
    return JSON.stringify(r);
  }
  a(_u, "prepareObject");
  function N(r, e) {
    for (r = "" + r; r.length < e; ) r = "0" + r;
    return r;
  }
  a(N, "pad");
  function Iu(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(
      r.getHours(),
      2
    ) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
    return e < 0 ? (i += "-", e *= -1) : i += "+", i += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i += " BC"), i;
  }
  a(Iu, "dateToString");
  function Tu(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(
      r.getUTCMilliseconds(),
      3
    );
    return n += "+00:00", t && (n += " BC"), n;
  }
  a(Tu, "dateToStringUTC");
  function Pu(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  a(Pu, "normalizeQueryConfig");
  var pr = a(function(r) {
    return Eu.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Bu = a(
    function(r, e, t) {
      var n = pr(e + r), i = pr(d.concat([d.from(n), t]));
      return "md5" + i;
    },
    "postgresMd5PasswordHash"
  );
  ns.exports = {
    prepareValue: a(function(e) {
      return Ct(e);
    }, "prepareValueWrapper"),
    normalizeQueryConfig: Pu,
    postgresMd5PasswordHash: Bu,
    md5: pr
  };
});
var nt = {};
ie(nt, { default: () => ku });
var ku;
var it = G(() => {
  "use strict";
  p();
  ku = {};
});
var ds = T((th, ps) => {
  "use strict";
  p();
  var yr = (fr(), O(lr));
  function Mu(r) {
    if (r.indexOf("SCRAM-SHA-256") === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = yr.randomBytes(
      18
    ).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  a(Mu, "startSession");
  function Uu(r, e, t) {
    if (r.message !== "SASLInitialResponse") throw new Error(
      "SASL: Last message was not SASLInitialResponse"
    );
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = qu(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i = d.from(n.salt, "base64"), s = Wu(e, i, n.iteration), o = Ue(s, "Client Key"), u = Nu(
      o
    ), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = Ue(u, y), A = hs(o, g), C = A.toString("base64"), D = Ue(s, "Server Key"), Y = Ue(D, y);
    r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
  }
  a(Uu, "continueSession");
  function Du(r, e) {
    if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = Qu(
      e
    );
    if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  a(Du, "finalizeSession");
  function Ou(r) {
    if (typeof r != "string") throw new TypeError("SASL: text must be a string");
    return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  a(Ou, "isPrintableChars");
  function ls(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  a(ls, "isBase64");
  function fs(r) {
    if (typeof r != "string") throw new TypeError("SASL: attribute pairs text must be a string");
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  a(fs, "parseAttributePairs");
  function qu(r) {
    let e = fs(r), t = e.get("r");
    if (t) {
      if (!Ou(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ls(n)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i = e.get("i");
    if (i) {
      if (!/^[1-9][0-9]*$/.test(i)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  a(qu, "parseServerFirstMessage");
  function Qu(r) {
    let t = fs(r).get("v");
    if (t) {
      if (!ls(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    return { serverSignature: t };
  }
  a(Qu, "parseServerFinalMessage");
  function hs(r, e) {
    if (!d.isBuffer(r)) throw new TypeError("first argument must be a Buffer");
    if (!d.isBuffer(e)) throw new TypeError(
      "second argument must be a Buffer"
    );
    if (r.length !== e.length) throw new Error("Buffer lengths must match");
    if (r.length === 0) throw new Error("Buffers cannot be empty");
    return d.from(r.map((t, n) => r[n] ^ e[n]));
  }
  a(hs, "xorBuffers");
  function Nu(r) {
    return yr.createHash("sha256").update(r).digest();
  }
  a(Nu, "sha256");
  function Ue(r, e) {
    return yr.createHmac("sha256", r).update(e).digest();
  }
  a(Ue, "hmacSha256");
  function Wu(r, e, t) {
    for (var n = Ue(
      r,
      d.concat([e, d.from([0, 0, 0, 1])])
    ), i = n, s = 0; s < t - 1; s++) n = Ue(r, n), i = hs(i, n);
    return i;
  }
  a(Wu, "Hi");
  ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
});
var mr = {};
ie(mr, { join: () => ju });
function ju(...r) {
  return r.join("/");
}
var wr = G(() => {
  "use strict";
  p();
  a(
    ju,
    "join"
  );
});
var gr = {};
ie(gr, { stat: () => Hu });
function Hu(r, e) {
  e(new Error("No filesystem"));
}
var br = G(() => {
  "use strict";
  p();
  a(Hu, "stat");
});
var vr = {};
ie(vr, { default: () => $u });
var $u;
var xr = G(() => {
  "use strict";
  p();
  $u = {};
});
var ys = {};
ie(ys, { StringDecoder: () => Sr });
var Er;
var Sr;
var ms = G(() => {
  "use strict";
  p();
  Er = class Er {
    constructor(e) {
      E(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(Er, "StringDecoder");
  Sr = Er;
});
var vs = T((fh, bs) => {
  "use strict";
  p();
  var { Transform: Gu } = (xr(), O(vr)), { StringDecoder: Vu } = (ms(), O(ys)), ve = /* @__PURE__ */ Symbol(
    "last"
  ), It = /* @__PURE__ */ Symbol("decoder");
  function zu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[It].write(r).split(
        this.matcher
      ), n.length === 1) return t();
      n.shift(), this.overflow = false;
    } else this[ve] += this[It].write(r), n = this[ve].split(this.matcher);
    this[ve] = n.pop();
    for (let i = 0; i < n.length; i++) try {
      gs(this, this.mapper(n[i]));
    } catch (s) {
      return t(s);
    }
    if (this.overflow = this[ve].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error(
        "maximum buffer reached"
      ));
      return;
    }
    t();
  }
  a(zu, "transform");
  function Ku(r) {
    if (this[ve] += this[It].end(), this[ve])
      try {
        gs(this, this.mapper(this[ve]));
      } catch (e) {
        return r(e);
      }
    r();
  }
  a(Ku, "flush");
  function gs(r, e) {
    e !== void 0 && r.push(e);
  }
  a(gs, "push");
  function ws(r) {
    return r;
  }
  a(ws, "noop");
  function Yu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
    let n = new Gu(t);
    return n[ve] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
      this._writableState.errorEmitted = false, s(i);
    }, n;
  }
  a(Yu, "split");
  bs.exports = Yu;
});
var Es = T((dh, pe) => {
  "use strict";
  p();
  var xs = (wr(), O(mr)), Zu = (xr(), O(vr)).Stream, Ju = vs(), Ss = (it(), O(nt)), Xu = 5432, Tt = m.platform === "win32", st = m.stderr, ec = 56, tc = 7, rc = 61440, nc = 32768;
  function ic(r) {
    return (r & rc) == nc;
  }
  a(ic, "isRegFile");
  var De = ["host", "port", "database", "user", "password"], Ar = De.length, sc = De[Ar - 1];
  function Cr() {
    var r = st instanceof Zu && st.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      st.write(Ss.format.apply(Ss, e));
    }
  }
  a(Cr, "warn");
  Object.defineProperty(pe.exports, "isWin", { get: a(function() {
    return Tt;
  }, "get"), set: a(function(r) {
    Tt = r;
  }, "set") });
  pe.exports.warnTo = function(r) {
    var e = st;
    return st = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec | tc) ? (Cr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Cr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var oc = pe.exports.match = function(r, e) {
    return De.slice(0, -1).reduce(function(t, n, i) {
      return i == 1 && Number(r[n] || Xu) === Number(
        e[n]
      ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i = e.pipe(
      Ju()
    );
    function s(c) {
      var l = ac(c);
      l && uc(l) && oc(r, l) && (n = l[sc], i.end());
    }
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), Cr("WARNING: error on reading file: %s", c), t(
        void 0
      );
    }, "onErr");
    e.on("error", u), i.on("data", s).on("end", o).on("error", u);
  };
  var ac = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/)) return null;
    for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(
      function(f, y, g) {
        var A = r.substring(y, g);
        Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[De[f]] = A;
      },
      "addToObj"
    ), l = 0; l < r.length - 1; l += 1) {
      if (e = r.charAt(l + 1), t = r.charAt(
        l
      ), u = n == Ar - 1, u) {
        c(n, i);
        break;
      }
      l >= 0 && e == ":" && t !== "\\" && (c(n, i, l + 1), i = l + 2, n += 1);
    }
    return o = Object.keys(o).length === Ar ? o : null, o;
  }, uc = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0; t < De.length; t += 1) {
      var n = e[t], i = r[De[t]] || "", s = n(i);
      if (!s) return false;
    }
    return true;
  };
});
var Cs = T((gh, _r) => {
  "use strict";
  p();
  var wh = (wr(), O(mr)), As = (br(), O(gr)), Pt = Es();
  _r.exports = function(r, e) {
    var t = Pt.getFileName();
    As.stat(t, function(n, i) {
      if (n || !Pt.usePgPass(i, t)) return e(void 0);
      var s = As.createReadStream(
        t
      );
      Pt.getPassword(r, s, e);
    });
  };
  _r.exports.warnTo = Pt.warnTo;
});
var _s = {};
ie(_s, { default: () => cc });
var cc;
var Is = G(() => {
  "use strict";
  p();
  cc = {};
});
var Ps = T((xh, Ts) => {
  "use strict";
  p();
  var lc = (Zt(), O(gi)), Ir = (br(), O(gr));
  function Tr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
    for (var n in t) Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i = (e.auth || ":").split(":");
    if (t.user = i[0], t.password = i.splice(1).join(
      ":"
    ), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(
      0
    ) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Ir.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Ir.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Ir.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  a(Tr, "parse");
  Ts.exports = Tr;
  Tr.parse = Tr;
});
var Bt = T((Ah, Ls) => {
  "use strict";
  p();
  var fc = (Is(), O(_s)), Rs = tt(), Bs = Ps().parse, H = a(function(r, e, t) {
    return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Rs[r];
  }, "val"), hc = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return Rs.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(function(r) {
    return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }, "quoteParamValue"), ne = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Oe(n));
  }, "add"), Br = class Br {
    constructor(e) {
      e = typeof e == "string" ? Bs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Bs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: H("password", e)
      }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne(t, this, "user"), ne(t, this, "password"), ne(t, this, "port"), ne(t, this, "application_name"), ne(
        t,
        this,
        "fallback_application_name"
      ), ne(t, this, "connect_timeout"), ne(t, this, "options");
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne(t, n, "sslmode"), ne(t, n, "sslca"), ne(t, n, "sslkey"), ne(t, n, "sslcert"), ne(t, n, "sslrootcert"), this.database && t.push("dbname=" + Oe(this.database)), this.replication && t.push("replication=" + Oe(this.replication)), this.host && t.push("host=" + Oe(this.host)), this.isDomainSocket) return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Oe(this.client_encoding)), fc.lookup(this.host, function(i, s) {
        return i ? e(i, null) : (t.push("hostaddr=" + Oe(s)), e(null, t.join(" ")));
      });
    }
  };
  a(Br, "ConnectionParameters");
  var Pr = Br;
  Ls.exports = Pr;
});
var Ms = T((Ih, ks) => {
  "use strict";
  p();
  var pc = Je(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Lr = class Lr {
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(
        t[2],
        10
      ), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(
        e.length
      ), n = 0, i = e.length; n < i; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i = e.length; n < i; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](
          s
        ) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0; t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(Lr, "Result");
  var Rr = Lr;
  ks.exports = Rr;
});
var qs = T((Bh, Os) => {
  "use strict";
  p();
  var { EventEmitter: dc } = ge(), Us = Ms(), Ds = rt(), kr = class kr extends dc {
    constructor(e, t, n) {
      super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(
            e.fields
          );
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(
        e
      ), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback) return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError) return this.handleError(
        this._canceledDueToError,
        e
      );
      if (this.callback) try {
        this.callback(null, this._results);
      } catch (t) {
        m.nextTick(() => {
          throw t;
        });
      }
      this.emit(
        "end",
        this._results
      );
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string") return new Error(
        "A query must have either text or a name. Supplying neither is unsupported."
      );
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {
    }
  };
  a(kr, "Query");
  var Fr = kr;
  Os.exports = Fr;
});
var ln = T((_) => {
  "use strict";
  p();
  Object.defineProperty(_, "__esModule", { value: true });
  _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = void 0;
  _.parseComplete = { name: "parseComplete", length: 5 };
  _.bindComplete = { name: "bindComplete", length: 5 };
  _.closeComplete = { name: "closeComplete", length: 5 };
  _.noData = { name: "noData", length: 5 };
  _.portalSuspended = { name: "portalSuspended", length: 5 };
  _.replicationStart = { name: "replicationStart", length: 4 };
  _.emptyQuery = { name: "emptyQuery", length: 4 };
  _.copyDone = { name: "copyDone", length: 4 };
  var Kr = class Kr extends Error {
    constructor(e, t, n) {
      super(e), this.length = t, this.name = n;
    }
  };
  a(Kr, "DatabaseError");
  var Mr = Kr;
  _.DatabaseError = Mr;
  var Yr = class Yr {
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Yr, "CopyDataMessage");
  var Ur = Yr;
  _.CopyDataMessage = Ur;
  var Zr = class Zr {
    constructor(e, t, n, i) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
    }
  };
  a(Zr, "CopyResponse");
  var Dr = Zr;
  _.CopyResponse = Dr;
  var Jr = class Jr {
    constructor(e, t, n, i, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Jr, "Field");
  var Or = Jr;
  _.Field = Or;
  var Xr = class Xr {
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
    }
  };
  a(Xr, "RowDescriptionMessage");
  var qr = Xr;
  _.RowDescriptionMessage = qr;
  var en = class en {
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(en, "ParameterDescriptionMessage");
  var Qr = en;
  _.ParameterDescriptionMessage = Qr;
  var tn = class tn {
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(tn, "ParameterStatusMessage");
  var Nr = tn;
  _.ParameterStatusMessage = Nr;
  var rn = class rn {
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(rn, "AuthenticationMD5Password");
  var Wr = rn;
  _.AuthenticationMD5Password = Wr;
  var nn = class nn {
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(nn, "BackendKeyDataMessage");
  var jr = nn;
  _.BackendKeyDataMessage = jr;
  var sn = class sn {
    constructor(e, t, n, i) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
    }
  };
  a(sn, "NotificationResponseMessage");
  var Hr = sn;
  _.NotificationResponseMessage = Hr;
  var on = class on {
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a(on, "ReadyForQueryMessage");
  var $r = on;
  _.ReadyForQueryMessage = $r;
  var an = class an {
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(an, "CommandCompleteMessage");
  var Gr = an;
  _.CommandCompleteMessage = Gr;
  var un = class un {
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(un, "DataRowMessage");
  var Vr = un;
  _.DataRowMessage = Vr;
  var cn = class cn {
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(cn, "NoticeMessage");
  var zr = cn;
  _.NoticeMessage = zr;
});
var Qs = T((Rt) => {
  "use strict";
  p();
  Object.defineProperty(Rt, "__esModule", { value: true });
  Rt.Writer = void 0;
  var hn = class hn {
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
    }
    ensure(e) {
      if (this.buffer.length - this.offset < e) {
        let n = this.buffer, i = n.length + (n.length >> 1) + e;
        this.buffer = d.allocUnsafe(i), n.copy(
          this.buffer
        );
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e) this.ensure(1);
      else {
        let t = d.byteLength(e);
        this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      let t = d.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(
        e.length
      ), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      let t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
    }
  };
  a(hn, "Writer");
  var fn = hn;
  Rt.Writer = fn;
});
var Ws = T((Ft) => {
  "use strict";
  p();
  Object.defineProperty(Ft, "__esModule", { value: true });
  Ft.serialize = void 0;
  var pn = Qs(), F = new pn.Writer(), yc = a((r) => {
    F.addInt16(3).addInt16(0);
    for (let n of Object.keys(r)) F.addCString(
      n
    ).addCString(r[n]);
    F.addCString("client_encoding").addCString("UTF8");
    let e = F.addCString("").flush(), t = e.length + 4;
    return new pn.Writer().addInt32(t).add(e).flush();
  }, "startup"), mc = a(() => {
    let r = d.allocUnsafe(
      8
    );
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), wc = a((r) => F.addCString(r).flush(
    112
  ), "password"), gc = a(function(r, e) {
    return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
  }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
    return F.addString(r).flush(112);
  }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || Ns, n = t.length, i = F.addCString(e).addCString(r.text).addInt16(n);
    for (let s = 0; s < n; s++) i.addInt32(t[s]);
    return F.flush(80);
  }, "parse"), qe = new pn.Writer(), Sc = a(function(r, e) {
    for (let t = 0; t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (F.addInt16(0), qe.addInt32(-1)) : n instanceof d ? (F.addInt16(
        1
      ), qe.addInt32(n.length), qe.add(n)) : (F.addInt16(0), qe.addInt32(d.byteLength(n)), qe.addString(n));
    }
  }, "writeValues"), Ec = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || Ns, s = i.length;
    return F.addCString(e).addCString(t), F.addInt16(s), Sc(i, r.valueMapper), F.addInt16(s), F.add(qe.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
  }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
    if (!r || !r.portal && !r.rows) return Ac;
    let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i);
    return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), _c2 = a(
    (r, e) => {
      let t = d.allocUnsafe(16);
      return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(
        5678,
        6
      ), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
    },
    "cancel"
  ), dn = a((r, e) => {
    let n = 4 + d.byteLength(e) + 1, i = d.allocUnsafe(1 + n);
    return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
  }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? dn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Bc = a((r) => {
    let e = `${r.type}${r.name || ""}`;
    return dn(67, e);
  }, "close"), Rc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => dn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
    startup: yc,
    password: wc,
    requestSsl: mc,
    sendSASLInitialResponseMessage: gc,
    sendSCRAMClientFinalMessage: bc,
    query: vc,
    parse: xc,
    bind: Ec,
    execute: Cc,
    describe: Pc,
    close: Bc,
    flush: a(
      () => Fc,
      "flush"
    ),
    sync: a(() => kc, "sync"),
    end: a(() => Mc, "end"),
    copyData: Rc,
    copyDone: a(() => Uc, "copyDone"),
    copyFail: Lc,
    cancel: _c2
  };
  Ft.serialize = Dc;
});
var js = T((kt) => {
  "use strict";
  p();
  Object.defineProperty(kt, "__esModule", { value: true });
  kt.BufferReader = void 0;
  var Oc = d.allocUnsafe(0), mn = class mn {
    constructor(e = 0) {
      this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(
        this.offset
      );
      return this.offset += 4, e;
    }
    uint32() {
      let e = this.buffer.readUInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (; this.buffer[t++] !== 0; ) ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(mn, "BufferReader");
  var yn = mn;
  kt.BufferReader = yn;
});
var Gs = T((Mt) => {
  "use strict";
  p();
  Object.defineProperty(Mt, "__esModule", { value: true });
  Mt.Parser = void 0;
  var k = ln(), qc = js(), wn = 1, Qc = 4, Hs = wn + Qc, $s = d.allocUnsafe(0), bn = class bn {
    constructor(e) {
      if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader(), e?.mode === "binary") throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
      for (; i + Hs <= n; ) {
        let s = this.buffer[i], o = this.buffer.readUInt32BE(
          i + wn
        ), u = wn + o;
        if (u + i <= n) {
          let c = this.handlePacket(i + Hs, s, o, this.buffer);
          t(c), i += u;
        } else break;
      }
      i === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (; t >= s; ) s *= 2;
            i = d.allocUnsafe(s);
          }
          this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i) {
      switch (t) {
        case 50:
          return k.bindComplete;
        case 49:
          return k.parseComplete;
        case 51:
          return k.closeComplete;
        case 110:
          return k.noData;
        case 115:
          return k.portalSuspended;
        case 99:
          return k.copyDone;
        case 87:
          return k.replicationStart;
        case 73:
          return k.emptyQuery;
        case 68:
          return this.parseDataRowMessage(e, n, i);
        case 67:
          return this.parseCommandCompleteMessage(
            e,
            n,
            i
          );
        case 90:
          return this.parseReadyForQueryMessage(e, n, i);
        case 65:
          return this.parseNotificationMessage(
            e,
            n,
            i
          );
        case 82:
          return this.parseAuthenticationResponse(e, n, i);
        case 83:
          return this.parseParameterStatusMessage(
            e,
            n,
            i
          );
        case 75:
          return this.parseBackendKeyData(e, n, i);
        case 69:
          return this.parseErrorMessage(e, n, i, "error");
        case 78:
          return this.parseErrorMessage(e, n, i, "notice");
        case 84:
          return this.parseRowDescriptionMessage(
            e,
            n,
            i
          );
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i);
        case 71:
          return this.parseCopyInMessage(
            e,
            n,
            i
          );
        case 72:
          return this.parseCopyOutMessage(e, n, i);
        case 100:
          return this.parseCopyData(e, n, i);
        default:
          return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.string(1);
      return new k.ReadyForQueryMessage(t, i);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring();
      return new k.CommandCompleteMessage(t, i);
    }
    parseCopyData(e, t, n) {
      let i = n.slice(e, e + (t - 4));
      return new k.CopyDataMessage(t, i);
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(
        e,
        t,
        n,
        "copyInResponse"
      );
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i, s, o);
      for (let c = 0; c < o; c++) u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new k.NotificationResponseMessage(t, i, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int16(), s = new k.RowDescriptionMessage(t, i);
      for (let o = 0; o < i; o++) s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new k.Field(e, t, n, i, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i);
      for (let o = 0; o < i; o++)
        s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new Array(i);
      for (let o = 0; o < i; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new k.DataRowMessage(t, s);
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring(), s = this.reader.cstring();
      return new k.ParameterStatusMessage(
        t,
        i,
        s
      );
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.int32();
      return new k.BackendKeyDataMessage(t, i, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let o = this.reader.bytes(4);
            return new k.AuthenticationMD5Password(t, o);
          }
          break;
        case 10:
          {
            s.name = "authenticationSASL", s.mechanisms = [];
            let o;
            do
              o = this.reader.cstring(), o && s.mechanisms.push(o);
            while (o);
          }
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (; o !== "\0"; ) s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(bn, "Parser");
  var gn = bn;
  Mt.Parser = gn;
});
var vn = T((xe) => {
  "use strict";
  p();
  Object.defineProperty(xe, "__esModule", { value: true });
  xe.DatabaseError = xe.serialize = xe.parse = void 0;
  var Nc = ln();
  Object.defineProperty(xe, "DatabaseError", { enumerable: true, get: a(
    function() {
      return Nc.DatabaseError;
    },
    "get"
  ) });
  var Wc = Ws();
  Object.defineProperty(xe, "serialize", {
    enumerable: true,
    get: a(function() {
      return Wc.serialize;
    }, "get")
  });
  var jc = Gs();
  function Hc(r, e) {
    let t = new jc.Parser();
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  a(Hc, "parse");
  xe.parse = Hc;
});
var Vs = {};
ie(Vs, { connect: () => $c });
function $c({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
var zs = G(
  () => {
    "use strict";
    p();
    a($c, "connect");
  }
);
var En = T((Xh, Zs) => {
  "use strict";
  p();
  var Ks = (Fe(), O(wi)), Gc = ge().EventEmitter, { parse: Vc, serialize: Q } = vn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), Sn = class Sn extends Gc {
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new Ks.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
      });
      let i = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl) return this.attachListeners(
        this.stream
      );
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (zs(), O(Vs));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (l) {
          return n.emit(
            "error",
            l
          );
        }
        n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on(
        "end",
        () => {
          this.emit("end");
        }
      ), Vc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(e, t));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(
        e
      ));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(e));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Ys);
    }
    sync() {
      this._ending = true, this._send(Ys), this._send(zc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(Kc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(Sn, "Connection");
  var xn = Sn;
  Zs.exports = xn;
});
var eo = T((np, Xs) => {
  "use strict";
  p();
  var Yc = ge().EventEmitter, rp = (it(), O(nt)), Zc = rt(), An = ds(), Jc = Cs(), Xc = At(), el = Bt(), Js = qs(), tl = tt(), rl = En(), Cn = class Cn extends Yc {
    constructor(e) {
      super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(
        this,
        "password",
        { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }
      ), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a((n) => {
        m.nextTick(() => {
          n.handleError(e, this.connection);
        });
      }, "enqueueError");
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(
          () => {
            e(i);
          }
        );
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(
        n
      ), n.once("end", () => {
        let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i) => {
          i ? n(i) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(
        this
      )), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
        if (n !== void 0) {
          if (typeof n != "string") {
            t.emit("error", new TypeError(
              "Password must be a string"
            ));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : Jc(
        this.connectionParameters,
        (n) => {
          n !== void 0 && (this.connectionParameters.password = this.password = n), e();
        }
      );
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(
        () => {
          let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
          this.connection.password(t);
        }
      );
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = An.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e) {
      An.continueSession(
        this.saslSession,
        this.password,
        e.data
      ), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
    _handleAuthSASLFinal(e) {
      An.finalizeSession(this.saslSession, e.data), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(e);
        return;
      }
      this.activeQuery = null, t.handleError(
        e,
        this.connection
      );
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(e);
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(
        e,
        this.connection
      );
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(
            e.processID,
            e.secretKey
          );
        });
      } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(/"/g, '""') + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i = 0; i < e.length; i++) {
        var s = e[i];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
        this.readyForQuery = false, this.hasExecuted = true;
        let e = this.activeQuery.submit(this.connection);
        e && m.nextTick(() => {
          this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
        });
      } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i, s, o, u, c;
      if (e == null) throw new TypeError(
        "Client was passed a null or undefined query"
      );
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Js(e, t, n), i.callback || (s = new this._Promise((l, f) => {
        i.callback = (y, g) => y ? f(y) : l(g);
      }))), o && (c = i.callback, u = setTimeout(() => {
        var l = new Error("Query read timeout");
        m.nextTick(
          () => {
            i.handleError(l, this.connection);
          }
        ), c(l), i.callback = () => {
        };
        var f = this.queryQueue.indexOf(i);
        f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
      }, o), i.callback = (l, f) => {
        clearTimeout(u), c(l, f);
      }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i.handleError(new Error("Client was closed and is not queryable"), this.connection);
      }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(() => {
        i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
      }), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting) if (e) e();
      else return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
      else return new this._Promise((t) => {
        this.connection.once("end", t);
      });
    }
  };
  a(Cn, "Client");
  var Ut = Cn;
  Ut.Query = Js;
  Xs.exports = Ut;
});
var io = T((op, no) => {
  "use strict";
  p();
  var nl = ge().EventEmitter, to = a(function() {
  }, "NOOP"), ro = a((r, e) => {
    let t = r.findIndex(e);
    return t === -1 ? void 0 : r.splice(t, 1)[0];
  }, "removeWhere"), Tn = class Tn {
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(Tn, "IdleItem");
  var _n = Tn, Pn = class Pn {
    constructor(e) {
      this.callback = e;
    }
  };
  a(Pn, "PendingItem");
  var Qe = Pn;
  function il() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  a(il, "throwOnDoubleRelease");
  function Dt(r, e) {
    if (e)
      return { callback: e, result: void 0 };
    let t, n, i = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(o), o;
    });
    return { callback: i, result: s };
  }
  a(Dt, "promisify");
  function sl(r, e) {
    return a(function t(n) {
      n.client = e, e.removeListener("error", t), e.on("error", () => {
        r.log(
          "additional client error after disconnection due to error",
          n
        );
      }), r._remove(e), r.emit("error", n, e);
    }, "idleListener");
  }
  a(sl, "makeIdleListener");
  var Bn = class Bn extends nl {
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: e.password
      }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t || ot().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _isAboveMin() {
      return this._clients.length > this.options.min;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
          this._remove(t.client);
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(
          t.timeoutId
        );
        let n = t.client;
        n.ref && n.ref();
        let i = t.idleListener;
        return this._acquireClient(n, e, i, false);
      }
      if (!this._isFull()) return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = ro(
        this._idle,
        (n) => n.client === e
      );
      t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter(
        (n) => n !== e
      ), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i) : this.Promise.reject(i);
      }
      let t = Dt(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis) return this._pendingQueue.push(new Qe(t.callback)), n;
        let i = a((u, c, l) => {
          clearTimeout(o), t.callback(u, c, l);
        }, "queueCallback"), s = new Qe(i), o = setTimeout(() => {
          ro(
            this._pendingQueue,
            (u) => u.callback === i
          ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return o.unref && o.unref(), this._pendingQueue.push(s), n;
      }
      return this.newClient(new Qe(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(
        t
      );
      let n = sl(this, t);
      this.log("checking client timeout");
      let i, s = false;
      this.options.connectionTimeoutMillis && (i = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i && clearTimeout(i), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, void 0, to);
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(
                t,
                new Qe((l, f, y) => y()),
                n,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u.unref(), t.once("end", () => clearTimeout(u));
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i) {
      i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
        if (s) return e.release(s), t.callback(s, void 0, to);
        t.callback(void 0, e, e.release);
      }) : t.callback(void 0, e, e.release);
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i) => {
        n && il(), n = true, this._release(e, t, i);
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new _n(
        e,
        t,
        s
      )), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = Dt(this.Promise, e);
        return v(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = void 0);
      let i = Dt(this.Promise, n);
      return n = i.callback, this.connect((s, o) => {
        if (s) return n(s);
        let u = false, c = a((l) => {
          u || (u = true, o.release(l), n(l));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (l, f) => {
            if (this.log("query dispatched"), o.removeListener(
              "error",
              c
            ), !u) return u = true, o.release(l), l ? n(l) : n(void 0, f);
          });
        } catch (l) {
          return o.release(l), n(l);
        }
      }), i.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = Dt(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Bn, "Pool");
  var In = Bn;
  no.exports = In;
});
var so = {};
ie(so, { default: () => ol });
var ol;
var oo = G(() => {
  "use strict";
  p();
  ol = {};
});
var ao = T((lp, al) => {
  al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
    async: "2.6.4",
    bluebird: "3.5.2",
    co: "4.6.0",
    "pg-copy-streams": "0.3.0"
  }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var lo = T((fp, co) => {
  "use strict";
  p();
  var uo = ge().EventEmitter, ul = (it(), O(nt)), Rn = rt(), Ne = co.exports = function(r, e, t) {
    uo.call(this), r = Rn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  ul.inherits(Ne, uo);
  var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Ne.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e) for (var t in e) {
      var n = cl[t] || t;
      r[n] = e[t];
    }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  Ne.prototype.then = function(r, e) {
    return this._getPromise().then(
      r,
      e
    );
  };
  Ne.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  Ne.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once("error", e);
    }.bind(this)), this._promise);
  };
  Ne.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(function(s, o, u) {
      if (r.native.arrayMode = false, v(function() {
        e.emit("_done");
      }), s) return e.handleError(s);
      e._emitRowEvents && (u.length > 1 ? o.forEach(
        (c, l) => {
          c.forEach((f) => {
            e.emit("row", f, u[l]);
          });
        }
      ) : o.forEach(function(c) {
        e.emit("row", c, u);
      })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
    }, "after");
    if (m.domain && (t = m.domain.bind(t)), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(Rn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(this.name, this.text, n.length, function(s) {
        return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
      });
    } else if (this.values) {
      if (!Array.isArray(
        this.values
      )) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i = this.values.map(Rn.prepareValue);
      r.native.query(this.text, i, t);
    } else r.native.query(this.text, t);
  };
});
var yo = T((yp, po) => {
  "use strict";
  p();
  var ll = (oo(), O(so)), fl = At(), dp = ao(), fo = ge().EventEmitter, hl = (it(), O(nt)), pl = Bt(), ho = lo(), K = po.exports = function(r) {
    fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new pl(r);
    this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  K.Query = ho;
  hl.inherits(K, fo);
  K.prototype._errorAllQueries = function(r) {
    let e = a((t) => {
      m.nextTick(() => {
        t.native = this.native, t.handleError(r);
      });
    }, "enqueueError");
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  K.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t) return r(t);
      e.native.connect(n, function(i) {
        if (i) return e.native.end(), r(i);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  K.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise((e, t) => {
      this._connect((n) => {
        n ? t(n) : e();
      });
    });
  };
  K.prototype.query = function(r, e, t) {
    var n, i, s, o, u;
    if (r == null) throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
      let c, l;
      i = new this._Promise((f, y) => {
        c = f, l = y;
      }), n.callback = (f, y) => f ? l(f) : c(y);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error(
        "Query read timeout"
      );
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {
      };
      var l = this._queryQueue.indexOf(n);
      l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, l) => {
      clearTimeout(o), u(c, l);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client has encountered a connection error and is not queryable"));
    }), i);
  };
  K.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
    var t;
    return r || (t = new this._Promise(function(n, i) {
      r = a((s) => s ? i(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  K.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  K.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once("_done", function() {
        t._pulseQueryQueue();
      });
    }
  };
  K.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  K.prototype.ref = function() {
  };
  K.prototype.unref = function() {
  };
  K.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(
      r,
      e,
      t
    );
  };
  K.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var Ln = T((gp, mo) => {
  "use strict";
  p();
  mo.exports = yo();
});
var ot = T((vp, at) => {
  "use strict";
  p();
  var dl = eo(), yl = tt(), ml = En(), wl = io(), { DatabaseError: gl } = vn(), bl = a(
    (r) => {
      var e;
      return e = class extends wl {
        constructor(n) {
          super(n, r);
        }
      }, a(e, "BoundPool"), e;
    },
    "poolFactory"
  ), Fn = a(
    function(r) {
      this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = Je(), this.DatabaseError = gl;
    },
    "PG"
  );
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? at.exports = new Fn(Ln()) : (at.exports = new Fn(dl), Object.defineProperty(at.exports, "native", {
    configurable: true,
    enumerable: false,
    get() {
      var r = null;
      try {
        r = new Fn(Ln());
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") throw e;
      }
      return Object.defineProperty(at.exports, "native", { value: r }), r;
    }
  }));
});
p();
p();
Fe();
Zt();
p();
var pa = Object.defineProperty;
var da = Object.defineProperties;
var ya = Object.getOwnPropertyDescriptors;
var bi = Object.getOwnPropertySymbols;
var ma = Object.prototype.hasOwnProperty;
var wa = Object.prototype.propertyIsEnumerable;
var vi = a(
  (r, e, t) => e in r ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t,
  "__defNormalProp"
);
var ga = a((r, e) => {
  for (var t in e || (e = {})) ma.call(e, t) && vi(r, t, e[t]);
  if (bi) for (var t of bi(e)) wa.call(e, t) && vi(r, t, e[t]);
  return r;
}, "__spreadValues");
var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
var va = 1008e3;
var xi = new Uint8Array(
  new Uint16Array([258]).buffer
)[0] === 2;
var xa = new TextDecoder();
var Jt = new TextEncoder();
var yt = Jt.encode("0123456789abcdef");
var mt = Jt.encode("0123456789ABCDEF");
var Sa = Jt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var Si = Sa.slice();
Si[62] = 45;
Si[63] = 95;
var He;
var wt;
function Ea(r, { alphabet: e, scratchArr: t } = {}) {
  if (!He) if (He = new Uint16Array(256), wt = new Uint16Array(256), xi) for (let C = 0; C < 256; C++) He[C] = yt[C & 15] << 8 | yt[C >>> 4], wt[C] = mt[C & 15] << 8 | mt[C >>> 4];
  else for (let C = 0; C < 256; C++) He[C] = yt[C & 15] | yt[C >>> 4] << 8, wt[C] = mt[C & 15] | mt[C >>> 4] << 8;
  r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
  let n = r.length, i = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(
    r.buffer,
    r.byteOffset,
    s
  ), c = new Uint32Array(o.buffer, o.byteOffset, i), l = e === "upper" ? wt : He, f = 0, y = 0, g;
  if (xi)
    for (; f < s; ) g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
  else for (; f < s; )
    g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
  for (f <<= 2; f < n; ) o[f] = l[r[f++]];
  return xa.decode(o.subarray(0, n));
}
a(Ea, "_toHex");
function Aa(r, e = {}) {
  let t = "", n = r.length, i = va >>> 1, s = Math.ceil(n / i), o = new Uint16Array(s > 1 ? i : n);
  for (let u = 0; u < s; u++) {
    let c = u * i, l = c + i;
    t += Ea(r.subarray(c, l), ba(ga(
      {},
      e
    ), { scratchArr: o }));
  }
  return t;
}
a(Aa, "_toHexChunked");
function Ei(r, e = {}) {
  return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
}
a(Ei, "toHex");
p();
var gt = class gt2 {
  constructor(e, t) {
    this.strings = e;
    this.values = t;
  }
  toParameterizedQuery(e = { query: "", params: [] }) {
    let { strings: t, values: n } = this;
    for (let i = 0, s = t.length; i < s; i++) if (e.query += t[i], i < n.length) {
      let o = n[i];
      if (o instanceof Ge) e.query += o.sql;
      else if (o instanceof Ce) if (o.queryData instanceof gt2) o.queryData.toParameterizedQuery(
        e
      );
      else {
        if (o.queryData.params?.length) throw new Error("This query is not composable");
        e.query += o.queryData.query;
      }
      else {
        let { params: u } = e;
        u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
      }
    }
    return e;
  }
};
a(gt, "SqlTemplate");
var $e = gt;
var Xt = class Xt2 {
  constructor(e) {
    this.sql = e;
  }
};
a(Xt, "UnsafeRawSql");
var Ge = Xt;
p();
function bt() {
  typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
}
a(bt, "warnIfBrowser");
Fe();
var as = Se(At());
var us = Se(rt());
var _t = class _t2 extends Error {
  constructor(t) {
    super(t);
    E(this, "name", "NeonDbError");
    E(this, "severity");
    E(this, "code");
    E(this, "detail");
    E(this, "hint");
    E(this, "position");
    E(this, "internalPosition");
    E(
      this,
      "internalQuery"
    );
    E(this, "where");
    E(this, "schema");
    E(this, "table");
    E(this, "column");
    E(this, "dataType");
    E(this, "constraint");
    E(this, "file");
    E(this, "line");
    E(this, "routine");
    E(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
  }
};
a(
  _t,
  "NeonDbError"
);
var be = _t;
var is = "transaction() expects an array of queries, or a function returning an array of queries";
var Ru = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Lu(r) {
  return r instanceof d ? "\\x" + Ei(r) : r;
}
a(Lu, "encodeBuffersAsBytea");
function ss(r) {
  let { query: e, params: t } = r instanceof $e ? r.toParameterizedQuery() : r;
  return { query: e, params: t.map((n) => Lu((0, us.prepareValue)(n))) };
}
a(ss, "prepareQuery");
function cs(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i,
  readOnly: s,
  deferrable: o,
  authToken: u,
  disableWarningInBrowsers: c
} = {}) {
  if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l;
  try {
    l = Yt(r);
  } catch {
    throw new Error(
      "Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r)
    );
  }
  let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
  if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function D(P, ...I) {
    if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I))) throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
    return new Ce(
      Y,
      new $e(P, I)
    );
  }
  a(D, "templateFn"), D.query = (P, I, w) => new Ce(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ge(
    P
  ), D.transaction = async (P, I) => {
    if (typeof P == "function" && (P = P(D)), !Array.isArray(P)) throw new Error(is);
    P.forEach((W) => {
      if (!(W instanceof Ce)) throw new Error(is);
    });
    let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
    return Y(w, Z, I);
  };
  async function Y(P, I, w) {
    let { fetchEndpoint: Z, fetchFunction: W } = ce, J = Array.isArray(
      P
    ) ? { queries: P.map((ee) => ss(ee)) } : ss(P), X = n ?? {}, se = e ?? false, oe = t ?? false, R = i, j = s, le = o;
    w !== void 0 && (w.fetchOptions !== void 0 && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== void 0 && (se = w.arrayMode), w.fullResults !== void 0 && (oe = w.fullResults), w.isolationLevel !== void 0 && (R = w.isolationLevel), w.readOnly !== void 0 && (j = w.readOnly), w.deferrable !== void 0 && (le = w.deferrable)), I !== void 0 && !Array.isArray(I) && I.fetchOptions !== void 0 && (X = { ...X, ...I.fetchOptions });
    let de = u;
    !Array.isArray(I) && I?.authToken !== void 0 && (de = I.authToken);
    let We = typeof Z == "function" ? Z(g, A, { jwtAuth: de !== void 0 }) : Z, fe = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, _e = await Fu(de);
    _e && (fe.Authorization = `Bearer ${_e}`), Array.isArray(P) && (R !== void 0 && (fe["Neon-Batch-Isolation-Level"] = R), j !== void 0 && (fe["Neon-Batch-Read-Only"] = String(j)), le !== void 0 && (fe["Neon-Batch-Deferrable"] = String(le))), c || ce.disableWarningInBrowsers || bt();
    let ye;
    try {
      ye = await (W ?? fetch)(We, { method: "POST", body: JSON.stringify(J), headers: fe, ...X });
    } catch (ee) {
      let M = new be(
        `Error connecting to database: ${ee}`
      );
      throw M.sourceError = ee, M;
    }
    if (ye.ok) {
      let ee = await ye.json();
      if (Array.isArray(P)) {
        let M = ee.results;
        if (!Array.isArray(M)) throw new be("Neon internal error: unexpected result format");
        return M.map(($, me) => {
          let Ot = I[me] ?? {}, vo = Ot.arrayMode ?? se, xo = Ot.fullResults ?? oe;
          return os(
            $,
            { arrayMode: vo, fullResults: xo, types: Ot.types }
          );
        });
      } else {
        let M = I ?? {}, $ = M.arrayMode ?? se, me = M.fullResults ?? oe;
        return os(ee, { arrayMode: $, fullResults: me, types: M.types });
      }
    } else {
      let { status: ee } = ye;
      if (ee === 400) {
        let M = await ye.json(), $ = new be(M.message);
        for (let me of Ru) $[me] = M[me] ?? void 0;
        throw $;
      } else {
        let M = await ye.text();
        throw new be(
          `Server error (HTTP status ${ee}): ${M}`
        );
      }
    }
  }
  return a(Y, "execute"), D;
}
a(cs, "neon");
var dr = class dr2 {
  constructor(e, t, n) {
    this.execute = e;
    this.queryData = t;
    this.opts = n;
  }
  then(e, t) {
    return this.execute(this.queryData, this.opts).then(e, t);
  }
  catch(e) {
    return this.execute(this.queryData, this.opts).catch(e);
  }
  finally(e) {
    return this.execute(
      this.queryData,
      this.opts
    ).finally(e);
  }
};
a(dr, "NeonQueryPromise");
var Ce = dr;
function os(r, {
  arrayMode: e,
  fullResults: t,
  types: n
}) {
  let i = new as.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i.getTypeParser(
    c.dataTypeID
  )), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(
    c.map((l, f) => [s[f], l === null ? null : o[f](l)])
  ));
  return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i, r) : u;
}
a(os, "processQueryResult");
async function Fu(r) {
  if (typeof r == "string") return r;
  if (typeof r == "function") try {
    return await Promise.resolve(r());
  } catch (e) {
    let t = new be("Error getting auth token.");
    throw e instanceof Error && (t = new be(`Error getting auth token: ${e.message}`)), t;
  }
}
a(Fu, "getAuthToken");
p();
var go = Se(ot());
p();
var wo = Se(ot());
var kn = class kn2 extends wo.Client {
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i = typeof this.config != "string" && this.config?.host !== void 0 || typeof this.config != "string" && this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
    if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect) return o;
    let l = this.connection;
    if (u && l.on(
      "connect",
      () => l.stream.emit("data", "S")
    ), c) {
      l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
      let f = this.ssl ? "sslconnect" : "connect";
      l.on(f, () => {
        this.neonConfig.disableWarningInBrowsers || bt(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    if (typeof crypto > "u" || crypto.subtle === void 0 || crypto.subtle.importKey === void 0) throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
    let n = crypto.subtle, i = this.saslSession, s = this.password, o = t.data;
    if (i.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string") throw new Error(
      "SASL: protocol error"
    );
    let u = Object.fromEntries(o.split(",").map((M) => {
      if (!/^.=/.test(M)) throw new Error(
        "SASL: Invalid attribute pair entry"
      );
      let $ = M[0], me = M.substring(2);
      return [$, me];
    })), c = u.r, l = u.s, f = u.i;
    if (!c || !/^[!-+--~]+$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64"
    );
    if (!f || !/^[1-9][0-9]*$/.test(f)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count"
    );
    if (!c.startsWith(i.clientNonce))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    if (c.length === i.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder(), C = A.encode(s), D = await n.importKey(
      "raw",
      C,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), Y = new Uint8Array(await n.sign("HMAC", D, d.concat(
      [g, d.from([0, 0, 0, 1])]
    ))), P = Y;
    for (var I = 0; I < y - 1; I++) Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(
      P.map((M, $) => P[$] ^ Y[$])
    );
    let w = P, Z = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest(
      "SHA-256",
      W
    ), X = "n=*,r=" + i.clientNonce, se = "r=" + c + ",s=" + l + ",i=" + y, oe = "c=biws,r=" + c, R = X + "," + se + "," + oe, j = await n.importKey(
      "raw",
      J,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var le = new Uint8Array(await n.sign(
      "HMAC",
      j,
      A.encode(R)
    )), de = d.from(W.map((M, $) => W[$] ^ le[$])), We = de.toString("base64");
    let fe = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), _e = await n.sign("HMAC", fe, A.encode("Server Key")), ye = await n.importKey("raw", _e, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var ee = d.from(
      await n.sign("HMAC", ye, A.encode(R))
    );
    i.message = "SASLResponse", i.serverSignature = ee.toString("base64"), i.response = oe + ",p=" + We, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(
  kn,
  "NeonClient"
);
var ut = kn;
Fe();
var bo = Se(Bt());
function vl(r, e) {
  if (e) return { callback: e, result: void 0 };
  let t, n, i = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i, result: s };
}
a(vl, "promisify");
var Un = class Un2 extends go.Pool {
  constructor() {
    super(...arguments);
    E(this, "Client", ut);
    E(this, "hasFetchUnsupportedListeners", false);
    E(this, "addListener", this.on);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i) {
    if (!ce.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function") return super.query(
      t,
      n,
      i
    );
    typeof n == "function" && (i = n, n = void 0);
    let s = vl(this.Promise, i);
    i = s.callback;
    try {
      let o = new bo.default(
        this.options
      ), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
      cs(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i(void 0, A)).catch((A) => i(
        A
      ));
    } catch (o) {
      i(o);
    }
    return s.result;
  }
};
a(Un, "NeonPool");
Fe();
var ct = Se(ot());
var export_DatabaseError = ct.DatabaseError;
var export_defaults = ct.defaults;
var export_escapeIdentifier = ct.escapeIdentifier;
var export_escapeLiteral = ct.escapeLiteral;
var export_types = ct.types;

// src/storage/neon.ts
var NeonStorage = class {
  sql;
  initialized = false;
  constructor(databaseUrl) {
    this.sql = cs(databaseUrl);
  }
  /**
   * 首次使用时自动建表
   */
  async ensureTable() {
    if (this.initialized) return;
    await this.sql`
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value JSONB NOT NULL,
                expire_at TIMESTAMPTZ
            )
        `;
    this.initialized = true;
  }
  async get(key) {
    await this.ensureTable();
    const rows = await this.sql`
            SELECT value FROM kv_store
            WHERE key = ${key}
            AND (expire_at IS NULL OR expire_at > NOW())
        `;
    if (rows.length === 0) return null;
    return rows[0].value;
  }
  async set(key, value, options) {
    await this.ensureTable();
    const expireAt = options?.ttl ? new Date(Date.now() + options.ttl * 1e3).toISOString() : null;
    await this.sql`
            INSERT INTO kv_store (key, value, expire_at)
            VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${expireAt}::timestamptz)
            ON CONFLICT (key) DO UPDATE
            SET value = ${JSON.stringify(value)}::jsonb, expire_at = ${expireAt}::timestamptz
        `;
  }
  async delete(key) {
    await this.ensureTable();
    await this.sql`DELETE FROM kv_store WHERE key = ${key}`;
  }
  async list(prefix) {
    await this.ensureTable();
    const rows = await this.sql`
            SELECT key FROM kv_store
            WHERE key LIKE ${prefix + "%"}
            AND (expire_at IS NULL OR expire_at > NOW())
            ORDER BY key
        `;
    return rows.map((r) => r.key);
  }
};

// src/routes/api.ts
init_storage();
init_auth();

// src/sync.ts
init_storage();

// src/utils/parse-node.ts
var expireRegex = /到期[:： ]*(\d{4}-\d{2}-\d{2})/i;
var trafficRegex = /剩余[:： ]*([\d.]+)\s*(GB|TB|G|T)/i;
var expUnixRegex = /exp:(\d{10,13})/i;
function parseNodeName(name) {
  const result = { name };
  const expireMatch = name.match(expireRegex);
  if (expireMatch) {
    result.expireDate = expireMatch[1];
  } else {
    const unixMatch = name.match(expUnixRegex);
    if (unixMatch) {
      const timestamp = parseInt(unixMatch[1], 10);
      const ms2 = timestamp > 9999999999 ? timestamp : timestamp * 1e3;
      const date = new Date(ms2);
      result.expireDate = date.toISOString().split("T")[0];
    }
  }
  const trafficMatch = name.match(trafficRegex);
  if (trafficMatch) {
    let value = parseFloat(trafficMatch[1]);
    const unit = trafficMatch[2].toUpperCase();
    if (unit === "TB" || unit === "T") {
      value *= 1024;
    }
    result.remainTrafficGB = value;
  }
  return result;
}
function extractNodeNameFromUrl(url) {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return "";
  try {
    return decodeURIComponent(url.substring(hashIndex + 1));
  } catch {
    return url.substring(hashIndex + 1);
  }
}
function isValidProxyUrl(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("vless://") || trimmed.startsWith("trojan://") || trimmed.startsWith("vmess://") || trimmed.startsWith("ss://") || trimmed.startsWith("ssr://");
}
function getProtocolType(line) {
  const trimmed = line.trim().toLowerCase();
  if (trimmed.startsWith("vless://")) return "vless";
  if (trimmed.startsWith("trojan://")) return "trojan";
  return "other";
}

// src/sync.ts
async function syncSubscription(storage, env) {
  const startTime = Date.now();
  try {
    const encodedName = encodeURIComponent(env.SUBSTORE_COLLECTION_NAME);
    const url = `${env.SUBSTORE_SHARE_BASE}/share/col/${encodedName}?token=${env.SUBSTORE_TOKEN}`;
    console.log(`[Sync] \u5F00\u59CB\u540C\u6B65\uFF0CURL: ${url}`);
    const timeout = parseInt(env.SUBSTORE_DOWNLOAD_TIMEOUT || "15000", 10);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "SubSync/1.0"
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      const error = `Sub-Store \u8FD4\u56DE ${response.status}\uFF0C\u53EF\u80FD\u5B9E\u4F8B\u7EF4\u62A4`;
      console.error(`[Sync] ${error}`);
      await logSync(storage, { success: false, error });
      return { success: false, error };
    }
    let text = await response.text();
    const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) && !text.includes("://") && text.trim().length > 100;
    if (isBase64) {
      try {
        const decoded = atob(text.trim().replace(/\s/g, ""));
        text = decoded;
        console.log("[Sync] \u68C0\u6D4B\u5230 Base64 \u7F16\u7801\uFF0C\u5DF2\u89E3\u7801");
      } catch {
        console.log("[Sync] Base64 \u89E3\u7801\u5931\u8D25\uFF0C\u4F7F\u7528\u539F\u59CB\u5185\u5BB9");
      }
    }
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    const validLines = [];
    let invalidCount = 0;
    const protocols = { vless: 0, trojan: 0, other: 0 };
    const expireDates = [];
    let totalTrafficGB = 0;
    let hasTrafficInfo = false;
    for (const line of lines) {
      if (!isValidProxyUrl(line)) {
        invalidCount++;
        continue;
      }
      validLines.push(line.trim());
      const protocol = getProtocolType(line);
      protocols[protocol]++;
      const nodeName = extractNodeNameFromUrl(line);
      if (nodeName) {
        const parsed = parseNodeName(nodeName);
        if (parsed.expireDate) {
          expireDates.push(parsed.expireDate);
        }
        if (parsed.remainTrafficGB !== void 0) {
          totalTrafficGB += parsed.remainTrafficGB;
          hasTrafficInfo = true;
        }
      }
    }
    const earliestExpire = expireDates.length > 0 ? expireDates.sort()[0] : null;
    const result = {
      lastSync: (/* @__PURE__ */ new Date()).toISOString(),
      nodeCount: validLines.length,
      earliestExpire,
      totalRemainGB: hasTrafficInfo ? Math.round(totalTrafficGB * 100) / 100 : null,
      rawLines: validLines,
      protocols
    };
    await storage.set(STORAGE_KEYS.SYNC_RESULT, result);
    await logSync(storage, {
      success: true,
      nodeCount: validLines.length
    });
    const duration = Date.now() - startTime;
    console.log(`[Sync] \u5B8C\u6210\uFF0C\u8282\u70B9\u6570: ${validLines.length}\uFF0C\u8017\u65F6: ${duration}ms`);
    return {
      success: true,
      nodeCount: validLines.length,
      earliestExpire,
      totalRemainGB: result.totalRemainGB,
      invalidLines: invalidCount > 0 ? invalidCount : void 0
    };
  } catch (error) {
    const message2 = error instanceof Error ? error.message : String(error);
    console.error(`[Sync] \u9519\u8BEF: ${message2}`);
    await logSync(storage, { success: false, error: message2 });
    return { success: false, error: message2 };
  }
}
async function getSyncResult(storage) {
  return storage.get(STORAGE_KEYS.SYNC_RESULT);
}
async function getSyncStatus(storage) {
  const result = await storage.get(STORAGE_KEYS.SYNC_RESULT);
  const logs = await storage.get(STORAGE_KEYS.SYNC_LOGS) || [];
  const latestLog = logs[0];
  return {
    lastSync: result?.lastSync || null,
    nodeCount: result?.nodeCount || 0,
    success: latestLog?.success ?? true,
    latestError: latestLog?.error
  };
}
async function logSync(storage, log2) {
  const logs = await storage.get(STORAGE_KEYS.SYNC_LOGS) || [];
  logs.unshift({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...log2
  });
  if (logs.length > 10) {
    logs.splice(10);
  }
  await storage.set(STORAGE_KEYS.SYNC_LOGS, logs);
}

// src/routes/api.ts
function createApiRoutes() {
  const api = new Hono2();
  api.post("/auth/login", async (c) => {
    const body = await c.req.json();
    const { username, password } = body;
    if (!username || !password) {
      return c.json({ error: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    const storage = c.get("storage");
    const env = c.get("env");
    const result = await login(username, password, storage, env);
    if (!result.success) {
      return c.json({ error: result.error }, 401);
    }
    c.header("Set-Cookie", `token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
    return c.json({ success: true, token: result.token });
  });
  api.post("/auth/logout", (c) => {
    c.header("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0");
    return c.json({ success: true });
  });
  api.get("/me", async (c) => {
    const env = c.get("env");
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.json({ authenticated: false });
    }
    const { verifyToken: verifyToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const payload = await verifyToken2(token, env.AUTH_SECRET);
    if (!payload) {
      return c.json({ authenticated: false });
    }
    return c.json({
      authenticated: true,
      username: payload.sub,
      isAdmin: payload.isAdmin
    });
  });
  api.put("/me/password", async (c) => {
    const env = c.get("env");
    const storage = c.get("storage");
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.json({ error: "\u672A\u767B\u5F55" }, 401);
    }
    const { verifyToken: verifyToken2, hashPassword: hashPassword2, verifyPassword: verifyPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const payload = await verifyToken2(token, env.AUTH_SECRET);
    if (!payload) {
      return c.json({ error: "Token \u65E0\u6548" }, 401);
    }
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return c.json({ error: "\u5F53\u524D\u5BC6\u7801\u548C\u65B0\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ error: "\u65B0\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11 6 \u4F4D" }, 400);
    }
    const username = payload.sub;
    if (username === env.ADMIN_USERNAME) {
      if (currentPassword !== env.ADMIN_PASSWORD) {
        return c.json({ error: "\u5F53\u524D\u5BC6\u7801\u9519\u8BEF" }, 400);
      }
      return c.json({ error: "\u7BA1\u7406\u5458\u5BC6\u7801\u8BF7\u901A\u8FC7\u73AF\u5883\u53D8\u91CF\u4FEE\u6539" }, 400);
    }
    const user = await storage.get(`user:${username}`);
    if (!user) {
      return c.json({ error: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
    }
    const isValid = await verifyPassword2(currentPassword, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "\u5F53\u524D\u5BC6\u7801\u9519\u8BEF" }, 400);
    }
    user.passwordHash = await hashPassword2(newPassword);
    await storage.set(`user:${username}`, user);
    return c.json({ success: true });
  });
  api.get("/sync", async (c) => {
    const token = c.req.query("token");
    const env = c.get("env");
    if (token !== env.SYNC_SECRET) {
      return c.json({ error: "\u65E0\u6548\u7684\u540C\u6B65\u4EE4\u724C" }, 403);
    }
    const storage = c.get("storage");
    const result = await syncSubscription(storage, env);
    return c.json(result);
  });
  api.get("/status", async (c) => {
    const storage = c.get("storage");
    const status = await getSyncStatus(storage);
    return c.json(status);
  });
  api.get("/subscription", async (c) => {
    const env = c.get("env");
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.json({ error: "\u672A\u767B\u5F55" }, 401);
    }
    const { verifyToken: verifyToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const payload = await verifyToken2(token, env.AUTH_SECRET);
    if (!payload) {
      return c.json({ error: "Token \u65E0\u6548" }, 401);
    }
    const storage = c.get("storage");
    const username = payload.sub;
    if (username === env.ADMIN_USERNAME) {
      const result = await getSyncResult(storage);
      if (!result) {
        return c.json({ error: "\u6682\u65E0\u8BA2\u9605\u6570\u636E\uFF0C\u8BF7\u5148\u6267\u884C\u540C\u6B65" }, 404);
      }
      return c.json({
        lastSync: result.lastSync,
        nodeCount: result.nodeCount,
        earliestExpire: result.earliestExpire,
        totalRemainGB: result.totalRemainGB,
        protocols: result.protocols
      });
    }
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user) {
      return c.json({ error: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
    }
    if (!user.subscriptionConfig) {
      return c.json({ error: "\u672A\u7ED1\u5B9A\u8BA2\u9605\u94FE\u63A5\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458" }, 404);
    }
    if (user.lastSyncResult) {
      return c.json({
        lastSync: user.lastSyncResult.lastSync,
        nodeCount: user.lastSyncResult.nodeCount,
        earliestExpire: user.lastSyncResult.earliestExpire,
        totalRemainGB: user.lastSyncResult.totalRemainGB,
        subscriptionConfig: {
          collectionName: user.subscriptionConfig.collectionName,
          token: user.subscriptionConfig.token
        }
      });
    }
    return c.json({
      lastSync: null,
      nodeCount: 0,
      earliestExpire: null,
      totalRemainGB: null,
      subscriptionConfig: {
        collectionName: user.subscriptionConfig.collectionName,
        token: user.subscriptionConfig.token
      },
      message: "\u8BA2\u9605\u5C1A\u672A\u540C\u6B65\uFF0C\u8BF7\u7B49\u5F85\u81EA\u52A8\u540C\u6B65\u6216\u8054\u7CFB\u7BA1\u7406\u5458\u624B\u52A8\u540C\u6B65"
    });
  });
  api.get("/subscription/download", async (c) => {
    const env = c.get("env");
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.text("\u672A\u767B\u5F55", 401);
    }
    const { verifyToken: verifyToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const payload = await verifyToken2(token, env.AUTH_SECRET);
    if (!payload) {
      return c.text("Token \u65E0\u6548", 401);
    }
    const storage = c.get("storage");
    const username = payload.sub;
    if (username === env.ADMIN_USERNAME) {
      const result = await getSyncResult(storage);
      if (!result) {
        return c.text("\u6682\u65E0\u8BA2\u9605\u6570\u636E", 404);
      }
      const content = result.rawLines.join("\n");
      c.header("Content-Type", "text/plain; charset=utf-8");
      c.header("Content-Disposition", 'attachment; filename="subscription.txt"');
      return c.body(content);
    }
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user || !user.subscriptionConfig) {
      return c.text("\u672A\u7ED1\u5B9A\u8BA2\u9605\u94FE\u63A5", 404);
    }
    const { collectionName, token: subToken } = user.subscriptionConfig;
    const encodedName = encodeURIComponent(collectionName);
    const subUrl = `${env.SUBSTORE_SHARE_BASE}/share/col/${encodedName}?token=${subToken}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const response = await fetch(subUrl, {
        method: "GET",
        headers: { "User-Agent": "SubSync/1.0" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return c.text(`\u83B7\u53D6\u8BA2\u9605\u5931\u8D25: HTTP ${response.status}`, 502);
      }
      let text = await response.text();
      const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) && !text.includes("://") && text.trim().length > 100;
      if (isBase64) {
        try {
          text = atob(text.trim().replace(/\s/g, ""));
        } catch {
        }
      }
      c.header("Content-Type", "text/plain; charset=utf-8");
      c.header("Content-Disposition", `attachment; filename="${username}_subscription.txt"`);
      return c.body(text);
    } catch (error) {
      const message2 = error instanceof Error ? error.message : String(error);
      return c.text(`\u83B7\u53D6\u8BA2\u9605\u5931\u8D25: ${message2}`, 502);
    }
  });
  return api;
}

// src/routes/admin.ts
init_storage();
init_auth();
init_scheduler();
function createAdminRoutes() {
  const admin = new Hono2();
  admin.use("/*", async (c, next) => {
    const env = c.get("env");
    const authHeader = c.req.header("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.json({ error: "\u672A\u767B\u5F55" }, 401);
    }
    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload) {
      return c.json({ error: "Token \u65E0\u6548" }, 401);
    }
    if (!payload.isAdmin) {
      return c.json({ error: "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650" }, 403);
    }
    await next();
  });
  admin.get("/users", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    const users = [];
    users.push({
      username: env.ADMIN_USERNAME,
      isAdmin: true,
      createdAt: "\u7CFB\u7EDF\u7BA1\u7406\u5458"
    });
    for (const key of userKeys) {
      const user = await storage.get(key);
      if (user) {
        users.push({
          username: user.username,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          customNote: user.customNote,
          subscriptionConfig: user.subscriptionConfig,
          lastSyncResult: user.lastSyncResult
        });
      }
    }
    return c.json({ users });
  });
  admin.post("/users", async (c) => {
    const storage = c.get("storage");
    const body = await c.req.json();
    if (!body.username || !body.password) {
      return c.json({ error: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    const existing = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${body.username}`);
    if (existing) {
      return c.json({ error: "\u7528\u6237\u5DF2\u5B58\u5728" }, 400);
    }
    const user = {
      username: body.username,
      passwordHash: await hashPassword(body.password),
      isAdmin: body.isAdmin || false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      customNote: body.customNote,
      subscriptionConfig: body.subscriptionConfig
    };
    await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${body.username}`, user);
    return c.json({ success: true, username: body.username });
  });
  admin.put("/users/:username", async (c) => {
    const storage = c.get("storage");
    const username = c.req.param("username");
    const body = await c.req.json();
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user) {
      return c.json({ error: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
    }
    if (body.password) {
      user.passwordHash = await hashPassword(body.password);
    }
    if (body.isAdmin !== void 0) {
      user.isAdmin = body.isAdmin;
    }
    if (body.customNote !== void 0) {
      user.customNote = body.customNote;
    }
    if (body.subscriptionConfig !== void 0) {
      user.subscriptionConfig = body.subscriptionConfig;
    }
    await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);
    return c.json({ success: true });
  });
  admin.delete("/users/:username", async (c) => {
    const storage = c.get("storage");
    const username = c.req.param("username");
    await storage.delete(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    return c.json({ success: true });
  });
  admin.get("/export", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    const syncResult = await storage.get(STORAGE_KEYS.SYNC_RESULT);
    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    const rows = ["\u7528\u6237\u540D,\u8282\u70B9\u6570,\u6700\u65E9\u5230\u671F,\u5269\u4F59\u6D41\u91CFGB,\u6807\u7B7E"];
    const adminTag = getExpireTag(syncResult?.earliestExpire);
    rows.push(`${env.ADMIN_USERNAME},${syncResult?.nodeCount || 0},${syncResult?.earliestExpire || "N/A"},${syncResult?.totalRemainGB || "N/A"},${adminTag}`);
    for (const key of userKeys) {
      const user = await storage.get(key);
      if (user) {
        const tag2 = getExpireTag(syncResult?.earliestExpire);
        rows.push(`${user.username},${syncResult?.nodeCount || 0},${syncResult?.earliestExpire || "N/A"},${syncResult?.totalRemainGB || "N/A"},${tag2}`);
      }
    }
    const csv = rows.join("\n");
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", 'attachment; filename="users_export.csv"');
    return c.body("\uFEFF" + csv);
  });
  admin.put("/users/:username/subscription", async (c) => {
    const storage = c.get("storage");
    const username = c.req.param("username");
    const body = await c.req.json();
    if (!body.collectionName || !body.token) {
      return c.json({ error: "\u7EC4\u5408\u540D\u79F0\u548C token \u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user) {
      return c.json({ error: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
    }
    user.subscriptionConfig = {
      collectionName: body.collectionName,
      token: body.token
    };
    await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);
    return c.json({ success: true });
  });
  admin.post("/users/:username/sync", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    const username = c.req.param("username");
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user) {
      return c.json({ error: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
    }
    if (!user.subscriptionConfig) {
      return c.json({ error: "\u7528\u6237\u672A\u7ED1\u5B9A\u8BA2\u9605" }, 400);
    }
    const substoreConfig = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
    if (!baseUrl) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E Sub-Store \u5730\u5740" }, 400);
    }
    console.log(`[Sync] \u7528\u6237: ${username}, baseUrl: ${baseUrl}, collectionName: ${user.subscriptionConfig.collectionName}, token: ${user.subscriptionConfig.token}`);
    const result = await syncUserSubscription(storage, user, baseUrl);
    return c.json(result);
  });
  admin.get("/sync/config", async (c) => {
    const storage = c.get("storage");
    const config = await getAutoSyncConfig(storage);
    return c.json(config);
  });
  admin.post("/sync/config", async (c) => {
    const storage = c.get("storage");
    const body = await c.req.json();
    const config = await setAutoSyncConfig(storage, body);
    return c.json({ success: true, config });
  });
  admin.post("/sync/all", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    const result = await syncAllUsers(storage, env);
    return c.json(result);
  });
  admin.get("/substore/config", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    let config = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    if (!config) {
      const baseUrl = env.SUBSTORE_SHARE_BASE || "";
      const collectionsEnv = env.SUBSTORE_COLLECTIONS || env.SUBSTORE_COLLECTION_NAME || "";
      const collections = collectionsEnv.split(",").map((name) => name.trim()).filter((name) => name.length > 0).map((name) => ({ name }));
      config = { baseUrl, backendPrefix: "", collections };
    }
    return c.json(config);
  });
  admin.post("/substore/config", async (c) => {
    const storage = c.get("storage");
    const body = await c.req.json();
    if (!body.baseUrl) {
      return c.json({ error: "Sub-Store \u5730\u5740\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    await storage.set(STORAGE_KEYS.SUBSTORE_CONFIG, {
      baseUrl: body.baseUrl.replace(/\/$/, ""),
      // 去掉末尾斜杠
      backendPrefix: body.backendPrefix?.replace(/\/$/, "") || "",
      // 去掉末尾斜杠
      collections: body.collections || []
    });
    return c.json({ success: true });
  });
  admin.post("/substore/collections/add", async (c) => {
    const storage = c.get("storage");
    const body = await c.req.json();
    if (!body.name) {
      return c.json({ error: "\u7EC4\u5408\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    let config = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    if (!config) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E Sub-Store \u5730\u5740" }, 400);
    }
    if (config.collections.some((c2) => c2.name === body.name)) {
      return c.json({ error: "\u8BE5\u7EC4\u5408\u5DF2\u5B58\u5728" }, 400);
    }
    config.collections.push({
      name: body.name,
      displayName: body.displayName
    });
    await storage.set(STORAGE_KEYS.SUBSTORE_CONFIG, config);
    return c.json({ success: true, collections: config.collections });
  });
  admin.get("/substore/tokens", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    let config = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
    const backendPrefix = config?.backendPrefix || "";
    if (!baseUrl) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E Sub-Store \u5730\u5740" }, 400);
    }
    if (!backendPrefix) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00" }, 400);
    }
    const apiUrl = `${baseUrl}${backendPrefix}/api/tokens`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "User-Agent": "SubSync/1.0" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return c.json({ error: `Sub-Store \u8FD4\u56DE ${response.status}` }, 502);
      }
      const result = await response.json();
      const tokens = result?.data || result;
      return c.json({ success: true, tokens });
    } catch (error) {
      const message2 = error instanceof Error ? error.message : String(error);
      return c.json({ error: `\u67E5\u8BE2\u5931\u8D25: ${message2}` }, 502);
    }
  });
  admin.get("/substore/tokens/unbound", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    let config = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
    const backendPrefix = config?.backendPrefix || "";
    if (!baseUrl || !backendPrefix) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E Sub-Store \u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00", needConfig: true }, 400);
    }
    const apiUrl = `${baseUrl}${backendPrefix}/api/tokens`;
    let allTokens = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "User-Agent": "SubSync/1.0" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return c.json({ error: `Sub-Store \u8FD4\u56DE ${response.status}` }, 502);
      }
      const result = await response.json();
      const tokensData = result?.data || result;
      allTokens = Array.isArray(tokensData) ? tokensData : [];
    } catch (error) {
      const message2 = error instanceof Error ? error.message : String(error);
      return c.json({ error: `\u67E5\u8BE2\u5931\u8D25: ${message2}` }, 502);
    }
    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    const boundTokenValues = /* @__PURE__ */ new Set();
    const boundCompositeKeys = /* @__PURE__ */ new Set();
    for (const key of userKeys) {
      const user = await storage.get(key);
      if (user?.subscriptionConfig?.token) {
        boundTokenValues.add(user.subscriptionConfig.token);
        const compositeKey = user.subscriptionConfig.token + "::" + (user.subscriptionConfig.collectionName || "");
        boundCompositeKeys.add(compositeKey);
        console.log(`[Unbound] \u5DF2\u7ED1\u5B9A\u7528\u6237 ${user.username}: token=${user.subscriptionConfig.token}, col=${user.subscriptionConfig.collectionName}, key=${compositeKey}`);
      }
    }
    if (allTokens.length > 0) {
      console.log(`[Unbound] Sub-Store \u8FD4\u56DE ${allTokens.length} \u4E2A token\uFF0C\u7B2C\u4E00\u4E2A\u6837\u672C:`, JSON.stringify(allTokens[0]));
    }
    const unboundTokens = allTokens.filter((t) => {
      const tokenValue = t.token || "";
      const isBound = boundTokenValues.has(tokenValue);
      if (isBound) {
        console.log(`[Unbound] \u8FC7\u6EE4\u6389\u5DF2\u7ED1\u5B9A token: ${tokenValue}`);
      }
      return !isBound;
    });
    const allUsers = [];
    for (const key of userKeys) {
      const user = await storage.get(key);
      if (user && !user.isAdmin) {
        allUsers.push({
          username: user.username,
          hasSub: !!user.subscriptionConfig
        });
      }
    }
    console.log(`[Unbound] \u603B\u8BA1: ${allTokens.length}, \u5DF2\u7ED1\u5B9A: ${allTokens.length - unboundTokens.length}, \u5F85\u5206\u914D: ${unboundTokens.length}`);
    return c.json({
      success: true,
      tokens: unboundTokens,
      totalCount: allTokens.length,
      boundCount: allTokens.length - unboundTokens.length,
      allUsers
    });
  });
  admin.get("/substore/collections/remote", async (c) => {
    const storage = c.get("storage");
    const env = c.get("env");
    let config = await storage.get(STORAGE_KEYS.SUBSTORE_CONFIG);
    const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
    const backendPrefix = config?.backendPrefix || "";
    if (!baseUrl) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E Sub-Store \u5730\u5740" }, 400);
    }
    if (!backendPrefix) {
      return c.json({ error: "\u8BF7\u5148\u914D\u7F6E\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00" }, 400);
    }
    const apiUrl = `${baseUrl}${backendPrefix}/api/collections`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "User-Agent": "SubSync/1.0" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return c.json({ error: `Sub-Store \u8FD4\u56DE ${response.status}` }, 502);
      }
      const result = await response.json();
      const collections = result?.data || result;
      return c.json({ success: true, collections });
    } catch (error) {
      const message2 = error instanceof Error ? error.message : String(error);
      return c.json({ error: `\u67E5\u8BE2\u5931\u8D25: ${message2}` }, 502);
    }
  });
  return admin;
}
function getExpireTag(expireDate) {
  if (!expireDate) return "";
  const now = /* @__PURE__ */ new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
  if (daysLeft < 0) return "\u5DF2\u8FC7\u671F";
  if (daysLeft < 7) return "\u5373\u5C06\u8FC7\u671F";
  if (daysLeft < 30) return "\u6CE8\u610F";
  return "\u6B63\u5E38";
}

// node_modules/hono/dist/helper/html/index.js
var html = (strings, ...values) => {
  const buffer = [""];
  for (let i = 0, len = strings.length - 1; i < len; i++) {
    buffer[0] += strings[i];
    const children = Array.isArray(values[i]) ? values[i].flat(Infinity) : [values[i]];
    for (let i2 = 0, len2 = children.length; i2 < len2; i2++) {
      const child = children[i2];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "number") {
        ;
        buffer[0] += child;
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (typeof child === "object" && child.isEscaped) {
        if (child.callbacks) {
          buffer.unshift("", child);
        } else {
          const tmp = child.toString();
          if (tmp instanceof Promise) {
            buffer.unshift("", tmp);
          } else {
            buffer[0] += tmp;
          }
        }
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        escapeToBuffer(child.toString(), buffer);
      }
    }
  }
  buffer[0] += strings.at(-1);
  return buffer.length === 1 ? "callbacks" in buffer ? raw(resolveCallbackSync(raw(buffer[0], buffer.callbacks))) : raw(buffer[0]) : stringBufferToString(buffer, buffer.callbacks);
};

// src/routes/pages.ts
init_storage();
init_auth();

// src/utils/qrcode.ts
var import_qrcode = __toESM(require_browser(), 1);
async function generateQRCodeSVG(text) {
  return import_qrcode.default.toString(text, {
    type: "svg",
    margin: 2,
    width: 200,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });
}

// src/routes/pages.ts
function createPageRoutes() {
  const pages = new Hono2();
  pages.get("/login", (c) => {
    return c.html(renderLoginPage());
  });
  pages.get("/", async (c) => {
    const env = c.get("env");
    const storage = c.get("storage");
    const token = c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.redirect("/login");
    }
    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload) {
      return c.redirect("/login");
    }
    const user = await storage.get(`${STORAGE_KEYS.USERS_PREFIX}${payload.sub}`);
    const substoreConfig = await storage.get("config:substore");
    const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || "";
    let collectionName;
    let userToken;
    if (user?.subscriptionConfig) {
      collectionName = user.subscriptionConfig.collectionName;
      userToken = user.subscriptionConfig.token;
    } else {
      collectionName = env.SUBSTORE_COLLECTION_NAME;
      userToken = env.SUBSTORE_TOKEN;
    }
    const encodedName = encodeURIComponent(collectionName);
    const subscriptionUrl = `${baseUrl}/share/col/${encodedName}?token=${userToken}`;
    const userSyncResult = user?.lastSyncResult || null;
    const globalSyncResult = await storage.get(STORAGE_KEYS.SYNC_RESULT);
    const syncResult = userSyncResult ? {
      ...globalSyncResult,
      lastSync: userSyncResult.lastSync,
      nodeCount: userSyncResult.nodeCount,
      earliestExpire: userSyncResult.earliestExpire,
      totalRemainGB: userSyncResult.totalRemainGB
    } : globalSyncResult;
    let qrcodeSvg = "";
    try {
      qrcodeSvg = await generateQRCodeSVG(subscriptionUrl);
    } catch {
      qrcodeSvg = "<p>\u4E8C\u7EF4\u7801\u751F\u6210\u5931\u8D25</p>";
    }
    return c.html(renderHomePage(payload.sub, payload.isAdmin, syncResult, qrcodeSvg, subscriptionUrl, env, collectionName));
  });
  pages.get("/admin", async (c) => {
    const env = c.get("env");
    const storage = c.get("storage");
    const token = c.req.header("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.redirect("/login");
    }
    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload || !payload.isAdmin) {
      return c.redirect("/login");
    }
    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    const users = [];
    for (const key of userKeys) {
      const user = await storage.get(key);
      if (user) users.push(user);
    }
    const syncResult = await storage.get(STORAGE_KEYS.SYNC_RESULT);
    return c.html(renderAdminPage(env.ADMIN_USERNAME, users, syncResult, env.SYNC_SECRET));
  });
  return pages;
}
var _a;
function renderLoginPage() {
  return html(_a || (_a = __template([`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u767B\u5F55 - Sub-Store \u540C\u6B65\u5E73\u53F0</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    .error {
      color: #e74c3c;
      text-align: center;
      margin-bottom: 20px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>\u{1F510} Sub-Store \u540C\u6B65\u5E73\u53F0</h1>
    <div class="error" id="error"></div>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">\u7528\u6237\u540D</label>
        <input type="text" id="username" name="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">\u5BC6\u7801</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      <button type="submit">\u767B\u5F55</button>
    </form>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        
        if (data.success) {
          window.location.href = '/';
        } else {
          errorEl.textContent = data.error || '\u767B\u5F55\u5931\u8D25';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = '\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5';
        errorEl.style.display = 'block';
      }
    });
  <\/script>
</body>
</html>`])));
}
var _b;
function renderHomePage(username, isAdmin, syncResult, qrcodeSvg, subscriptionUrl, env, collectionName) {
  const lastSync = syncResult?.lastSync ? new Date(syncResult.lastSync).toLocaleString("zh-CN") : "\u4ECE\u672A\u540C\u6B65";
  const expireInfo = syncResult?.earliestExpire ? `${syncResult.earliestExpire} (${getExpireLabel(syncResult.earliestExpire)})` : "\u65E0\u6570\u636E";
  return html(_b || (_b = __template([`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u8BA2\u9605\u4E2D\u5FC3 - Sub-Store \u540C\u6B65\u5E73\u53F0</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 20px; }
    .header-actions { display: flex; gap: 10px; }
    .header-actions a, .header-actions button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
    }
    .header-actions a:hover, .header-actions button:hover {
      background: rgba(255,255,255,0.3);
    }
    .container {
      max-width: 800px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }
    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .qrcode-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .qrcode-wrapper {
      background: white;
      padding: 15px;
      border-radius: 12px;
      border: 2px solid #e1e5eb;
    }
    .qrcode-wrapper svg {
      display: block;
      width: 200px;
      height: 200px;
    }
    .url-display {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      max-width: 100%;
      text-align: center;
      color: #666;
    }
    .copy-btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .copy-btn:hover {
      transform: translateY(-2px);
    }
    .copy-btn.copied {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    }
    .expire-warning { color: #e74c3c; }
    .expire-caution { color: #f39c12; }
    .expire-normal { color: #27ae60; }
    .user-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-size: 14px;
    }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e1e5eb;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
    .message {
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      display: none;
    }
    .message.success { background: #d4edda; color: #155724; display: block; }
    .message.error { background: #f8d7da; color: #721c24; display: block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>\u{1F44B} \u6B22\u8FCE\uFF0C`, '</h1>\n    <div class="header-actions">\n      ', '\n      <button onclick="logout()">\u9000\u51FA\u767B\u5F55</button>\n    </div>\n  </div>\n  \n  <div class="container">\n    <div class="card">\n      <h2 class="card-title">\u{1F464} \u7528\u6237\u4FE1\u606F</h2>\n      <div class="user-info-grid">\n        <div class="info-item">\n          <div class="info-label">\u7528\u6237\u540D</div>\n          <div class="info-value">', '</div>\n        </div>\n        <div class="info-item">\n          <div class="info-label">\u89D2\u8272</div>\n          <div class="info-value">', '</div>\n        </div>\n        <div class="info-item">\n          <div class="info-label">\u8BA2\u9605\u6765\u6E90</div>\n          <div class="info-value">', '</div>\n        </div>\n        <div class="info-item">\n          <div class="info-label">\u8282\u70B9\u6570\u91CF</div>\n          <div class="info-value">', ' \u4E2A</div>\n        </div>\n      </div>\n    </div>\n    \n    <div class="card">\n      <h2 class="card-title">\u{1F4CA} \u8BA2\u9605\u7EDF\u8BA1</h2>\n      <div class="stats-grid">\n        <div class="stat-item">\n          <div class="stat-value">', '</div>\n          <div class="stat-label">\u8282\u70B9\u6570\u91CF</div>\n        </div>\n        <div class="stat-item">\n          <div class="stat-value">', '</div>\n          <div class="stat-label">VLESS</div>\n        </div>\n        <div class="stat-item">\n          <div class="stat-value">', '</div>\n          <div class="stat-label">Trojan</div>\n        </div>\n        <div class="stat-item">\n          <div class="stat-value">', '</div>\n          <div class="stat-label">\u5269\u4F59\u6D41\u91CF</div>\n        </div>\n      </div>\n    </div>\n    \n    <div class="card">\n      <h2 class="card-title">\u23F0 \u540C\u6B65\u4FE1\u606F</h2>\n      <p><strong>\u6700\u540E\u540C\u6B65:</strong> ', '</p>\n      <p><strong>\u6700\u65E9\u5230\u671F:</strong> <span class="', '">', '</span></p>\n    </div>\n    \n    <div class="card">\n      <h2 class="card-title">\u{1F4F1} \u8BA2\u9605\u4E8C\u7EF4\u7801</h2>\n      <div class="qrcode-section">\n        <div class="qrcode-wrapper">', '</div>\n        <div class="url-display">', `</div>
        <button class="copy-btn" id="copyBtn" onclick="copySubscriptionUrl()">\u{1F4CB} \u590D\u5236\u8BA2\u9605\u94FE\u63A5</button>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">\u{1F510} \u4FEE\u6539\u5BC6\u7801</h2>
      <form id="passwordForm" onsubmit="changePassword(event)">
        <div class="form-group">
          <label for="currentPassword">\u5F53\u524D\u5BC6\u7801</label>
          <input type="password" id="currentPassword" required>
        </div>
        <div class="form-group">
          <label for="newPassword">\u65B0\u5BC6\u7801</label>
          <input type="password" id="newPassword" required minlength="6">
        </div>
        <div class="form-group">
          <label for="confirmPassword">\u786E\u8BA4\u65B0\u5BC6\u7801</label>
          <input type="password" id="confirmPassword" required minlength="6">
        </div>
        <button type="submit" class="btn">\u4FEE\u6539\u5BC6\u7801</button>
        <div id="passwordMessage" class="message"></div>
      </form>
    </div>
  </div>
  
  <script>
    const SUBSCRIPTION_URL = '`, "';\n    \n    async function logout() {\n      await fetch('/api/auth/logout', { method: 'POST' });\n      window.location.href = '/login';\n    }\n    \n    function copySubscriptionUrl() {\n      navigator.clipboard.writeText(SUBSCRIPTION_URL).then(() => {\n        const btn = document.getElementById('copyBtn');\n        btn.textContent = '\u2705 \u5DF2\u590D\u5236';\n        btn.classList.add('copied');\n        setTimeout(() => {\n          btn.textContent = '\u{1F4CB} \u590D\u5236\u8BA2\u9605\u94FE\u63A5';\n          btn.classList.remove('copied');\n        }, 2000);\n      });\n    }\n    \n    async function changePassword(e) {\n      e.preventDefault();\n      const msgEl = document.getElementById('passwordMessage');\n      const currentPassword = document.getElementById('currentPassword').value;\n      const newPassword = document.getElementById('newPassword').value;\n      const confirmPassword = document.getElementById('confirmPassword').value;\n      \n      if (newPassword !== confirmPassword) {\n        msgEl.textContent = '\u4E24\u6B21\u8F93\u5165\u7684\u65B0\u5BC6\u7801\u4E0D\u4E00\u81F4';\n        msgEl.className = 'message error';\n        return;\n      }\n      \n      try {\n        const res = await fetch('/api/me/password', {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ currentPassword, newPassword }),\n        });\n        const data = await res.json();\n        \n        if (data.success) {\n          msgEl.textContent = '\u5BC6\u7801\u4FEE\u6539\u6210\u529F';\n          msgEl.className = 'message success';\n          document.getElementById('passwordForm').reset();\n        } else {\n          msgEl.textContent = data.error || '\u5BC6\u7801\u4FEE\u6539\u5931\u8D25';\n          msgEl.className = 'message error';\n        }\n      } catch (err) {\n        msgEl.textContent = '\u7F51\u7EDC\u9519\u8BEF';\n        msgEl.className = 'message error';\n      }\n    }\n  <\/script>\n</body>\n</html>"])), username, isAdmin ? html`<a href="/admin">管理后台</a>` : "", username, isAdmin ? "\u7BA1\u7406\u5458" : "\u666E\u901A\u7528\u6237", collectionName, syncResult?.nodeCount || 0, syncResult?.nodeCount || 0, syncResult?.protocols?.vless || 0, syncResult?.protocols?.trojan || 0, syncResult?.totalRemainGB ? `${syncResult.totalRemainGB}GB` : "N/A", lastSync, getExpireClass(syncResult?.earliestExpire), expireInfo, raw(qrcodeSvg), subscriptionUrl, subscriptionUrl);
}
var _c;
function renderAdminPage(adminUsername, users, syncResult, syncSecret) {
  return html(_c || (_c = __template([`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u7BA1\u7406\u540E\u53F0 - Sub-Store \u540C\u6B65\u5E73\u53F0</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 20px; }
    .header-actions { display: flex; gap: 10px; }
    .header-actions a, .header-actions button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
    }
    .container {
      max-width: 1000px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-danger { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
    .btn-success { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .user-card {
      border: 1px solid #e1e5eb;
      border-radius: 10px;
      padding: 16px;
      position: relative;
    }
    .user-card.admin-card {
      border-color: #e74c3c;
      background: #fff5f5;
    }
    .user-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .user-info {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    .subscription-info {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 12px;
    }
    .subscription-info .label { color: #999; margin-right: 4px; }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
    .tag-admin { background: #e74c3c; color: white; }
    .tag-expired { background: #e74c3c; color: white; }
    .tag-warning { background: #f39c12; color: white; }
    .tag-normal { background: #27ae60; color: white; }
    .tag-no-sub { background: #95a5a6; color: white; }
    .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
    .actions button {
      flex: 1;
      min-width: 60px;
      padding: 6px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .actions button:hover { background: #f5f5f5; }
    .sync-result {
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      display: none;
    }
    .sync-success { background: #d4edda; color: #155724; }
    .sync-error { background: #f8d7da; color: #721c24; }
    /* \u6A21\u6001\u6846\u6837\u5F0F */
    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.active { display: flex; }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #333;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group small {
      display: block;
      margin-top: 4px;
      color: #999;
      font-size: 12px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .form-actions button {
      padding: 10px 24px;
    }
    /* \u81EA\u52A8\u540C\u6B65\u914D\u7F6E */
    .sync-config {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .sync-config label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .sync-config select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    /* Toast \u901A\u77E5\u6837\u5F0F */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
      max-width: 350px;
    }
    .toast-success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
    .toast-error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .toast-info { background: linear-gradient(135deg, #3498db, #2980b9); }
    @keyframes toastIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-20px); } }
    /* \u540C\u6B65\u7ED3\u679C\u6837\u5F0F */
    .sync-result {
      display: none;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .sync-result.sync-success { background: #d4edda; color: #155724; display: block; }
    .sync-result.sync-error { background: #f8d7da; color: #721c24; display: block; }
  </style>
</head>
<body>
  <div class="toast-container" id="toastContainer"></div>
  <div class="header">
    <h1>\u{1F527} \u7BA1\u7406\u540E\u53F0</h1>
    <div class="header-actions">
      <a href="/">\u8FD4\u56DE\u4E3B\u9875</a>
      <button onclick="logout()">\u9000\u51FA\u767B\u5F55</button>
    </div>
  </div>
  
  <div class="container">
    <!-- \u5FEB\u901F\u64CD\u4F5C\u533A -->
    <div class="card">
      <div class="card-title">
        <span>\u26A1 \u5FEB\u901F\u64CD\u4F5C</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-success" onclick="syncAllUsers()">\u{1F504} \u5168\u5C40\u540C\u6B65</button>
        <a href="/api/admin/export" class="btn" style="text-decoration: none;">\u{1F4E5} \u5BFC\u51FA CSV</a>
        <button class="btn" onclick="showAddUserModal()">\u2795 \u6DFB\u52A0\u7528\u6237</button>
        <button class="btn" onclick="showSubstoreConfig()" style="background:linear-gradient(135deg,#f39c12 0%,#e67e22 100%);">\u{1F527} Sub-Store \u914D\u7F6E</button>
      </div>
      <div id="syncResult" class="sync-result"></div>
    </div>

    
    <!-- \u81EA\u52A8\u540C\u6B65\u914D\u7F6E -->
    <div class="card">
      <div class="card-title">
        <span>\u23F0 \u81EA\u52A8\u540C\u6B65\u914D\u7F6E</span>
      </div>
      <div class="sync-config">
        <label>
          <input type="checkbox" id="autoSyncEnabled" onchange="updateAutoSync()">
          \u542F\u7528\u81EA\u52A8\u540C\u6B65
        </label>
        <select id="syncInterval" onchange="updateAutoSync()">
          <option value="15">\u6BCF 15 \u5206\u949F</option>
          <option value="30" selected>\u6BCF 30 \u5206\u949F</option>
          <option value="60">\u6BCF\u5C0F\u65F6</option>
          <option value="360">\u6BCF 6 \u5C0F\u65F6</option>
          <option value="1440">\u6BCF\u5929</option>
        </select>
        <span id="lastSyncTime" style="color:#666;font-size:13px;"></span>
      </div>
    </div>
    
    <!-- \u5F85\u5206\u914D\u7684\u5206\u4EAB Token -->
    <div class="card" id="unboundTokensCard">
      <div class="card-title">
        <span>\u{1F3AB} \u5F85\u5206\u914D\u7684\u5206\u4EAB Token</span>
        <button class="btn btn-sm" onclick="loadUnboundTokens()" style="font-size:12px;padding:4px 12px;">\u{1F504} \u5237\u65B0</button>
      </div>
      <!-- \u5DE5\u5177\u680F\uFF1A\u641C\u7D22/\u7B5B\u9009/\u6392\u5E8F/\u89C6\u56FE\u5207\u6362 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="tokenSearch" placeholder="\u{1F50D} \u641C\u7D22 Token / \u540D\u79F0 / \u5907\u6CE8..." oninput="filterTokens()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="tokenFilter" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">\u5168\u90E8</option>
          <option value="expired">\u5DF2\u8FC7\u671F</option>
          <option value="7days">7\u5929\u5185\u5230\u671F</option>
          <option value="30days">30\u5929\u5185\u5230\u671F</option>
          <option value="valid">\u6709\u6548</option>
        </select>
        <select id="tokenSort" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">\u521B\u5EFA\u65F6\u95F4 \u2193</option>
          <option value="created_asc">\u521B\u5EFA\u65F6\u95F4 \u2191</option>
          <option value="expire_asc">\u6709\u6548\u671F \u2191</option>
          <option value="expire_desc">\u6709\u6548\u671F \u2193</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="viewCard" onclick="switchTokenView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">\u5361\u7247</button>
          <button id="viewList" onclick="switchTokenView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">\u5217\u8868</button>
        </div>
      </div>
      <div id="unboundTokensStatus" style="color:#999;text-align:center;padding:16px;font-size:13px;">
        \u52A0\u8F7D\u4E2D...
      </div>
      <div id="unboundTokensGrid" class="users-grid" style="display:none;"></div>
    </div>
    
    <div class="card">
      <div class="card-title">
        <span>\u{1F465} \u7528\u6237\u5217\u8868\uFF08<span id="userCountLabel">`, `</span> \u4F4D\u7528\u6237\uFF09</span>
        <button class="btn btn-success btn-sm" onclick="syncBoundUsers()" style="font-size:12px;padding:4px 14px;">\u{1F504} \u540C\u6B65\u6240\u6709\u5DF2\u7ED1\u5B9A</button>
      </div>
      <div id="syncBoundResult" class="sync-result"></div>
      <!-- \u7528\u6237\u641C\u7D22/\u6392\u5E8F/\u89C6\u56FE\u5207\u6362\u5DE5\u5177\u680F -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="userSearch" placeholder="\u{1F50D} \u641C\u7D22\u7528\u6237\u540D / \u5907\u6CE8 / Token..." oninput="filterUsers()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="userSort" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">\u521B\u5EFA\u65F6\u95F4 \u2193</option>
          <option value="created_asc">\u521B\u5EFA\u65F6\u95F4 \u2191</option>
          <option value="login_desc">\u6700\u540E\u767B\u5F55 \u2193</option>
          <option value="name_asc">\u7528\u6237\u540D A-Z</option>
        </select>
        <select id="userFilter" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">\u5168\u90E8</option>
          <option value="bound">\u5DF2\u7ED1\u5B9A</option>
          <option value="unbound">\u672A\u7ED1\u5B9A</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="userViewCard" onclick="switchUserView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">\u5361\u7247</button>
          <button id="userViewList" onclick="switchUserView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">\u5217\u8868</button>
        </div>
      </div>
      <div id="usersGrid" class="users-grid">
        <!-- \u7BA1\u7406\u5458\u5361\u7247\uFF08\u56FA\u5B9A\uFF09 -->
        <div class="user-card admin-card">
          <div class="user-name">`, ' <span class="tag tag-admin">\u7BA1\u7406\u5458</span></div>\n          <div class="user-info">\u7CFB\u7EDF\u7BA1\u7406\u5458\u8D26\u6237</div>\n          <div class="subscription-info">\n            <div><span class="label">\u5168\u5C40\u8282\u70B9:</span> ', ' \u4E2A</div>\n            <div><span class="label">\u6700\u65E9\u5230\u671F:</span> ', `</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- \u6DFB\u52A0\u7528\u6237\u6A21\u6001\u6846 -->
  <div class="modal" id="addUserModal">
    <div class="modal-content">
      <div class="modal-title">\u2795 \u6DFB\u52A0\u65B0\u7528\u6237</div>
      <form id="addUserForm" onsubmit="submitAddUser(event)">
        <div class="form-group">
          <label>\u7528\u6237\u540D *</label>
          <input type="text" name="username" required placeholder="\u8F93\u5165\u7528\u6237\u540D">
        </div>
        <div class="form-group">
          <label>\u5BC6\u7801 *</label>
          <input type="password" name="password" required placeholder="\u8F93\u5165\u5BC6\u7801\uFF08\u81F3\u5C11 6 \u4F4D\uFF09" minlength="6">
        </div>
        <div class="form-group">
          <label>\u7ED1\u5B9A\u5206\u4EAB Token</label>
          <select name="shareToken" id="addUserTokenSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- \u4E0D\u7ED1\u5B9A --</option>
          </select>
          <small>\u4ECE\u5F85\u5206\u914D\u7684\u5206\u4EAB Token \u4E2D\u9009\u62E9\uFF0C\u521B\u5EFA\u7528\u6237\u540E\u5C06\u81EA\u52A8\u7ED1\u5B9A</small>
        </div>
        <div class="form-group">
          <label>\u5907\u6CE8</label>
          <textarea name="customNote" rows="2" placeholder="\u53EF\u9009\u5907\u6CE8\u4FE1\u606F"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('addUserModal')">\u53D6\u6D88</button>
          <button type="submit" class="btn btn-success">\u521B\u5EFA\u7528\u6237</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- \u7ED1\u5B9A\u8BA2\u9605\u6A21\u6001\u6846 -->
  <div class="modal" id="bindSubModal">
    <div class="modal-content">
      <div class="modal-title">\u{1F517} \u7ED1\u5B9A\u5206\u4EAB Token</div>
      <form id="bindSubForm" onsubmit="submitBindSub(event)">
        <input type="hidden" name="username" id="bindSubUsername">
        <div class="form-group">
          <label>\u9009\u62E9\u5206\u4EAB Token *</label>
          <select name="shareToken" id="bindTokenSelect" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- \u8BF7\u9009\u62E9\u5F85\u5206\u914D\u7684 Token --</option>
          </select>
          <small>\u4ECE\u5F85\u5206\u914D\u7684\u5206\u4EAB Token \u4E2D\u9009\u62E9</small>
        </div>
        <div id="bindTokenPreview" style="display:none;background:#f8f9fa;padding:10px;border-radius:6px;margin-bottom:12px;font-size:12px;"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('bindSubModal')">\u53D6\u6D88</button>
          <button type="submit" class="btn btn-success">\u4FDD\u5B58\u7ED1\u5B9A</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Sub-Store \u914D\u7F6E\u6A21\u6001\u6846 -->
  <div class="modal" id="substoreConfigModal">
    <div class="modal-content" style="max-width:650px;">
      <div class="modal-title">\u{1F527} Sub-Store \u914D\u7F6E</div>
      <form id="substoreConfigForm" onsubmit="submitSubstoreConfig(event)">
        <div class="form-group">
          <label>Sub-Store \u5730\u5740 *</label>
          <input type="url" name="baseUrl" id="substoreBaseUrl" required placeholder="https://sub.example.com">
          <small>\u4F60\u7684 Sub-Store \u670D\u52A1\u5730\u5740</small>
        </div>
        <div class="form-group">
          <label>\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="substoreBackendPrefix" placeholder="/your-backend-prefix" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="testSubstoreConnection()" style="white-space:nowrap;">\u{1F517} \u6D4B\u8BD5</button>
          </div>
          <small>Sub-Store \u540E\u7AEF API \u8DEF\u5F84\u524D\u7F00\uFF08\u5982 /your-backend-prefix\uFF09\uFF0C\u7528\u4E8E\u67E5\u8BE2\u5206\u4EAB\u4FE1\u606F</small>
          <div id="connectionTestResult" style="margin-top:4px;font-size:12px;display:none;"></div>
        </div>
        
        <!-- \u5206\u4EAB\u7528\u6237\u67E5\u8BE2 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>\u{1F4E4} \u5206\u4EAB\u7528\u6237\uFF08Token \u5217\u8868\uFF09</span>
            <button type="button" class="btn btn-sm btn-success" onclick="queryShareTokens()" style="font-size:11px;padding:4px 10px;">\u{1F50D} \u67E5\u8BE2\u5206\u4EAB\u7528\u6237</button>
          </label>
          <div id="shareTokensList" style="max-height:250px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;">
            <div style="color:#999;text-align:center;font-size:13px;">\u70B9\u51FB\u300C\u67E5\u8BE2\u5206\u4EAB\u7528\u6237\u300D\u4ECE Sub-Store \u83B7\u53D6</div>
          </div>
        </div>

        <!-- \u53EF\u7528\u8BA2\u9605\u7EC4\u5408 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>\u53EF\u7528\u8BA2\u9605\u7EC4\u5408</span>
            <button type="button" class="btn btn-sm" onclick="fetchRemoteCollections()" style="font-size:11px;padding:4px 10px;">\u{1F4E5} \u4ECE\u8FDC\u7A0B\u83B7\u53D6</button>
          </label>
          <div id="collectionsList" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:10px;">
            <div style="color:#999;text-align:center;">\u6682\u65E0\u8BA2\u9605\u7EC4\u5408</div>
          </div>
        </div>
        <div class="form-group">
          <label>\u6DFB\u52A0\u65B0\u7EC4\u5408</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="newCollectionName" placeholder="\u8F93\u5165\u7EC4\u5408\u540D\u79F0" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="addCollection()">\u6DFB\u52A0</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('substoreConfigModal')">\u5173\u95ED</button>
          <button type="submit" class="btn btn-success">\u4FDD\u5B58\u914D\u7F6E</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- \u4E0D\u53EF\u89C1\u7684\u6570\u636E\u5BB9\u5668 -->
  <script id="server-data-users" type="application/json">
    `, `
  <\/script>
  
  <script>
      // ===== Toast \u901A\u77E5\u51FD\u6570 =====
      function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
      }

      // ===== \u5168\u5C40\u6570\u636E\u521D\u59CB\u5316 =====
      var allUsersData = [];
      var allUnboundTokensData = [];
      var currentTokenView = 'card';
      
      try {
        var usersDataEl = document.getElementById('server-data-users');
        if (usersDataEl) {
          allUsersData = JSON.parse(usersDataEl.textContent);
        }
      } catch (e) {
        console.error('Failed to parse server data', e);
      }
    
    // \u9875\u9762\u52A0\u8F7D
    document.addEventListener('DOMContentLoaded', function() {
      loadAutoSyncConfig();
      // \u6062\u590D\u89C6\u56FE\u6A21\u5F0F\u6309\u94AE\u72B6\u6001
      if (currentUserView === 'list') {
        document.getElementById('userViewCard').style.background = 'white';
        document.getElementById('userViewCard').style.color = '#333';
        document.getElementById('userViewList').style.background = '#667eea';
        document.getElementById('userViewList').style.color = 'white';
      }
      renderUserCards();
      loadUnboundTokens();
    });
    
    // ===== \u81EA\u52A8\u540C\u6B65\u914D\u7F6E =====
    async function loadAutoSyncConfig() {
      try {
        const res = await fetch('/api/admin/sync/config');
        const config = await res.json();
        document.getElementById('autoSyncEnabled').checked = config.enabled;
        document.getElementById('syncInterval').value = config.intervalMinutes || 30;
        if (config.lastScheduledSync) {
          document.getElementById('lastSyncTime').textContent = 
            '\u4E0A\u6B21\u540C\u6B65: ' + new Date(config.lastScheduledSync).toLocaleString('zh-CN');
        }
      } catch (err) { console.error('\u52A0\u8F7D\u540C\u6B65\u914D\u7F6E\u5931\u8D25', err); }
    }
    
    async function updateAutoSync() {
      var enabled = document.getElementById('autoSyncEnabled').checked;
      var intervalMinutes = parseInt(document.getElementById('syncInterval').value);
      try {
        await fetch('/api/admin/sync/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: enabled, intervalMinutes: intervalMinutes }),
        });
      } catch (err) { alert('\u66F4\u65B0\u914D\u7F6E\u5931\u8D25'); }
    }
    
    // ===== \u5168\u5C40\u540C\u6B65\uFF08\u5408\u5E76\u540E\uFF09 =====
    async function syncAllUsers() {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '\u{1F504} \u6B63\u5728\u5168\u5C40\u540C\u6B65\u6240\u6709\u7528\u6237...';
      try {
        var res = await fetch('/api/admin/sync/all', { method: 'POST' });
        var data = await res.json();
        if (data.error) {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '\u274C ' + data.error;
        } else {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '\u2705 \u540C\u6B65\u5B8C\u6210\uFF01\u5171 ' + data.total + ' \u4E2A\u7528\u6237\uFF0C\u5DF2\u7ED1\u5B9A ' + (data.synced||0) + ' \u4E2A\uFF0C\u6210\u529F ' + data.success + '\uFF0C\u5931\u8D25 ' + data.failed;
          setTimeout(function(){ location.reload(); }, 2000);
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    async function syncUser(username) {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '\u6B63\u5728\u540C\u6B65 ' + username + '...';
      try {
        var res = await fetch('/api/admin/users/' + username + '/sync', { method: 'POST' });
        var data = await res.json();
        if (data.success) {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '\u2705 \u540C\u6B65\u6210\u529F\uFF01\u8282\u70B9\u6570: ' + data.nodeCount;
          setTimeout(function(){ location.reload(); }, 1500);
        } else {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '\u274C \u540C\u6B65\u5931\u8D25: ' + data.error;
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    // ===== \u7528\u6237\u5217\u8868\u52A8\u6001\u6E32\u67D3 =====
    var currentUserView = sessionStorage.getItem('userViewMode') || 'card';
    
    function getExpireTagHtml(earliestExpire) {
      if (!earliestExpire) return '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
      var now = new Date();
      var exp = new Date(earliestExpire);
      var diffDays = Math.ceil((exp - now) / (1000*60*60*24));
      if (diffDays < 0) return '<span class="tag" style="background:#e74c3c;color:#fff;">\u5DF2\u8FC7\u671F</span>';
      if (diffDays <= 7) return '<span class="tag" style="background:#e67e22;color:#fff;">' + diffDays + '\u5929</span>';
      if (diffDays <= 30) return '<span class="tag" style="background:#f39c12;color:#fff;">' + diffDays + '\u5929</span>';
      return '<span class="tag" style="background:#27ae60;color:#fff;">' + diffDays + '\u5929</span>';
    }
    
    function switchUserView(view) {
      currentUserView = view;
      sessionStorage.setItem('userViewMode', view);
      document.getElementById('userViewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('userViewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('userViewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('userViewList').style.color = view === 'list' ? 'white' : '#333';
      renderUserCards();
    }
    
    function renderUserCards() {
      var search = (document.getElementById('userSearch').value || '').toLowerCase();
      var sort = document.getElementById('userSort').value;
      var filter = document.getElementById('userFilter').value;
      
      var filtered = allUsersData.filter(function(u) {
        if (filter === 'bound' && !u.subscriptionConfig) return false;
        if (filter === 'unbound' && u.subscriptionConfig) return false;
        if (search) {
          var haystack = (u.username + ' ' + (u.customNote||'') + ' ' + (u.subscriptionConfig ? u.subscriptionConfig.token + ' ' + u.subscriptionConfig.collectionName : '')).toLowerCase();
          if (haystack.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === 'created_asc') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sort === 'login_desc') return new Date(b.lastLogin||0) - new Date(a.lastLogin||0);
        if (sort === 'name_asc') return a.username.localeCompare(b.username);
        return 0;
      });
      
      document.getElementById('userCountLabel').textContent = filtered.length + 1;
      
      var grid = document.getElementById('usersGrid');
      var adminCard = grid.querySelector('.admin-card');
      grid.innerHTML = '';
      
      if (currentUserView === 'list') {
        // \u5217\u8868\uFF08\u8868\u683C\uFF09\u89C6\u56FE
        grid.style.display = 'block';
        grid.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u7528\u6237\u540D</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u7EC4\u5408</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u8282\u70B9</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u72B6\u6001</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u6700\u540E\u540C\u6B65</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u64CD\u4F5C</th>' +
          '</tr></thead><tbody>';
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">\u672A\u7ED1\u5B9A</span>';
          }
          html += '<tr style="border-bottom:1px solid #eee;">' +
            '<td style="padding:8px;font-weight:500;">' + u.username + (u.customNote ? ' <span style="color:#999;font-size:11px;">(' + u.customNote + ')</span>' : '') + '</td>' +
            '<td style="padding:8px;">' + (u.subscriptionConfig ? u.subscriptionConfig.collectionName : '-') + '</td>' +
            '<td style="padding:8px;"><code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + (u.subscriptionConfig ? u.subscriptionConfig.token : '-') + '</code></td>' +
            '<td style="padding:8px;">' + (u.lastSyncResult ? u.lastSyncResult.nodeCount + ' \u4E2A' : '-') + '</td>' +
            '<td style="padding:8px;">' + subTag + '</td>' +
            '<td style="padding:8px;font-size:12px;color:#666;">' + (u.lastSyncResult ? new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;white-space:nowrap;">' +
              '<button onclick="editUser(\\'' + u.username + '\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u270F\uFE0F</button>' +
              '<button onclick="bindSubscription(\\'' + u.username + '\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u{1F517}</button>' +
              '<button onclick="syncUser(\\'' + u.username + '\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + ' style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u{1F504}</button>' +
              '<button onclick="deleteUser(\\'' + u.username + '\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;">\u{1F5D1}\uFE0F</button>' +
            '</td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        grid.innerHTML = html;
      } else {
        // \u5361\u7247\u89C6\u56FE
        grid.style.display = 'grid';
        grid.className = 'users-grid';
        if (adminCard) grid.appendChild(adminCard);
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">\u672A\u7ED1\u5B9A</span>';
          }
          
          var subInfo = '';
          if (u.subscriptionConfig) {
            subInfo = '<div class="subscription-info">' +
              '<div><span class="label">\u7EC4\u5408:</span> ' + u.subscriptionConfig.collectionName + '</div>' +
              '<div><span class="label">Token:</span> <code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + u.subscriptionConfig.token + '</code></div>' +
              (u.lastSyncResult ? 
                '<div><span class="label">\u8282\u70B9:</span> ' + u.lastSyncResult.nodeCount + ' \u4E2A</div>' +
                '<div><span class="label">\u6700\u540E\u540C\u6B65:</span> ' + new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') + '</div>'
                : '<div style="color:#f39c12;">\u5C1A\u672A\u540C\u6B65</div>') +
              '</div>';
          } else {
            subInfo = '<div class="subscription-info" style="color:#999;">\u672A\u7ED1\u5B9A\u8BA2\u9605\u94FE\u63A5</div>';
          }
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.id = 'user-' + u.username;
          card.innerHTML = '<div class="user-name">' + u.username + ' ' + (u.isAdmin ? '<span class="tag tag-admin">\u7BA1\u7406\u5458</span> ' : '') + subTag + '</div>' +
            '<div class="user-info">\u521B\u5EFA\u4E8E: ' + new Date(u.createdAt).toLocaleDateString('zh-CN') + '</div>' +
            (u.lastLogin ? '<div class="user-info">\u6700\u540E\u767B\u5F55: ' + new Date(u.lastLogin).toLocaleString('zh-CN') + '</div>' : '') +
            (u.customNote ? '<div class="user-info">\u5907\u6CE8: ' + u.customNote + '</div>' : '') +
            subInfo +
            '<div class="actions">' +
              '<button onclick="editUser(\\'' + u.username + '\\')">\u270F\uFE0F \u7F16\u8F91</button>' +
              '<button onclick="bindSubscription(\\'' + u.username + '\\')">\u{1F517} \u7ED1\u5B9A</button>' +
              '<button onclick="syncUser(\\'' + u.username + '\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + '>\u{1F504} \u540C\u6B65</button>' +
              '<button onclick="deleteUser(\\'' + u.username + '\\')">\u{1F5D1}\uFE0F \u5220\u9664</button>' +
            '</div>';
          grid.appendChild(card);
        });
      }
    }
    function filterUsers() { renderUserCards(); }
    
    // ===== \u4E00\u952E\u540C\u6B65\u6240\u6709\u5DF2\u7ED1\u5B9A\u7528\u6237 =====
    async function syncBoundUsers() {
      var boundUsers = allUsersData.filter(function(u) { return !!u.subscriptionConfig; });
      if (boundUsers.length === 0) {
        showToast('\u6CA1\u6709\u5DF2\u7ED1\u5B9A\u7684\u7528\u6237', 'info');
        return;
      }
      var resultEl = document.getElementById('syncBoundResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.style.background = '#e8f4fd';
      resultEl.style.color = '#333';
      
      var total = boundUsers.length;
      var successCount = 0;
      var failCount = 0;
      resultEl.textContent = '\u{1F504} \u6B63\u5728\u540C\u6B65 0/' + total + ' ...';
      
      for (var i = 0; i < boundUsers.length; i++) {
        var u = boundUsers[i];
        try {
          var res = await fetch('/api/admin/users/' + u.username + '/sync', { method: 'POST' });
          var data = await res.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
        resultEl.textContent = '\u{1F504} \u6B63\u5728\u540C\u6B65 ' + (i + 1) + '/' + total + ' (\u2705' + successCount + ' \u274C' + failCount + ')';
      }
      
      if (failCount === 0) {
        resultEl.className = 'sync-result sync-success';
        resultEl.textContent = '\u2705 \u5168\u90E8\u540C\u6B65\u5B8C\u6210\uFF01\u5171 ' + total + ' \u4E2A\u7528\u6237\uFF0C\u5168\u90E8\u6210\u529F';
      } else {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u540C\u6B65\u5B8C\u6210\uFF1A\u5171 ' + total + ' \u4E2A\u7528\u6237\uFF0C\u6210\u529F ' + successCount + '\uFF0C\u5931\u8D25 ' + failCount;
      }
      setTimeout(function() { location.reload(); }, 2000);
    }
    
    // ===== \u6A21\u6001\u6846\u5DE5\u5177 =====
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    
    // ===== \u6DFB\u52A0\u7528\u6237\uFF08\u4ECE\u5F85\u5206\u914D Token \u9009\u62E9\uFF09 =====
    async function showAddUserModal() {
      document.getElementById('addUserModal').classList.add('active');
      document.getElementById('addUserForm').reset();
      await populateTokenSelect('addUserTokenSelect');
    }
    
    async function populateTokenSelect(selectId) {
      var sel = document.getElementById(selectId);
      sel.innerHTML = '<option value="">-- \u4E0D\u7ED1\u5B9A --</option>';
      // \u5982\u679C\u5DF2\u6709\u7F13\u5B58\u7684 unbound tokens \u6570\u636E\u5C31\u7528\uFF0C\u5426\u5219\u53BB\u62C9
      var tokens = allUnboundTokensData;
      if (!tokens || tokens.length === 0) {
        try {
          var res = await fetch('/api/admin/substore/tokens/unbound');
          var data = await res.json();
          if (data.success) tokens = data.tokens || [];
        } catch(e) {}
      }
      tokens.forEach(function(t) {
        var opt = document.createElement('option');
        var tokenVal = t.token || '';
        var colName = t.name || '';
        opt.value = JSON.stringify({ token: tokenVal, collectionName: colName });
        var label = '\u{1F3AB} ' + tokenVal;
        if (colName) label += ' (' + colName + ')';
        if (t.exp) {
          var d = Math.ceil((t.exp - Date.now()) / (1000*60*60*24));
          label += d < 0 ? ' [\u5DF2\u8FC7\u671F]' : ' [' + d + '\u5929]';
        }
        opt.textContent = label;
        sel.appendChild(opt);
      });
    }
    
    async function submitAddUser(e) {
      e.preventDefault();
      var form = e.target;
      var data = {
        username: form.username.value,
        password: form.password.value,
        customNote: form.customNote.value || undefined,
      };
      // \u4ECE\u4E0B\u62C9\u9009\u62E9\u7684 Token \u89E3\u6790
      var tokenVal = form.shareToken.value;
      if (tokenVal) {
        try {
          var parsed = JSON.parse(tokenVal);
          data.subscriptionConfig = { collectionName: parsed.collectionName, token: parsed.token };
        } catch(e) {}
      }
      try {
        var res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7528\u6237 ' + data.username + ' \u521B\u5EFA\u6210\u529F\uFF01');
          closeModal('addUserModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u521B\u5EFA\u5931\u8D25: ' + result.error, 'error'); }
      } catch (err) { alert('\u7F51\u7EDC\u9519\u8BEF'); }
    }
    
    // ===== \u7ED1\u5B9A\u5206\u4EAB Token =====
    async function bindSubscription(username) {
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindSubForm').reset();
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindTokenPreview').style.display = 'none';
      await populateTokenSelect('bindTokenSelect');
      // \u4FEE\u6539\u7B2C\u4E00\u4E2A\u9009\u9879\u6587\u5B57
      var sel = document.getElementById('bindTokenSelect');
      if (sel.options.length > 0) sel.options[0].textContent = '-- \u8BF7\u9009\u62E9\u5F85\u5206\u914D\u7684 Token --';
      // \u76D1\u542C\u9009\u62E9\u53D8\u5316\u663E\u793A\u9884\u89C8
      sel.onchange = function() {
        var preview = document.getElementById('bindTokenPreview');
        if (sel.value) {
          try {
            var p = JSON.parse(sel.value);
            preview.innerHTML = '<b>Token:</b> ' + p.token + '<br><b>\u7EC4\u5408:</b> ' + (p.collectionName || '-');
            preview.style.display = 'block';
          } catch(e) { preview.style.display = 'none'; }
        } else { preview.style.display = 'none'; }
      };
      document.getElementById('bindSubModal').classList.add('active');
    }
    
    async function submitBindSub(e) {
      e.preventDefault();
      var username = document.getElementById('bindSubUsername').value;
      var tokenVal = document.getElementById('bindTokenSelect').value;
      if (!tokenVal) { alert('\u8BF7\u9009\u62E9\u4E00\u4E2A Token'); return; }
      var parsed;
      try { parsed = JSON.parse(tokenVal); } catch(e) { alert('Token \u6570\u636E\u5F02\u5E38'); return; }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: parsed.collectionName, token: parsed.token }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7ED1\u5B9A\u6210\u529F\uFF01');
          closeModal('bindSubModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u7ED1\u5B9A\u5931\u8D25: ' + result.error, 'error'); }
      } catch (err) { alert('\u7F51\u7EDC\u9519\u8BEF'); }
    }
    
    function editUser(username) {
      const note = prompt('\u8BF7\u8F93\u5165\u5907\u6CE8:');
      if (note === null) return;
      
      fetch('/api/admin/users/' + username, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customNote: note }),
      }).then(r => r.json()).then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('\u66F4\u65B0\u5931\u8D25: ' + data.error);
        }
      });
    }
    
    function deleteUser(username) {
      if (!confirm('\u786E\u5B9A\u5220\u9664\u7528\u6237 ' + username + '?')) return;
      
      fetch('/api/admin/users/' + username, {
        method: 'DELETE',
      }).then(r => r.json()).then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('\u5220\u9664\u5931\u8D25: ' + data.error);
        }
      });
    }
    
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
    
    // Sub-Store \u914D\u7F6E\u76F8\u5173\u51FD\u6570
    let substoreConfig = { baseUrl: '', backendPrefix: '', collections: [] };
    
    async function loadSubstoreConfig() {
      try {
        const res = await fetch('/api/admin/substore/config');
        substoreConfig = await res.json();
        return substoreConfig;
      } catch (err) {
        console.error('\u52A0\u8F7D Sub-Store \u914D\u7F6E\u5931\u8D25', err);
        return { baseUrl: '', backendPrefix: '', collections: [] };
      }
    }
    
    async function showSubstoreConfig() {
      await loadSubstoreConfig();
      document.getElementById('substoreBaseUrl').value = substoreConfig.baseUrl || '';
      document.getElementById('substoreBackendPrefix').value = substoreConfig.backendPrefix || '';
      renderCollectionsList();
      // \u91CD\u7F6E\u5206\u4EAB\u7528\u6237\u5217\u8868
      document.getElementById('shareTokensList').innerHTML = 
        '<div style="color:#999;text-align:center;font-size:13px;">\u70B9\u51FB\u300C\u67E5\u8BE2\u5206\u4EAB\u7528\u6237\u300D\u4ECE Sub-Store \u83B7\u53D6</div>';
      // \u91CD\u7F6E\u8FDE\u63A5\u6D4B\u8BD5\u7ED3\u679C
      document.getElementById('connectionTestResult').style.display = 'none';
      document.getElementById('substoreConfigModal').classList.add('active');
    }
    
    function renderCollectionsList() {
      const container = document.getElementById('collectionsList');
      if (!substoreConfig.collections || substoreConfig.collections.length === 0) {
        container.innerHTML = '<div style="color:#999;text-align:center;">\u6682\u65E0\u8BA2\u9605\u7EC4\u5408</div>';
        return;
      }
      container.innerHTML = substoreConfig.collections.map((col, idx) => 
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;">' +
          '<span>' + col.name + '</span>' +
          '<button type="button" onclick="removeCollection(' + idx + ')" style="border:none;background:#e74c3c;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;">\u5220\u9664</button>' +
        '</div>'
      ).join('');
    }
    
    function removeCollection(idx) {
      substoreConfig.collections.splice(idx, 1);
      renderCollectionsList();
    }
    
    function addCollection() {
      const name = document.getElementById('newCollectionName').value.trim();
      if (!name) {
        alert('\u8BF7\u8F93\u5165\u7EC4\u5408\u540D\u79F0');
        return;
      }
      if (substoreConfig.collections.some(c => c.name === name)) {
        alert('\u8BE5\u7EC4\u5408\u5DF2\u5B58\u5728');
        return;
      }
      substoreConfig.collections.push({ name });
      document.getElementById('newCollectionName').value = '';
      renderCollectionsList();
    }
    
    async function submitSubstoreConfig(e) {
      e.preventDefault();
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      if (!baseUrl) {
        alert('\u8BF7\u8F93\u5165 Sub-Store \u5730\u5740');
        return;
      }
      
      try {
        const res = await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
        const result = await res.json();
        if (result.success) {
          alert('\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01');
          closeModal('substoreConfigModal');
        } else {
          alert('\u4FDD\u5B58\u5931\u8D25: ' + result.error);
        }
      } catch (err) {
        alert('\u7F51\u7EDC\u9519\u8BEF');
      }
    }
    
    // \u6D4B\u8BD5 Sub-Store \u8FDE\u63A5
    async function testSubstoreConnection() {
      const resultEl = document.getElementById('connectionTestResult');
      resultEl.style.display = 'block';
      resultEl.style.color = '#666';
      resultEl.textContent = '\u6B63\u5728\u6D4B\u8BD5\u8FDE\u63A5...';
      
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '\u274C \u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00';
        return;
      }
      
      // \u5148\u4FDD\u5B58\u518D\u67E5\u8BE2
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565\u4FDD\u5B58\u9519\u8BEF */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (data.success) {
          const count = Array.isArray(data.tokens) ? data.tokens.length : 0;
          resultEl.style.color = '#27ae60';
          resultEl.textContent = '\u2705 \u8FDE\u63A5\u6210\u529F\uFF01\u53D1\u73B0 ' + count + ' \u4E2A\u5206\u4EAB Token';
        } else {
          resultEl.style.color = '#e74c3c';
          resultEl.textContent = '\u274C ' + (data.error || '\u8FDE\u63A5\u5931\u8D25');
        }
      } catch (err) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    // \u67E5\u8BE2\u5206\u4EAB\u7528\u6237 Token \u5217\u8868
    async function queryShareTokens() {
      const container = document.getElementById('shareTokensList');
      container.innerHTML = '<div style="color:#666;text-align:center;font-size:13px;">\u23F3 \u6B63\u5728\u67E5\u8BE2...</div>';
      
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C \u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00</div>';
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565 */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (!data.success) {
          container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C ' + (data.error || '\u67E5\u8BE2\u5931\u8D25') + '</div>';
          return;
        }
        
        const tokens = data.tokens;
        if (!Array.isArray(tokens) || tokens.length === 0) {
          container.innerHTML = '<div style="color:#999;text-align:center;font-size:13px;">\u6682\u65E0\u5206\u4EAB Token</div>';
          return;
        }
        
        // \u6E32\u67D3 token \u5217\u8868
        container.innerHTML = '<div style="font-size:12px;color:#999;margin-bottom:8px;">\u5171 ' + tokens.length + ' \u4E2A\u5206\u4EAB Token</div>' +
          tokens.map(function(t) {
            var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleString('zh-CN') : '\u672A\u77E5';
            var expireInfo = '';
            if (t.exp) {
              var now = Date.now();
              if (t.exp < now) {
                expireInfo = '<span style="color:#e74c3c;">\u5DF2\u8FC7\u671F</span>';
              } else {
                var daysLeft = Math.ceil((t.exp - now) / (1000*60*60*24));
                expireInfo = '<span style="color:#27ae60;">' + daysLeft + '\u5929\u540E\u8FC7\u671F</span>';
              }
            } else {
              expireInfo = '<span style="color:#27ae60;">\u6C38\u4E0D\u8FC7\u671F</span>';
            }
            var typeLabel = t.type === 'col' ? '\u7EC4\u5408' : (t.type === 'sub' ? '\u8BA2\u9605' : (t.type === 'file' ? '\u6587\u4EF6' : t.type));
            return '<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:6px;background:#fafafa;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                '<strong style="font-size:13px;color:#333;">\u{1F511} ' + (t.token || 'N/A') + '</strong>' +
                '<span style="font-size:11px;background:#667eea;color:white;padding:1px 6px;border-radius:3px;">' + typeLabel + '</span>' +
              '</div>' +
              '<div style="font-size:12px;color:#666;">' +
                '<span>\u{1F4E6} ' + (t.name || 'N/A') + '</span>' +
                '<span style="margin-left:12px;">\u{1F4C5} ' + createdAt + '</span>' +
                '<span style="margin-left:12px;">' + expireInfo + '</span>' +
              '</div>' +
            '</div>';
          }).join('');
      } catch (err) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C \u7F51\u7EDC\u9519\u8BEF</div>';
      }
    }
    
    // \u4ECE\u8FDC\u7A0B\u83B7\u53D6\u7EC4\u5408\u8BA2\u9605
    async function fetchRemoteCollections() {
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        alert('\u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00');
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565 */ }
      
      try {
        const res = await fetch('/api/admin/substore/collections/remote');
        const data = await res.json();
        
        if (!data.success) {
          alert('\u83B7\u53D6\u5931\u8D25: ' + (data.error || '\u672A\u77E5\u9519\u8BEF'));
          return;
        }
        
        const remoteCols = data.collections;
        if (!Array.isArray(remoteCols) || remoteCols.length === 0) {
          alert('\u8FDC\u7A0B\u65E0\u53EF\u7528\u7EC4\u5408');
          return;
        }
        
        // \u5408\u5E76\u8FDC\u7A0B\u7EC4\u5408\u5230\u672C\u5730\u914D\u7F6E
        let addedCount = 0;
        for (const rc of remoteCols) {
          const name = rc.name || rc;
          if (typeof name === 'string' && name.length > 0 && !substoreConfig.collections.some(c => c.name === name)) {
            substoreConfig.collections.push({ name });
            addedCount++;
          }
        }
        
        renderCollectionsList();
        alert('\u83B7\u53D6\u5B8C\u6210\uFF01\u65B0\u589E ' + addedCount + ' \u4E2A\u7EC4\u5408\uFF08\u5171 ' + remoteCols.length + ' \u4E2A\u8FDC\u7A0B\u7EC4\u5408\uFF09');
      } catch (err) {
        alert('\u7F51\u7EDC\u9519\u8BEF');
      }
    }
    
    // ===== \u672A\u7ED1\u5B9A\u5206\u4EAB Token \u529F\u80FD =====
    
    async function loadUnboundTokens() {
      var statusEl = document.getElementById('unboundTokensStatus');
      var gridEl = document.getElementById('unboundTokensGrid');
      statusEl.style.display = 'block';
      statusEl.textContent = '\u{1F504} \u6B63\u5728\u83B7\u53D6\u5206\u4EAB Token...';
      statusEl.style.color = '#999';
      gridEl.style.display = 'none';
      
      try {
        var res = await fetch('/api/admin/substore/tokens/unbound');
        var data = await res.json();
        if (!res.ok || !data.success) {
          if (data.needConfig) {
            statusEl.innerHTML = '\u2699\uFE0F \u8BF7\u5148\u5728 <a href="javascript:showSubstoreConfig()" style="color:#3498db;">Sub-Store \u914D\u7F6E</a> \u4E2D\u8BBE\u7F6E\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00';
          } else {
            statusEl.textContent = '\u274C ' + (data.error || '\u83B7\u53D6\u5931\u8D25');
            statusEl.style.color = '#e74c3c';
          }
          return;
        }
        allUnboundTokensData = data.tokens || [];
        var totalCount = data.totalCount || 0;
        var boundCount = data.boundCount || 0;
        // \u4F7F\u7528\u6240\u6709\u7528\u6237\u5217\u8868\uFF08\u5305\u542B\u7ED1\u5B9A\u72B6\u6001\u6807\u6CE8\uFF09
        window._allUsers = data.allUsers || [];
        
        if (allUnboundTokensData.length === 0) {
          statusEl.textContent = '\u2705 \u6240\u6709 ' + totalCount + ' \u4E2A\u5206\u4EAB Token \u5747\u5DF2\u7ED1\u5B9A\u7528\u6237';
          statusEl.style.color = '#27ae60';
          return;
        }
        statusEl.innerHTML = '\u5171 <b>' + totalCount + '</b> \u4E2A Token\uFF0C<span style="color:#27ae60">' + boundCount + '</span> \u4E2A\u5DF2\u7ED1\u5B9A\uFF0C<span style="color:#e67e22">' + allUnboundTokensData.length + '</span> \u4E2A\u5F85\u5206\u914D';
        statusEl.style.color = '#555';
        filterTokens();
      } catch (err) {
        statusEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u8FDE\u63A5';
        statusEl.style.color = '#e74c3c';
      }
    }
    
    function filterTokens() {
      var search = (document.getElementById('tokenSearch').value || '').toLowerCase();
      var filter = document.getElementById('tokenFilter').value;
      var sort = document.getElementById('tokenSort').value;
      var now = Date.now();
      
      var filtered = allUnboundTokensData.filter(function(t) {
        // \u7B5B\u9009
        if (filter === 'expired' && !(t.exp && t.exp < now)) return false;
        if (filter === '7days' && !(t.exp && t.exp > now && t.exp - now < 7*86400000)) return false;
        if (filter === '30days' && !(t.exp && t.exp > now && t.exp - now < 30*86400000)) return false;
        if (filter === 'valid' && (t.exp && t.exp < now)) return false;
        // \u641C\u7D22
        if (search) {
          var hay = ((t.token||'') + ' ' + (t.name||'') + ' ' + (t.displayName||'') + ' ' + (t.remark||'')).toLowerCase();
          if (hay.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      // \u6392\u5E8F
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return (b.createdAt||0) - (a.createdAt||0);
        if (sort === 'created_asc') return (a.createdAt||0) - (b.createdAt||0);
        if (sort === 'expire_asc') return (a.exp||Infinity) - (b.exp||Infinity);
        if (sort === 'expire_desc') return (b.exp||0) - (a.exp||0);
        return 0;
      });
      
      renderTokens(filtered);
    }
    
    function switchTokenView(view) {
      currentTokenView = view;
      document.getElementById('viewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('viewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('viewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('viewList').style.color = view === 'list' ? 'white' : '#333';
      filterTokens();
    }
    
    function renderTokens(tokens) {
      var gridEl = document.getElementById('unboundTokensGrid');
      gridEl.innerHTML = '';
      if (tokens.length === 0) {
        gridEl.style.display = 'block';
        gridEl.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">\u65E0\u5339\u914D\u7ED3\u679C</div>';
        return;
      }
      
      var allUsers = window._allUsers || [];
      var userOptions = '<option value="">-- \u9009\u62E9\u7528\u6237 --</option>';
      allUsers.forEach(function(u) {
        var label = u.username + (u.hasSub ? ' (\u5DF2\u7ED1\u5B9A)' : '');
        userOptions += '<option value="' + u.username + '">' + label + '</option>';
      });
      
      if (currentTokenView === 'list') {
        // \u5217\u8868\uFF08\u8868\u683C\uFF09\u89C6\u56FE
        gridEl.style.display = 'block';
        gridEl.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u7EC4\u5408</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u521B\u5EFA\u65F6\u95F4</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u5230\u671F</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u64CD\u4F5C</th>' +
          '</tr></thead><tbody>';
        tokens.forEach(function(t, idx) {
          var isExpired = t.exp ? t.exp < Date.now() : false;
          var expText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '\u6C38\u4E45';
          html += '<tr style="border-bottom:1px solid #eee;" id="unbound-token-' + idx + '" data-token="' + (t.token||'') + '" data-collection="' + (t.name||'') + '">' +
            '<td style="padding:8px;font-family:monospace;">' + (t.token||'N/A') + '</td>' +
            '<td style="padding:8px;">' + (t.name||'-') + '</td>' +
            '<td style="padding:8px;">' + (t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expText + '</td>' +
            '<td style="padding:8px;"><select id="bindUser_' + idx + '" style="padding:4px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-right:4px;">' + userOptions + '</select>' +
            '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:3px 8px;">\u7ED1\u5B9A</button></td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        gridEl.innerHTML = html;
      } else {
        // \u5361\u7247\u89C6\u56FE
        gridEl.style.display = 'grid';
        gridEl.className = 'users-grid';
        tokens.forEach(function(t, idx) {
          var tokenValue = t.token || '\u672A\u77E5';
          var collection = t.name || '-';
          var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-';
          var isExpired = t.exp ? (t.exp < Date.now()) : false;
          var expireText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '\u6C38\u4E45';
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.style.borderLeft = isExpired ? '4px solid #e74c3c' : '4px solid #3498db';
          card.id = 'unbound-token-' + idx;
          card.setAttribute('data-token', tokenValue);
          card.setAttribute('data-collection', collection);
          card.innerHTML =
            '<div class="user-name"><span style="font-family:monospace;font-size:14px;">\u{1F3AB} ' + tokenValue + '</span>' +
              (isExpired ? ' <span class="tag" style="background:#e74c3c;color:#fff;font-size:10px;">\u5DF2\u8FC7\u671F</span>' : '') +
            '</div>' +
            '<div class="subscription-info" style="margin-top:6px;">' +
              '<div><span class="label">\u7EC4\u5408:</span> ' + collection + '</div>' +
              '<div><span class="label">\u521B\u5EFA:</span> ' + createdAt + '</div>' +
              '<div><span class="label">\u5230\u671F:</span> <span style="color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expireText + '</span></div>' +
            '</div>' +
            '<div style="margin-top:10px;display:flex;gap:6px;align-items:center;">' +
              '<select id="bindUser_' + idx + '" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;">' + userOptions + '</select>' +
              '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:4px 10px;white-space:nowrap;">\u{1F517} \u7ED1\u5B9A</button>' +
            '</div>';
          gridEl.appendChild(card);
        });
      }
    }
    
    async function quickBindToken(idx) {
      var card = document.getElementById('unbound-token-' + idx);
      var tokenValue = card.getAttribute('data-token');
      var collectionName = card.getAttribute('data-collection');
      var selectEl = document.getElementById('bindUser_' + idx);
      var username = selectEl.value;
      if (!username) { alert('\u8BF7\u5148\u9009\u62E9\u8981\u7ED1\u5B9A\u7684\u7528\u6237'); return; }
      if (!confirm('\u786E\u5B9A\u5C06 Token\u300C' + tokenValue + '\u300D\u7ED1\u5B9A\u5230\u7528\u6237\u300C' + username + '\u300D\uFF1F')) return;
      
      var finalCollection = collectionName;
      if (!finalCollection || finalCollection === '-') {
        // \u4E0D\u4F7F\u7528\u9519\u8BEF\u7684\u9ED8\u8BA4\u503C\uFF0C\u63D0\u793A\u7BA1\u7406\u5458\u624B\u52A8\u8F93\u5165
        finalCollection = prompt('\u8BE5 Token \u672A\u5173\u8054\u7EC4\u5408\u540D\u79F0\uFF0C\u8BF7\u624B\u52A8\u8F93\u5165\u7EC4\u5408\u8BA2\u9605\u540D\u79F0\uFF1A');
        if (!finalCollection || !finalCollection.trim()) {
          alert('\u7EC4\u5408\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u8BF7\u91CD\u65B0\u64CD\u4F5C');
          return;
        }
        finalCollection = finalCollection.trim();
      }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: finalCollection, token: tokenValue }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7ED1\u5B9A\u6210\u529F\uFF01');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u7ED1\u5B9A\u5931\u8D25: ' + (result.error || '\u672A\u77E5\u9519\u8BEF'), 'error'); }
      } catch (err) { showToast('\u2764 \u7F51\u7EDC\u9519\u8BEF', 'error'); }
    }
  <\/script>

</body>
</html>`], [`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u7BA1\u7406\u540E\u53F0 - Sub-Store \u540C\u6B65\u5E73\u53F0</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 20px; }
    .header-actions { display: flex; gap: 10px; }
    .header-actions a, .header-actions button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
    }
    .container {
      max-width: 1000px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-danger { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
    .btn-success { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .user-card {
      border: 1px solid #e1e5eb;
      border-radius: 10px;
      padding: 16px;
      position: relative;
    }
    .user-card.admin-card {
      border-color: #e74c3c;
      background: #fff5f5;
    }
    .user-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .user-info {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    .subscription-info {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 12px;
    }
    .subscription-info .label { color: #999; margin-right: 4px; }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
    .tag-admin { background: #e74c3c; color: white; }
    .tag-expired { background: #e74c3c; color: white; }
    .tag-warning { background: #f39c12; color: white; }
    .tag-normal { background: #27ae60; color: white; }
    .tag-no-sub { background: #95a5a6; color: white; }
    .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
    .actions button {
      flex: 1;
      min-width: 60px;
      padding: 6px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .actions button:hover { background: #f5f5f5; }
    .sync-result {
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      display: none;
    }
    .sync-success { background: #d4edda; color: #155724; }
    .sync-error { background: #f8d7da; color: #721c24; }
    /* \u6A21\u6001\u6846\u6837\u5F0F */
    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.active { display: flex; }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #333;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group small {
      display: block;
      margin-top: 4px;
      color: #999;
      font-size: 12px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .form-actions button {
      padding: 10px 24px;
    }
    /* \u81EA\u52A8\u540C\u6B65\u914D\u7F6E */
    .sync-config {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .sync-config label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .sync-config select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    /* Toast \u901A\u77E5\u6837\u5F0F */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
      max-width: 350px;
    }
    .toast-success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
    .toast-error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .toast-info { background: linear-gradient(135deg, #3498db, #2980b9); }
    @keyframes toastIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-20px); } }
    /* \u540C\u6B65\u7ED3\u679C\u6837\u5F0F */
    .sync-result {
      display: none;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .sync-result.sync-success { background: #d4edda; color: #155724; display: block; }
    .sync-result.sync-error { background: #f8d7da; color: #721c24; display: block; }
  </style>
</head>
<body>
  <div class="toast-container" id="toastContainer"></div>
  <div class="header">
    <h1>\u{1F527} \u7BA1\u7406\u540E\u53F0</h1>
    <div class="header-actions">
      <a href="/">\u8FD4\u56DE\u4E3B\u9875</a>
      <button onclick="logout()">\u9000\u51FA\u767B\u5F55</button>
    </div>
  </div>
  
  <div class="container">
    <!-- \u5FEB\u901F\u64CD\u4F5C\u533A -->
    <div class="card">
      <div class="card-title">
        <span>\u26A1 \u5FEB\u901F\u64CD\u4F5C</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-success" onclick="syncAllUsers()">\u{1F504} \u5168\u5C40\u540C\u6B65</button>
        <a href="/api/admin/export" class="btn" style="text-decoration: none;">\u{1F4E5} \u5BFC\u51FA CSV</a>
        <button class="btn" onclick="showAddUserModal()">\u2795 \u6DFB\u52A0\u7528\u6237</button>
        <button class="btn" onclick="showSubstoreConfig()" style="background:linear-gradient(135deg,#f39c12 0%,#e67e22 100%);">\u{1F527} Sub-Store \u914D\u7F6E</button>
      </div>
      <div id="syncResult" class="sync-result"></div>
    </div>

    
    <!-- \u81EA\u52A8\u540C\u6B65\u914D\u7F6E -->
    <div class="card">
      <div class="card-title">
        <span>\u23F0 \u81EA\u52A8\u540C\u6B65\u914D\u7F6E</span>
      </div>
      <div class="sync-config">
        <label>
          <input type="checkbox" id="autoSyncEnabled" onchange="updateAutoSync()">
          \u542F\u7528\u81EA\u52A8\u540C\u6B65
        </label>
        <select id="syncInterval" onchange="updateAutoSync()">
          <option value="15">\u6BCF 15 \u5206\u949F</option>
          <option value="30" selected>\u6BCF 30 \u5206\u949F</option>
          <option value="60">\u6BCF\u5C0F\u65F6</option>
          <option value="360">\u6BCF 6 \u5C0F\u65F6</option>
          <option value="1440">\u6BCF\u5929</option>
        </select>
        <span id="lastSyncTime" style="color:#666;font-size:13px;"></span>
      </div>
    </div>
    
    <!-- \u5F85\u5206\u914D\u7684\u5206\u4EAB Token -->
    <div class="card" id="unboundTokensCard">
      <div class="card-title">
        <span>\u{1F3AB} \u5F85\u5206\u914D\u7684\u5206\u4EAB Token</span>
        <button class="btn btn-sm" onclick="loadUnboundTokens()" style="font-size:12px;padding:4px 12px;">\u{1F504} \u5237\u65B0</button>
      </div>
      <!-- \u5DE5\u5177\u680F\uFF1A\u641C\u7D22/\u7B5B\u9009/\u6392\u5E8F/\u89C6\u56FE\u5207\u6362 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="tokenSearch" placeholder="\u{1F50D} \u641C\u7D22 Token / \u540D\u79F0 / \u5907\u6CE8..." oninput="filterTokens()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="tokenFilter" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">\u5168\u90E8</option>
          <option value="expired">\u5DF2\u8FC7\u671F</option>
          <option value="7days">7\u5929\u5185\u5230\u671F</option>
          <option value="30days">30\u5929\u5185\u5230\u671F</option>
          <option value="valid">\u6709\u6548</option>
        </select>
        <select id="tokenSort" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">\u521B\u5EFA\u65F6\u95F4 \u2193</option>
          <option value="created_asc">\u521B\u5EFA\u65F6\u95F4 \u2191</option>
          <option value="expire_asc">\u6709\u6548\u671F \u2191</option>
          <option value="expire_desc">\u6709\u6548\u671F \u2193</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="viewCard" onclick="switchTokenView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">\u5361\u7247</button>
          <button id="viewList" onclick="switchTokenView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">\u5217\u8868</button>
        </div>
      </div>
      <div id="unboundTokensStatus" style="color:#999;text-align:center;padding:16px;font-size:13px;">
        \u52A0\u8F7D\u4E2D...
      </div>
      <div id="unboundTokensGrid" class="users-grid" style="display:none;"></div>
    </div>
    
    <div class="card">
      <div class="card-title">
        <span>\u{1F465} \u7528\u6237\u5217\u8868\uFF08<span id="userCountLabel">`, `</span> \u4F4D\u7528\u6237\uFF09</span>
        <button class="btn btn-success btn-sm" onclick="syncBoundUsers()" style="font-size:12px;padding:4px 14px;">\u{1F504} \u540C\u6B65\u6240\u6709\u5DF2\u7ED1\u5B9A</button>
      </div>
      <div id="syncBoundResult" class="sync-result"></div>
      <!-- \u7528\u6237\u641C\u7D22/\u6392\u5E8F/\u89C6\u56FE\u5207\u6362\u5DE5\u5177\u680F -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="userSearch" placeholder="\u{1F50D} \u641C\u7D22\u7528\u6237\u540D / \u5907\u6CE8 / Token..." oninput="filterUsers()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="userSort" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">\u521B\u5EFA\u65F6\u95F4 \u2193</option>
          <option value="created_asc">\u521B\u5EFA\u65F6\u95F4 \u2191</option>
          <option value="login_desc">\u6700\u540E\u767B\u5F55 \u2193</option>
          <option value="name_asc">\u7528\u6237\u540D A-Z</option>
        </select>
        <select id="userFilter" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">\u5168\u90E8</option>
          <option value="bound">\u5DF2\u7ED1\u5B9A</option>
          <option value="unbound">\u672A\u7ED1\u5B9A</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="userViewCard" onclick="switchUserView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">\u5361\u7247</button>
          <button id="userViewList" onclick="switchUserView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">\u5217\u8868</button>
        </div>
      </div>
      <div id="usersGrid" class="users-grid">
        <!-- \u7BA1\u7406\u5458\u5361\u7247\uFF08\u56FA\u5B9A\uFF09 -->
        <div class="user-card admin-card">
          <div class="user-name">`, ' <span class="tag tag-admin">\u7BA1\u7406\u5458</span></div>\n          <div class="user-info">\u7CFB\u7EDF\u7BA1\u7406\u5458\u8D26\u6237</div>\n          <div class="subscription-info">\n            <div><span class="label">\u5168\u5C40\u8282\u70B9:</span> ', ' \u4E2A</div>\n            <div><span class="label">\u6700\u65E9\u5230\u671F:</span> ', `</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- \u6DFB\u52A0\u7528\u6237\u6A21\u6001\u6846 -->
  <div class="modal" id="addUserModal">
    <div class="modal-content">
      <div class="modal-title">\u2795 \u6DFB\u52A0\u65B0\u7528\u6237</div>
      <form id="addUserForm" onsubmit="submitAddUser(event)">
        <div class="form-group">
          <label>\u7528\u6237\u540D *</label>
          <input type="text" name="username" required placeholder="\u8F93\u5165\u7528\u6237\u540D">
        </div>
        <div class="form-group">
          <label>\u5BC6\u7801 *</label>
          <input type="password" name="password" required placeholder="\u8F93\u5165\u5BC6\u7801\uFF08\u81F3\u5C11 6 \u4F4D\uFF09" minlength="6">
        </div>
        <div class="form-group">
          <label>\u7ED1\u5B9A\u5206\u4EAB Token</label>
          <select name="shareToken" id="addUserTokenSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- \u4E0D\u7ED1\u5B9A --</option>
          </select>
          <small>\u4ECE\u5F85\u5206\u914D\u7684\u5206\u4EAB Token \u4E2D\u9009\u62E9\uFF0C\u521B\u5EFA\u7528\u6237\u540E\u5C06\u81EA\u52A8\u7ED1\u5B9A</small>
        </div>
        <div class="form-group">
          <label>\u5907\u6CE8</label>
          <textarea name="customNote" rows="2" placeholder="\u53EF\u9009\u5907\u6CE8\u4FE1\u606F"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('addUserModal')">\u53D6\u6D88</button>
          <button type="submit" class="btn btn-success">\u521B\u5EFA\u7528\u6237</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- \u7ED1\u5B9A\u8BA2\u9605\u6A21\u6001\u6846 -->
  <div class="modal" id="bindSubModal">
    <div class="modal-content">
      <div class="modal-title">\u{1F517} \u7ED1\u5B9A\u5206\u4EAB Token</div>
      <form id="bindSubForm" onsubmit="submitBindSub(event)">
        <input type="hidden" name="username" id="bindSubUsername">
        <div class="form-group">
          <label>\u9009\u62E9\u5206\u4EAB Token *</label>
          <select name="shareToken" id="bindTokenSelect" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- \u8BF7\u9009\u62E9\u5F85\u5206\u914D\u7684 Token --</option>
          </select>
          <small>\u4ECE\u5F85\u5206\u914D\u7684\u5206\u4EAB Token \u4E2D\u9009\u62E9</small>
        </div>
        <div id="bindTokenPreview" style="display:none;background:#f8f9fa;padding:10px;border-radius:6px;margin-bottom:12px;font-size:12px;"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('bindSubModal')">\u53D6\u6D88</button>
          <button type="submit" class="btn btn-success">\u4FDD\u5B58\u7ED1\u5B9A</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Sub-Store \u914D\u7F6E\u6A21\u6001\u6846 -->
  <div class="modal" id="substoreConfigModal">
    <div class="modal-content" style="max-width:650px;">
      <div class="modal-title">\u{1F527} Sub-Store \u914D\u7F6E</div>
      <form id="substoreConfigForm" onsubmit="submitSubstoreConfig(event)">
        <div class="form-group">
          <label>Sub-Store \u5730\u5740 *</label>
          <input type="url" name="baseUrl" id="substoreBaseUrl" required placeholder="https://sub.example.com">
          <small>\u4F60\u7684 Sub-Store \u670D\u52A1\u5730\u5740</small>
        </div>
        <div class="form-group">
          <label>\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="substoreBackendPrefix" placeholder="/your-backend-prefix" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="testSubstoreConnection()" style="white-space:nowrap;">\u{1F517} \u6D4B\u8BD5</button>
          </div>
          <small>Sub-Store \u540E\u7AEF API \u8DEF\u5F84\u524D\u7F00\uFF08\u5982 /your-backend-prefix\uFF09\uFF0C\u7528\u4E8E\u67E5\u8BE2\u5206\u4EAB\u4FE1\u606F</small>
          <div id="connectionTestResult" style="margin-top:4px;font-size:12px;display:none;"></div>
        </div>
        
        <!-- \u5206\u4EAB\u7528\u6237\u67E5\u8BE2 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>\u{1F4E4} \u5206\u4EAB\u7528\u6237\uFF08Token \u5217\u8868\uFF09</span>
            <button type="button" class="btn btn-sm btn-success" onclick="queryShareTokens()" style="font-size:11px;padding:4px 10px;">\u{1F50D} \u67E5\u8BE2\u5206\u4EAB\u7528\u6237</button>
          </label>
          <div id="shareTokensList" style="max-height:250px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;">
            <div style="color:#999;text-align:center;font-size:13px;">\u70B9\u51FB\u300C\u67E5\u8BE2\u5206\u4EAB\u7528\u6237\u300D\u4ECE Sub-Store \u83B7\u53D6</div>
          </div>
        </div>

        <!-- \u53EF\u7528\u8BA2\u9605\u7EC4\u5408 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>\u53EF\u7528\u8BA2\u9605\u7EC4\u5408</span>
            <button type="button" class="btn btn-sm" onclick="fetchRemoteCollections()" style="font-size:11px;padding:4px 10px;">\u{1F4E5} \u4ECE\u8FDC\u7A0B\u83B7\u53D6</button>
          </label>
          <div id="collectionsList" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:10px;">
            <div style="color:#999;text-align:center;">\u6682\u65E0\u8BA2\u9605\u7EC4\u5408</div>
          </div>
        </div>
        <div class="form-group">
          <label>\u6DFB\u52A0\u65B0\u7EC4\u5408</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="newCollectionName" placeholder="\u8F93\u5165\u7EC4\u5408\u540D\u79F0" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="addCollection()">\u6DFB\u52A0</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('substoreConfigModal')">\u5173\u95ED</button>
          <button type="submit" class="btn btn-success">\u4FDD\u5B58\u914D\u7F6E</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- \u4E0D\u53EF\u89C1\u7684\u6570\u636E\u5BB9\u5668 -->
  <script id="server-data-users" type="application/json">
    `, `
  <\/script>
  
  <script>
      // ===== Toast \u901A\u77E5\u51FD\u6570 =====
      function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
      }

      // ===== \u5168\u5C40\u6570\u636E\u521D\u59CB\u5316 =====
      var allUsersData = [];
      var allUnboundTokensData = [];
      var currentTokenView = 'card';
      
      try {
        var usersDataEl = document.getElementById('server-data-users');
        if (usersDataEl) {
          allUsersData = JSON.parse(usersDataEl.textContent);
        }
      } catch (e) {
        console.error('Failed to parse server data', e);
      }
    
    // \u9875\u9762\u52A0\u8F7D
    document.addEventListener('DOMContentLoaded', function() {
      loadAutoSyncConfig();
      // \u6062\u590D\u89C6\u56FE\u6A21\u5F0F\u6309\u94AE\u72B6\u6001
      if (currentUserView === 'list') {
        document.getElementById('userViewCard').style.background = 'white';
        document.getElementById('userViewCard').style.color = '#333';
        document.getElementById('userViewList').style.background = '#667eea';
        document.getElementById('userViewList').style.color = 'white';
      }
      renderUserCards();
      loadUnboundTokens();
    });
    
    // ===== \u81EA\u52A8\u540C\u6B65\u914D\u7F6E =====
    async function loadAutoSyncConfig() {
      try {
        const res = await fetch('/api/admin/sync/config');
        const config = await res.json();
        document.getElementById('autoSyncEnabled').checked = config.enabled;
        document.getElementById('syncInterval').value = config.intervalMinutes || 30;
        if (config.lastScheduledSync) {
          document.getElementById('lastSyncTime').textContent = 
            '\u4E0A\u6B21\u540C\u6B65: ' + new Date(config.lastScheduledSync).toLocaleString('zh-CN');
        }
      } catch (err) { console.error('\u52A0\u8F7D\u540C\u6B65\u914D\u7F6E\u5931\u8D25', err); }
    }
    
    async function updateAutoSync() {
      var enabled = document.getElementById('autoSyncEnabled').checked;
      var intervalMinutes = parseInt(document.getElementById('syncInterval').value);
      try {
        await fetch('/api/admin/sync/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: enabled, intervalMinutes: intervalMinutes }),
        });
      } catch (err) { alert('\u66F4\u65B0\u914D\u7F6E\u5931\u8D25'); }
    }
    
    // ===== \u5168\u5C40\u540C\u6B65\uFF08\u5408\u5E76\u540E\uFF09 =====
    async function syncAllUsers() {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '\u{1F504} \u6B63\u5728\u5168\u5C40\u540C\u6B65\u6240\u6709\u7528\u6237...';
      try {
        var res = await fetch('/api/admin/sync/all', { method: 'POST' });
        var data = await res.json();
        if (data.error) {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '\u274C ' + data.error;
        } else {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '\u2705 \u540C\u6B65\u5B8C\u6210\uFF01\u5171 ' + data.total + ' \u4E2A\u7528\u6237\uFF0C\u5DF2\u7ED1\u5B9A ' + (data.synced||0) + ' \u4E2A\uFF0C\u6210\u529F ' + data.success + '\uFF0C\u5931\u8D25 ' + data.failed;
          setTimeout(function(){ location.reload(); }, 2000);
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    async function syncUser(username) {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '\u6B63\u5728\u540C\u6B65 ' + username + '...';
      try {
        var res = await fetch('/api/admin/users/' + username + '/sync', { method: 'POST' });
        var data = await res.json();
        if (data.success) {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '\u2705 \u540C\u6B65\u6210\u529F\uFF01\u8282\u70B9\u6570: ' + data.nodeCount;
          setTimeout(function(){ location.reload(); }, 1500);
        } else {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '\u274C \u540C\u6B65\u5931\u8D25: ' + data.error;
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    // ===== \u7528\u6237\u5217\u8868\u52A8\u6001\u6E32\u67D3 =====
    var currentUserView = sessionStorage.getItem('userViewMode') || 'card';
    
    function getExpireTagHtml(earliestExpire) {
      if (!earliestExpire) return '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
      var now = new Date();
      var exp = new Date(earliestExpire);
      var diffDays = Math.ceil((exp - now) / (1000*60*60*24));
      if (diffDays < 0) return '<span class="tag" style="background:#e74c3c;color:#fff;">\u5DF2\u8FC7\u671F</span>';
      if (diffDays <= 7) return '<span class="tag" style="background:#e67e22;color:#fff;">' + diffDays + '\u5929</span>';
      if (diffDays <= 30) return '<span class="tag" style="background:#f39c12;color:#fff;">' + diffDays + '\u5929</span>';
      return '<span class="tag" style="background:#27ae60;color:#fff;">' + diffDays + '\u5929</span>';
    }
    
    function switchUserView(view) {
      currentUserView = view;
      sessionStorage.setItem('userViewMode', view);
      document.getElementById('userViewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('userViewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('userViewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('userViewList').style.color = view === 'list' ? 'white' : '#333';
      renderUserCards();
    }
    
    function renderUserCards() {
      var search = (document.getElementById('userSearch').value || '').toLowerCase();
      var sort = document.getElementById('userSort').value;
      var filter = document.getElementById('userFilter').value;
      
      var filtered = allUsersData.filter(function(u) {
        if (filter === 'bound' && !u.subscriptionConfig) return false;
        if (filter === 'unbound' && u.subscriptionConfig) return false;
        if (search) {
          var haystack = (u.username + ' ' + (u.customNote||'') + ' ' + (u.subscriptionConfig ? u.subscriptionConfig.token + ' ' + u.subscriptionConfig.collectionName : '')).toLowerCase();
          if (haystack.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === 'created_asc') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sort === 'login_desc') return new Date(b.lastLogin||0) - new Date(a.lastLogin||0);
        if (sort === 'name_asc') return a.username.localeCompare(b.username);
        return 0;
      });
      
      document.getElementById('userCountLabel').textContent = filtered.length + 1;
      
      var grid = document.getElementById('usersGrid');
      var adminCard = grid.querySelector('.admin-card');
      grid.innerHTML = '';
      
      if (currentUserView === 'list') {
        // \u5217\u8868\uFF08\u8868\u683C\uFF09\u89C6\u56FE
        grid.style.display = 'block';
        grid.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u7528\u6237\u540D</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u7EC4\u5408</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u8282\u70B9</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u72B6\u6001</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u6700\u540E\u540C\u6B65</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">\u64CD\u4F5C</th>' +
          '</tr></thead><tbody>';
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">\u672A\u7ED1\u5B9A</span>';
          }
          html += '<tr style="border-bottom:1px solid #eee;">' +
            '<td style="padding:8px;font-weight:500;">' + u.username + (u.customNote ? ' <span style="color:#999;font-size:11px;">(' + u.customNote + ')</span>' : '') + '</td>' +
            '<td style="padding:8px;">' + (u.subscriptionConfig ? u.subscriptionConfig.collectionName : '-') + '</td>' +
            '<td style="padding:8px;"><code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + (u.subscriptionConfig ? u.subscriptionConfig.token : '-') + '</code></td>' +
            '<td style="padding:8px;">' + (u.lastSyncResult ? u.lastSyncResult.nodeCount + ' \u4E2A' : '-') + '</td>' +
            '<td style="padding:8px;">' + subTag + '</td>' +
            '<td style="padding:8px;font-size:12px;color:#666;">' + (u.lastSyncResult ? new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;white-space:nowrap;">' +
              '<button onclick="editUser(\\\\\\'' + u.username + '\\\\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u270F\uFE0F</button>' +
              '<button onclick="bindSubscription(\\\\\\'' + u.username + '\\\\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u{1F517}</button>' +
              '<button onclick="syncUser(\\\\\\'' + u.username + '\\\\\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + ' style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">\u{1F504}</button>' +
              '<button onclick="deleteUser(\\\\\\'' + u.username + '\\\\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;">\u{1F5D1}\uFE0F</button>' +
            '</td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        grid.innerHTML = html;
      } else {
        // \u5361\u7247\u89C6\u56FE
        grid.style.display = 'grid';
        grid.className = 'users-grid';
        if (adminCard) grid.appendChild(adminCard);
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">\u5F85\u540C\u6B65</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">\u672A\u7ED1\u5B9A</span>';
          }
          
          var subInfo = '';
          if (u.subscriptionConfig) {
            subInfo = '<div class="subscription-info">' +
              '<div><span class="label">\u7EC4\u5408:</span> ' + u.subscriptionConfig.collectionName + '</div>' +
              '<div><span class="label">Token:</span> <code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + u.subscriptionConfig.token + '</code></div>' +
              (u.lastSyncResult ? 
                '<div><span class="label">\u8282\u70B9:</span> ' + u.lastSyncResult.nodeCount + ' \u4E2A</div>' +
                '<div><span class="label">\u6700\u540E\u540C\u6B65:</span> ' + new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') + '</div>'
                : '<div style="color:#f39c12;">\u5C1A\u672A\u540C\u6B65</div>') +
              '</div>';
          } else {
            subInfo = '<div class="subscription-info" style="color:#999;">\u672A\u7ED1\u5B9A\u8BA2\u9605\u94FE\u63A5</div>';
          }
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.id = 'user-' + u.username;
          card.innerHTML = '<div class="user-name">' + u.username + ' ' + (u.isAdmin ? '<span class="tag tag-admin">\u7BA1\u7406\u5458</span> ' : '') + subTag + '</div>' +
            '<div class="user-info">\u521B\u5EFA\u4E8E: ' + new Date(u.createdAt).toLocaleDateString('zh-CN') + '</div>' +
            (u.lastLogin ? '<div class="user-info">\u6700\u540E\u767B\u5F55: ' + new Date(u.lastLogin).toLocaleString('zh-CN') + '</div>' : '') +
            (u.customNote ? '<div class="user-info">\u5907\u6CE8: ' + u.customNote + '</div>' : '') +
            subInfo +
            '<div class="actions">' +
              '<button onclick="editUser(\\\\\\'' + u.username + '\\\\\\')">\u270F\uFE0F \u7F16\u8F91</button>' +
              '<button onclick="bindSubscription(\\\\\\'' + u.username + '\\\\\\')">\u{1F517} \u7ED1\u5B9A</button>' +
              '<button onclick="syncUser(\\\\\\'' + u.username + '\\\\\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + '>\u{1F504} \u540C\u6B65</button>' +
              '<button onclick="deleteUser(\\\\\\'' + u.username + '\\\\\\')">\u{1F5D1}\uFE0F \u5220\u9664</button>' +
            '</div>';
          grid.appendChild(card);
        });
      }
    }
    function filterUsers() { renderUserCards(); }
    
    // ===== \u4E00\u952E\u540C\u6B65\u6240\u6709\u5DF2\u7ED1\u5B9A\u7528\u6237 =====
    async function syncBoundUsers() {
      var boundUsers = allUsersData.filter(function(u) { return !!u.subscriptionConfig; });
      if (boundUsers.length === 0) {
        showToast('\u6CA1\u6709\u5DF2\u7ED1\u5B9A\u7684\u7528\u6237', 'info');
        return;
      }
      var resultEl = document.getElementById('syncBoundResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.style.background = '#e8f4fd';
      resultEl.style.color = '#333';
      
      var total = boundUsers.length;
      var successCount = 0;
      var failCount = 0;
      resultEl.textContent = '\u{1F504} \u6B63\u5728\u540C\u6B65 0/' + total + ' ...';
      
      for (var i = 0; i < boundUsers.length; i++) {
        var u = boundUsers[i];
        try {
          var res = await fetch('/api/admin/users/' + u.username + '/sync', { method: 'POST' });
          var data = await res.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
        resultEl.textContent = '\u{1F504} \u6B63\u5728\u540C\u6B65 ' + (i + 1) + '/' + total + ' (\u2705' + successCount + ' \u274C' + failCount + ')';
      }
      
      if (failCount === 0) {
        resultEl.className = 'sync-result sync-success';
        resultEl.textContent = '\u2705 \u5168\u90E8\u540C\u6B65\u5B8C\u6210\uFF01\u5171 ' + total + ' \u4E2A\u7528\u6237\uFF0C\u5168\u90E8\u6210\u529F';
      } else {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '\u540C\u6B65\u5B8C\u6210\uFF1A\u5171 ' + total + ' \u4E2A\u7528\u6237\uFF0C\u6210\u529F ' + successCount + '\uFF0C\u5931\u8D25 ' + failCount;
      }
      setTimeout(function() { location.reload(); }, 2000);
    }
    
    // ===== \u6A21\u6001\u6846\u5DE5\u5177 =====
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    
    // ===== \u6DFB\u52A0\u7528\u6237\uFF08\u4ECE\u5F85\u5206\u914D Token \u9009\u62E9\uFF09 =====
    async function showAddUserModal() {
      document.getElementById('addUserModal').classList.add('active');
      document.getElementById('addUserForm').reset();
      await populateTokenSelect('addUserTokenSelect');
    }
    
    async function populateTokenSelect(selectId) {
      var sel = document.getElementById(selectId);
      sel.innerHTML = '<option value="">-- \u4E0D\u7ED1\u5B9A --</option>';
      // \u5982\u679C\u5DF2\u6709\u7F13\u5B58\u7684 unbound tokens \u6570\u636E\u5C31\u7528\uFF0C\u5426\u5219\u53BB\u62C9
      var tokens = allUnboundTokensData;
      if (!tokens || tokens.length === 0) {
        try {
          var res = await fetch('/api/admin/substore/tokens/unbound');
          var data = await res.json();
          if (data.success) tokens = data.tokens || [];
        } catch(e) {}
      }
      tokens.forEach(function(t) {
        var opt = document.createElement('option');
        var tokenVal = t.token || '';
        var colName = t.name || '';
        opt.value = JSON.stringify({ token: tokenVal, collectionName: colName });
        var label = '\u{1F3AB} ' + tokenVal;
        if (colName) label += ' (' + colName + ')';
        if (t.exp) {
          var d = Math.ceil((t.exp - Date.now()) / (1000*60*60*24));
          label += d < 0 ? ' [\u5DF2\u8FC7\u671F]' : ' [' + d + '\u5929]';
        }
        opt.textContent = label;
        sel.appendChild(opt);
      });
    }
    
    async function submitAddUser(e) {
      e.preventDefault();
      var form = e.target;
      var data = {
        username: form.username.value,
        password: form.password.value,
        customNote: form.customNote.value || undefined,
      };
      // \u4ECE\u4E0B\u62C9\u9009\u62E9\u7684 Token \u89E3\u6790
      var tokenVal = form.shareToken.value;
      if (tokenVal) {
        try {
          var parsed = JSON.parse(tokenVal);
          data.subscriptionConfig = { collectionName: parsed.collectionName, token: parsed.token };
        } catch(e) {}
      }
      try {
        var res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7528\u6237 ' + data.username + ' \u521B\u5EFA\u6210\u529F\uFF01');
          closeModal('addUserModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u521B\u5EFA\u5931\u8D25: ' + result.error, 'error'); }
      } catch (err) { alert('\u7F51\u7EDC\u9519\u8BEF'); }
    }
    
    // ===== \u7ED1\u5B9A\u5206\u4EAB Token =====
    async function bindSubscription(username) {
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindSubForm').reset();
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindTokenPreview').style.display = 'none';
      await populateTokenSelect('bindTokenSelect');
      // \u4FEE\u6539\u7B2C\u4E00\u4E2A\u9009\u9879\u6587\u5B57
      var sel = document.getElementById('bindTokenSelect');
      if (sel.options.length > 0) sel.options[0].textContent = '-- \u8BF7\u9009\u62E9\u5F85\u5206\u914D\u7684 Token --';
      // \u76D1\u542C\u9009\u62E9\u53D8\u5316\u663E\u793A\u9884\u89C8
      sel.onchange = function() {
        var preview = document.getElementById('bindTokenPreview');
        if (sel.value) {
          try {
            var p = JSON.parse(sel.value);
            preview.innerHTML = '<b>Token:</b> ' + p.token + '<br><b>\u7EC4\u5408:</b> ' + (p.collectionName || '-');
            preview.style.display = 'block';
          } catch(e) { preview.style.display = 'none'; }
        } else { preview.style.display = 'none'; }
      };
      document.getElementById('bindSubModal').classList.add('active');
    }
    
    async function submitBindSub(e) {
      e.preventDefault();
      var username = document.getElementById('bindSubUsername').value;
      var tokenVal = document.getElementById('bindTokenSelect').value;
      if (!tokenVal) { alert('\u8BF7\u9009\u62E9\u4E00\u4E2A Token'); return; }
      var parsed;
      try { parsed = JSON.parse(tokenVal); } catch(e) { alert('Token \u6570\u636E\u5F02\u5E38'); return; }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: parsed.collectionName, token: parsed.token }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7ED1\u5B9A\u6210\u529F\uFF01');
          closeModal('bindSubModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u7ED1\u5B9A\u5931\u8D25: ' + result.error, 'error'); }
      } catch (err) { alert('\u7F51\u7EDC\u9519\u8BEF'); }
    }
    
    function editUser(username) {
      const note = prompt('\u8BF7\u8F93\u5165\u5907\u6CE8:');
      if (note === null) return;
      
      fetch('/api/admin/users/' + username, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customNote: note }),
      }).then(r => r.json()).then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('\u66F4\u65B0\u5931\u8D25: ' + data.error);
        }
      });
    }
    
    function deleteUser(username) {
      if (!confirm('\u786E\u5B9A\u5220\u9664\u7528\u6237 ' + username + '?')) return;
      
      fetch('/api/admin/users/' + username, {
        method: 'DELETE',
      }).then(r => r.json()).then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('\u5220\u9664\u5931\u8D25: ' + data.error);
        }
      });
    }
    
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
    
    // Sub-Store \u914D\u7F6E\u76F8\u5173\u51FD\u6570
    let substoreConfig = { baseUrl: '', backendPrefix: '', collections: [] };
    
    async function loadSubstoreConfig() {
      try {
        const res = await fetch('/api/admin/substore/config');
        substoreConfig = await res.json();
        return substoreConfig;
      } catch (err) {
        console.error('\u52A0\u8F7D Sub-Store \u914D\u7F6E\u5931\u8D25', err);
        return { baseUrl: '', backendPrefix: '', collections: [] };
      }
    }
    
    async function showSubstoreConfig() {
      await loadSubstoreConfig();
      document.getElementById('substoreBaseUrl').value = substoreConfig.baseUrl || '';
      document.getElementById('substoreBackendPrefix').value = substoreConfig.backendPrefix || '';
      renderCollectionsList();
      // \u91CD\u7F6E\u5206\u4EAB\u7528\u6237\u5217\u8868
      document.getElementById('shareTokensList').innerHTML = 
        '<div style="color:#999;text-align:center;font-size:13px;">\u70B9\u51FB\u300C\u67E5\u8BE2\u5206\u4EAB\u7528\u6237\u300D\u4ECE Sub-Store \u83B7\u53D6</div>';
      // \u91CD\u7F6E\u8FDE\u63A5\u6D4B\u8BD5\u7ED3\u679C
      document.getElementById('connectionTestResult').style.display = 'none';
      document.getElementById('substoreConfigModal').classList.add('active');
    }
    
    function renderCollectionsList() {
      const container = document.getElementById('collectionsList');
      if (!substoreConfig.collections || substoreConfig.collections.length === 0) {
        container.innerHTML = '<div style="color:#999;text-align:center;">\u6682\u65E0\u8BA2\u9605\u7EC4\u5408</div>';
        return;
      }
      container.innerHTML = substoreConfig.collections.map((col, idx) => 
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;">' +
          '<span>' + col.name + '</span>' +
          '<button type="button" onclick="removeCollection(' + idx + ')" style="border:none;background:#e74c3c;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;">\u5220\u9664</button>' +
        '</div>'
      ).join('');
    }
    
    function removeCollection(idx) {
      substoreConfig.collections.splice(idx, 1);
      renderCollectionsList();
    }
    
    function addCollection() {
      const name = document.getElementById('newCollectionName').value.trim();
      if (!name) {
        alert('\u8BF7\u8F93\u5165\u7EC4\u5408\u540D\u79F0');
        return;
      }
      if (substoreConfig.collections.some(c => c.name === name)) {
        alert('\u8BE5\u7EC4\u5408\u5DF2\u5B58\u5728');
        return;
      }
      substoreConfig.collections.push({ name });
      document.getElementById('newCollectionName').value = '';
      renderCollectionsList();
    }
    
    async function submitSubstoreConfig(e) {
      e.preventDefault();
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      if (!baseUrl) {
        alert('\u8BF7\u8F93\u5165 Sub-Store \u5730\u5740');
        return;
      }
      
      try {
        const res = await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
        const result = await res.json();
        if (result.success) {
          alert('\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01');
          closeModal('substoreConfigModal');
        } else {
          alert('\u4FDD\u5B58\u5931\u8D25: ' + result.error);
        }
      } catch (err) {
        alert('\u7F51\u7EDC\u9519\u8BEF');
      }
    }
    
    // \u6D4B\u8BD5 Sub-Store \u8FDE\u63A5
    async function testSubstoreConnection() {
      const resultEl = document.getElementById('connectionTestResult');
      resultEl.style.display = 'block';
      resultEl.style.color = '#666';
      resultEl.textContent = '\u6B63\u5728\u6D4B\u8BD5\u8FDE\u63A5...';
      
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '\u274C \u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00';
        return;
      }
      
      // \u5148\u4FDD\u5B58\u518D\u67E5\u8BE2
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565\u4FDD\u5B58\u9519\u8BEF */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (data.success) {
          const count = Array.isArray(data.tokens) ? data.tokens.length : 0;
          resultEl.style.color = '#27ae60';
          resultEl.textContent = '\u2705 \u8FDE\u63A5\u6210\u529F\uFF01\u53D1\u73B0 ' + count + ' \u4E2A\u5206\u4EAB Token';
        } else {
          resultEl.style.color = '#e74c3c';
          resultEl.textContent = '\u274C ' + (data.error || '\u8FDE\u63A5\u5931\u8D25');
        }
      } catch (err) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF';
      }
    }
    
    // \u67E5\u8BE2\u5206\u4EAB\u7528\u6237 Token \u5217\u8868
    async function queryShareTokens() {
      const container = document.getElementById('shareTokensList');
      container.innerHTML = '<div style="color:#666;text-align:center;font-size:13px;">\u23F3 \u6B63\u5728\u67E5\u8BE2...</div>';
      
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C \u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00</div>';
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565 */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (!data.success) {
          container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C ' + (data.error || '\u67E5\u8BE2\u5931\u8D25') + '</div>';
          return;
        }
        
        const tokens = data.tokens;
        if (!Array.isArray(tokens) || tokens.length === 0) {
          container.innerHTML = '<div style="color:#999;text-align:center;font-size:13px;">\u6682\u65E0\u5206\u4EAB Token</div>';
          return;
        }
        
        // \u6E32\u67D3 token \u5217\u8868
        container.innerHTML = '<div style="font-size:12px;color:#999;margin-bottom:8px;">\u5171 ' + tokens.length + ' \u4E2A\u5206\u4EAB Token</div>' +
          tokens.map(function(t) {
            var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleString('zh-CN') : '\u672A\u77E5';
            var expireInfo = '';
            if (t.exp) {
              var now = Date.now();
              if (t.exp < now) {
                expireInfo = '<span style="color:#e74c3c;">\u5DF2\u8FC7\u671F</span>';
              } else {
                var daysLeft = Math.ceil((t.exp - now) / (1000*60*60*24));
                expireInfo = '<span style="color:#27ae60;">' + daysLeft + '\u5929\u540E\u8FC7\u671F</span>';
              }
            } else {
              expireInfo = '<span style="color:#27ae60;">\u6C38\u4E0D\u8FC7\u671F</span>';
            }
            var typeLabel = t.type === 'col' ? '\u7EC4\u5408' : (t.type === 'sub' ? '\u8BA2\u9605' : (t.type === 'file' ? '\u6587\u4EF6' : t.type));
            return '<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:6px;background:#fafafa;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                '<strong style="font-size:13px;color:#333;">\u{1F511} ' + (t.token || 'N/A') + '</strong>' +
                '<span style="font-size:11px;background:#667eea;color:white;padding:1px 6px;border-radius:3px;">' + typeLabel + '</span>' +
              '</div>' +
              '<div style="font-size:12px;color:#666;">' +
                '<span>\u{1F4E6} ' + (t.name || 'N/A') + '</span>' +
                '<span style="margin-left:12px;">\u{1F4C5} ' + createdAt + '</span>' +
                '<span style="margin-left:12px;">' + expireInfo + '</span>' +
              '</div>' +
            '</div>';
          }).join('');
      } catch (err) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">\u274C \u7F51\u7EDC\u9519\u8BEF</div>';
      }
    }
    
    // \u4ECE\u8FDC\u7A0B\u83B7\u53D6\u7EC4\u5408\u8BA2\u9605
    async function fetchRemoteCollections() {
      // \u5148\u4FDD\u5B58\u914D\u7F6E
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        alert('\u8BF7\u5148\u586B\u5199\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00');
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* \u5FFD\u7565 */ }
      
      try {
        const res = await fetch('/api/admin/substore/collections/remote');
        const data = await res.json();
        
        if (!data.success) {
          alert('\u83B7\u53D6\u5931\u8D25: ' + (data.error || '\u672A\u77E5\u9519\u8BEF'));
          return;
        }
        
        const remoteCols = data.collections;
        if (!Array.isArray(remoteCols) || remoteCols.length === 0) {
          alert('\u8FDC\u7A0B\u65E0\u53EF\u7528\u7EC4\u5408');
          return;
        }
        
        // \u5408\u5E76\u8FDC\u7A0B\u7EC4\u5408\u5230\u672C\u5730\u914D\u7F6E
        let addedCount = 0;
        for (const rc of remoteCols) {
          const name = rc.name || rc;
          if (typeof name === 'string' && name.length > 0 && !substoreConfig.collections.some(c => c.name === name)) {
            substoreConfig.collections.push({ name });
            addedCount++;
          }
        }
        
        renderCollectionsList();
        alert('\u83B7\u53D6\u5B8C\u6210\uFF01\u65B0\u589E ' + addedCount + ' \u4E2A\u7EC4\u5408\uFF08\u5171 ' + remoteCols.length + ' \u4E2A\u8FDC\u7A0B\u7EC4\u5408\uFF09');
      } catch (err) {
        alert('\u7F51\u7EDC\u9519\u8BEF');
      }
    }
    
    // ===== \u672A\u7ED1\u5B9A\u5206\u4EAB Token \u529F\u80FD =====
    
    async function loadUnboundTokens() {
      var statusEl = document.getElementById('unboundTokensStatus');
      var gridEl = document.getElementById('unboundTokensGrid');
      statusEl.style.display = 'block';
      statusEl.textContent = '\u{1F504} \u6B63\u5728\u83B7\u53D6\u5206\u4EAB Token...';
      statusEl.style.color = '#999';
      gridEl.style.display = 'none';
      
      try {
        var res = await fetch('/api/admin/substore/tokens/unbound');
        var data = await res.json();
        if (!res.ok || !data.success) {
          if (data.needConfig) {
            statusEl.innerHTML = '\u2699\uFE0F \u8BF7\u5148\u5728 <a href="javascript:showSubstoreConfig()" style="color:#3498db;">Sub-Store \u914D\u7F6E</a> \u4E2D\u8BBE\u7F6E\u5730\u5740\u548C\u540E\u7AEF\u8DEF\u5F84\u524D\u7F00';
          } else {
            statusEl.textContent = '\u274C ' + (data.error || '\u83B7\u53D6\u5931\u8D25');
            statusEl.style.color = '#e74c3c';
          }
          return;
        }
        allUnboundTokensData = data.tokens || [];
        var totalCount = data.totalCount || 0;
        var boundCount = data.boundCount || 0;
        // \u4F7F\u7528\u6240\u6709\u7528\u6237\u5217\u8868\uFF08\u5305\u542B\u7ED1\u5B9A\u72B6\u6001\u6807\u6CE8\uFF09
        window._allUsers = data.allUsers || [];
        
        if (allUnboundTokensData.length === 0) {
          statusEl.textContent = '\u2705 \u6240\u6709 ' + totalCount + ' \u4E2A\u5206\u4EAB Token \u5747\u5DF2\u7ED1\u5B9A\u7528\u6237';
          statusEl.style.color = '#27ae60';
          return;
        }
        statusEl.innerHTML = '\u5171 <b>' + totalCount + '</b> \u4E2A Token\uFF0C<span style="color:#27ae60">' + boundCount + '</span> \u4E2A\u5DF2\u7ED1\u5B9A\uFF0C<span style="color:#e67e22">' + allUnboundTokensData.length + '</span> \u4E2A\u5F85\u5206\u914D';
        statusEl.style.color = '#555';
        filterTokens();
      } catch (err) {
        statusEl.textContent = '\u274C \u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u8FDE\u63A5';
        statusEl.style.color = '#e74c3c';
      }
    }
    
    function filterTokens() {
      var search = (document.getElementById('tokenSearch').value || '').toLowerCase();
      var filter = document.getElementById('tokenFilter').value;
      var sort = document.getElementById('tokenSort').value;
      var now = Date.now();
      
      var filtered = allUnboundTokensData.filter(function(t) {
        // \u7B5B\u9009
        if (filter === 'expired' && !(t.exp && t.exp < now)) return false;
        if (filter === '7days' && !(t.exp && t.exp > now && t.exp - now < 7*86400000)) return false;
        if (filter === '30days' && !(t.exp && t.exp > now && t.exp - now < 30*86400000)) return false;
        if (filter === 'valid' && (t.exp && t.exp < now)) return false;
        // \u641C\u7D22
        if (search) {
          var hay = ((t.token||'') + ' ' + (t.name||'') + ' ' + (t.displayName||'') + ' ' + (t.remark||'')).toLowerCase();
          if (hay.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      // \u6392\u5E8F
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return (b.createdAt||0) - (a.createdAt||0);
        if (sort === 'created_asc') return (a.createdAt||0) - (b.createdAt||0);
        if (sort === 'expire_asc') return (a.exp||Infinity) - (b.exp||Infinity);
        if (sort === 'expire_desc') return (b.exp||0) - (a.exp||0);
        return 0;
      });
      
      renderTokens(filtered);
    }
    
    function switchTokenView(view) {
      currentTokenView = view;
      document.getElementById('viewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('viewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('viewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('viewList').style.color = view === 'list' ? 'white' : '#333';
      filterTokens();
    }
    
    function renderTokens(tokens) {
      var gridEl = document.getElementById('unboundTokensGrid');
      gridEl.innerHTML = '';
      if (tokens.length === 0) {
        gridEl.style.display = 'block';
        gridEl.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">\u65E0\u5339\u914D\u7ED3\u679C</div>';
        return;
      }
      
      var allUsers = window._allUsers || [];
      var userOptions = '<option value="">-- \u9009\u62E9\u7528\u6237 --</option>';
      allUsers.forEach(function(u) {
        var label = u.username + (u.hasSub ? ' (\u5DF2\u7ED1\u5B9A)' : '');
        userOptions += '<option value="' + u.username + '">' + label + '</option>';
      });
      
      if (currentTokenView === 'list') {
        // \u5217\u8868\uFF08\u8868\u683C\uFF09\u89C6\u56FE
        gridEl.style.display = 'block';
        gridEl.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u7EC4\u5408</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u521B\u5EFA\u65F6\u95F4</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u5230\u671F</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">\u64CD\u4F5C</th>' +
          '</tr></thead><tbody>';
        tokens.forEach(function(t, idx) {
          var isExpired = t.exp ? t.exp < Date.now() : false;
          var expText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '\u6C38\u4E45';
          html += '<tr style="border-bottom:1px solid #eee;" id="unbound-token-' + idx + '" data-token="' + (t.token||'') + '" data-collection="' + (t.name||'') + '">' +
            '<td style="padding:8px;font-family:monospace;">' + (t.token||'N/A') + '</td>' +
            '<td style="padding:8px;">' + (t.name||'-') + '</td>' +
            '<td style="padding:8px;">' + (t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expText + '</td>' +
            '<td style="padding:8px;"><select id="bindUser_' + idx + '" style="padding:4px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-right:4px;">' + userOptions + '</select>' +
            '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:3px 8px;">\u7ED1\u5B9A</button></td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        gridEl.innerHTML = html;
      } else {
        // \u5361\u7247\u89C6\u56FE
        gridEl.style.display = 'grid';
        gridEl.className = 'users-grid';
        tokens.forEach(function(t, idx) {
          var tokenValue = t.token || '\u672A\u77E5';
          var collection = t.name || '-';
          var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-';
          var isExpired = t.exp ? (t.exp < Date.now()) : false;
          var expireText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '\u6C38\u4E45';
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.style.borderLeft = isExpired ? '4px solid #e74c3c' : '4px solid #3498db';
          card.id = 'unbound-token-' + idx;
          card.setAttribute('data-token', tokenValue);
          card.setAttribute('data-collection', collection);
          card.innerHTML =
            '<div class="user-name"><span style="font-family:monospace;font-size:14px;">\u{1F3AB} ' + tokenValue + '</span>' +
              (isExpired ? ' <span class="tag" style="background:#e74c3c;color:#fff;font-size:10px;">\u5DF2\u8FC7\u671F</span>' : '') +
            '</div>' +
            '<div class="subscription-info" style="margin-top:6px;">' +
              '<div><span class="label">\u7EC4\u5408:</span> ' + collection + '</div>' +
              '<div><span class="label">\u521B\u5EFA:</span> ' + createdAt + '</div>' +
              '<div><span class="label">\u5230\u671F:</span> <span style="color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expireText + '</span></div>' +
            '</div>' +
            '<div style="margin-top:10px;display:flex;gap:6px;align-items:center;">' +
              '<select id="bindUser_' + idx + '" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;">' + userOptions + '</select>' +
              '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:4px 10px;white-space:nowrap;">\u{1F517} \u7ED1\u5B9A</button>' +
            '</div>';
          gridEl.appendChild(card);
        });
      }
    }
    
    async function quickBindToken(idx) {
      var card = document.getElementById('unbound-token-' + idx);
      var tokenValue = card.getAttribute('data-token');
      var collectionName = card.getAttribute('data-collection');
      var selectEl = document.getElementById('bindUser_' + idx);
      var username = selectEl.value;
      if (!username) { alert('\u8BF7\u5148\u9009\u62E9\u8981\u7ED1\u5B9A\u7684\u7528\u6237'); return; }
      if (!confirm('\u786E\u5B9A\u5C06 Token\u300C' + tokenValue + '\u300D\u7ED1\u5B9A\u5230\u7528\u6237\u300C' + username + '\u300D\uFF1F')) return;
      
      var finalCollection = collectionName;
      if (!finalCollection || finalCollection === '-') {
        // \u4E0D\u4F7F\u7528\u9519\u8BEF\u7684\u9ED8\u8BA4\u503C\uFF0C\u63D0\u793A\u7BA1\u7406\u5458\u624B\u52A8\u8F93\u5165
        finalCollection = prompt('\u8BE5 Token \u672A\u5173\u8054\u7EC4\u5408\u540D\u79F0\uFF0C\u8BF7\u624B\u52A8\u8F93\u5165\u7EC4\u5408\u8BA2\u9605\u540D\u79F0\uFF1A');
        if (!finalCollection || !finalCollection.trim()) {
          alert('\u7EC4\u5408\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u8BF7\u91CD\u65B0\u64CD\u4F5C');
          return;
        }
        finalCollection = finalCollection.trim();
      }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: finalCollection, token: tokenValue }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('\u2705 \u7ED1\u5B9A\u6210\u529F\uFF01');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('\u7ED1\u5B9A\u5931\u8D25: ' + (result.error || '\u672A\u77E5\u9519\u8BEF'), 'error'); }
      } catch (err) { showToast('\u2764 \u7F51\u7EDC\u9519\u8BEF', 'error'); }
    }
  <\/script>

</body>
</html>`])), users.length + 1, adminUsername, syncResult?.nodeCount || 0, syncResult?.earliestExpire || "\u672A\u77E5", raw(JSON.stringify(users.map((u) => ({
    username: u.username,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    customNote: u.customNote,
    subscriptionConfig: u.subscriptionConfig || null,
    lastSyncResult: u.lastSyncResult || null
  })) || []).replace(/</g, "\\u003c")));
}
function getExpireLabel(expireDate) {
  if (!expireDate) return "";
  const now = /* @__PURE__ */ new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
  if (daysLeft < 0) return "\u5DF2\u8FC7\u671F";
  if (daysLeft < 7) return `${daysLeft}\u5929\u540E\u8FC7\u671F`;
  if (daysLeft < 30) return `${daysLeft}\u5929\u540E\u8FC7\u671F`;
  return `${daysLeft}\u5929\u540E\u8FC7\u671F`;
}
function getExpireClass(expireDate) {
  if (!expireDate) return "";
  const now = /* @__PURE__ */ new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
  if (daysLeft < 7) return "expire-warning";
  if (daysLeft < 30) return "expire-caution";
  return "expire-normal";
}

// src/index.ts
var app = new Hono2();
app.use("*", logger());
app.use("*", cors());
app.use("*", async (c, next) => {
  const env = c.env;
  let storage;
  if (env.KV) {
    storage = new KVStorage(env.KV);
  } else if (env.DATABASE_URL) {
    storage = new NeonStorage(env.DATABASE_URL);
  } else {
    storage = memoryStorage;
  }
  c.set("storage", storage);
  c.set("env", env);
  await next();
});
app.route("/api", createApiRoutes());
app.route("/api/admin", createAdminRoutes());
app.route("/", createPageRoutes());
app.notFound((c) => {
  return c.json({ error: "\u9875\u9762\u4E0D\u5B58\u5728" }, 404);
});
app.onError((err, c) => {
  console.error("[Error]", err);
  return c.json({ error: err.message || "\u670D\u52A1\u5668\u9519\u8BEF" }, 500);
});
async function handleScheduled(event, env, ctx) {
  console.log("[Cron] \u5B9A\u65F6\u4EFB\u52A1\u89E6\u53D1:", (/* @__PURE__ */ new Date()).toISOString());
  const { KVStorage: KVStorage2 } = await Promise.resolve().then(() => (init_kv(), kv_exports));
  const { memoryStorage: memoryStorage2 } = await Promise.resolve().then(() => (init_memory(), memory_exports));
  const { syncAllUsers: syncAllUsers2, getAutoSyncConfig: getAutoSyncConfig2 } = await Promise.resolve().then(() => (init_scheduler(), scheduler_exports));
  const storage = env.KV ? new KVStorage2(env.KV) : memoryStorage2;
  const config = await getAutoSyncConfig2(storage);
  if (!config.enabled) {
    console.log("[Cron] \u81EA\u52A8\u540C\u6B65\u672A\u542F\u7528\uFF0C\u8DF3\u8FC7");
    return;
  }
  const result = await syncAllUsers2(storage, env);
  console.log(`[Cron] \u540C\u6B65\u5B8C\u6210: \u603B\u8BA1 ${result.total}\uFF0C\u6210\u529F ${result.success}\uFF0C\u5931\u8D25 ${result.failed}`);
}
var index_default = {
  fetch: app.fetch,
  scheduled: handleScheduled
};
export {
  index_default as default
};
/*! Bundled license information:

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
