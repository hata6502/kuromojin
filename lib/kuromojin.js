// LICENSE : MIT
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.getTokenizer = void 0;
var path_1 = __importDefault(require("path"));
var kuromoji = require("kuromoji");
var Deferred_1 = __importDefault(require("./Deferred"));
var deferred = new Deferred_1.default();
var getNodeModuleDirPath = function () {
    // Node
    if (typeof process !== "undefined"
        && typeof process.env === "object"
        && process.env.KUROMOJIN_DIC_PATH) {
        return process.env.KUROMOJIN_DIC_PATH;
    }
    // Browser
    // if self.kuromojin.dicPath is defined, use it as default dict path.
    var maybeKuromojiSelf = typeof self != "undefined" ? self : undefined;
    if (typeof maybeKuromojiSelf !== "undefined" &&
        typeof maybeKuromojiSelf.kuromojin === "object" &&
        typeof maybeKuromojiSelf.kuromojin.dicPath === "string") {
        return maybeKuromojiSelf.kuromojin.dicPath;
    }
    var kuromojiDir = path_1.default.dirname(require.resolve("kuromoji"));
    return path_1.default.join(kuromojiDir, "..", "dict");
};
// cache for tokenizer
var _tokenizer = null;
var tokenizeCacheMap = new Map();
// lock boolean
var isLoading = false;
function getTokenizer(options) {
    if (options === void 0) { options = { dicPath: getNodeModuleDirPath() }; }
    if (_tokenizer) {
        return Promise.resolve(_tokenizer);
    }
    if (isLoading) {
        return deferred.promise;
    }
    isLoading = true;
    // load dict
    kuromoji.builder(options).build(function (err, tokenizer) {
        if (err) {
            return deferred.reject(err);
        }
        _tokenizer = tokenizer;
        deferred.resolve(tokenizer);
    });
    return deferred.promise;
}
exports.getTokenizer = getTokenizer;
function tokenize(text, options) {
    return getTokenizer(options).then(function (tokenizer) {
        if (options === null || options === void 0 ? void 0 : options.noCacheTokenize) {
            return tokenizer.tokenizeForSentence(text);
        }
        else {
            var cache = tokenizeCacheMap.get(text);
            if (cache) {
                return cache;
            }
            var tokens = tokenizer.tokenizeForSentence(text);
            tokenizeCacheMap.set(text, tokens);
            return tokens;
        }
    });
}
exports.tokenize = tokenize;
//# sourceMappingURL=kuromojin.js.map