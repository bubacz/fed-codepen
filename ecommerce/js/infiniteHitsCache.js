function _objectWithoutProperties(source, excluded) {
	if (source == null) return {};
	var target = _objectWithoutPropertiesLoose(source, excluded);
	var key, i;
	if (Object.getOwnPropertySymbols) {
		var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
		for (i = 0; i < sourceSymbolKeys.length; i++) {
			key = sourceSymbolKeys[i];
			if (excluded.indexOf(key) >= 0) continue;
			if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
			target[key] = source[key];
		}
	}
	return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
	if (source == null) return {};
	var target = {};
	var sourceKeys = Object.keys(source);
	var key, i;
	for (i = 0; i < sourceKeys.length; i++) {
		key = sourceKeys[i];
		if (excluded.indexOf(key) >= 0) continue;
		target[key] = source[key];
	}
	return target;
}

function isPrimitive(obj) {
	return obj !== Object(obj);
}

function isEqual(first, second) {
	if (first === second) {
		return true;
	}

	if (isPrimitive(first) || isPrimitive(second) || typeof first === "function" || typeof second === "function") {
		return first === second;
	}

	if (Object.keys(first).length !== Object.keys(second).length) {
		return false;
	}

	for (var _i = 0, _Object$keys = Object.keys(first); _i < _Object$keys.length; _i++) {
		var key = _Object$keys[_i];

		if (!(key in second)) {
			return false;
		}

		if (!isEqual(first[key], second[key])) {
			return false;
		}
	}

	return true;
}

// eslint-disable-next-line no-restricted-globals

/**
 * Runs code on browser enviromnents safely.
 */
function safelyRunOnBrowser(callback) {
	var _ref =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: {
						fallback: function fallback() {
							return undefined;
						}
				  },
		fallback = _ref.fallback;

	// eslint-disable-next-line no-restricted-globals
	if (typeof window === "undefined") {
		return fallback();
	} // eslint-disable-next-line no-restricted-globals

	return callback({
		window: window
	});
}

function getStateWithoutPage(state) {
	var _ref = state || {},
		page = _ref.page,
		rest = _objectWithoutProperties(_ref, ["page"]);

	return rest;
}

export function createInfiniteHitsSessionStorageCache(KEY) {
	return {
		read: function read(_ref2) {
			var state = _ref2.state;
			var sessionStorage = safelyRunOnBrowser(function (_ref3) {
				var window = _ref3.window;
				return window.sessionStorage;
			});

			if (!sessionStorage) {
				return null;
			}

			try {
				var cache = JSON.parse(
					// @ts-expect-error JSON.parse() requires a string, but it actually accepts null, too.
					sessionStorage.getItem(KEY)
				);
				return cache && isEqual(cache.state, getStateWithoutPage(state)) ? cache.hits : null;
			} catch (error) {
				if (error instanceof SyntaxError) {
					try {
						sessionStorage.removeItem(KEY);
					} catch (err) {
						// do nothing
					}
				}

				return null;
			}
		},
		write: function write(_ref4) {
			var state = _ref4.state,
				hits = _ref4.hits;
			var sessionStorage = safelyRunOnBrowser(function (_ref5) {
				var window = _ref5.window;
				return window.sessionStorage;
			});

			if (!sessionStorage) {
				return;
			}

			try {
				sessionStorage.setItem(
					KEY,
					JSON.stringify({
						state: getStateWithoutPage(state),
						hits: hits
					})
				);
			} catch (error) {
				// do nothing
			}
		}
	};
}
