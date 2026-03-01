/**
 * @file iter.js
 * @copyright 2026 PlasticHeart
 */

!(root => {
    /**
     * @typedef {{done: boolean, value: any}} NextResult
     */

    for (const name of Object.getOwnPropertyNames(Iterator.prototype)) {
        if (!['constructor'].includes(name)) {
            Iterator.prototype[`\$${name}`] = Iterator.prototype[name]
        }
    }

    for (const name of Object.getOwnPropertyNames(Iterator)) {
        if (!['length', 'name', 'prototype'].includes(name)) {
            Iterator[`\$${name}`] = Iterator[name]
        }
    }

    /**
     * @template T
     * @param {Iterator<T>} iter
     * @param {number} n
     * @returns {boolean}
     */
    function advanceBy(iter, n) {
        n = toUnsignedSize(n)
        for (let i = 0; i < n; i++) {
            const { done } = iter.next()
            if (done) {
                return false
            }
        }
        return true
    }

    /**
     * @template T
     * @param {Iterator<T>} iter
     * @returns {boolean}
     */
    function advanceLastBy(iter, n) {
        n = toUnsignedSize(n)
        for (let i = 0; i < n; i++) {
            const { done } = iter.nextLast()
            if (done) {
                return false
            }
        }
        return true
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    function isArrayLike(value) {
        return typeof value == 'object' && typeof value.length == 'number'
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    function isExactSizeIterator(value) {
        return value instanceof ExactSizeIterator
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    function isIteratorLike(value) {
        return typeof value == 'object'
            && (typeof value[Symbol.iterator] == 'function' || typeof value.next == 'function')
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    function isNullOrNaN(value) {
        return value == null || isNaN(value)
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    function isStringLike(value) {
        return typeof value == 'string' || value instanceof String
    }

    /**
     * @param {any} value
     * @returns {NextResult}
     */
    function next(value) {
        return { done: value === undefined, value }
    }

    /**
     * @template T
     * @param {any} value
     * @returns {Iterator<T>}
     */
    function toIterator(value) {
        if (isArrayLike(value)) {
            return value[Symbol.iterator]()
        } else if (isIteratorLike(value)) {
            return value instanceof Iterator ? value : value[Symbol.iterator]()
        }
        throw new TypeError('GetIteratorFlattenable expects its first argument to be an object')
    }

    /**
     * @param {number} value
     * @param {string} funcName
     * @returns {number}
     */
    function toUnsignedSize(value, funcName) {
        const n = +value
        if (Number.isNaN(n)) {
            throw new RangeError(`Iterator.prototype.${funcName} argument must not be NaN.`)
        } else if (n < 0) {
            throw new RangeError(`Iterator.prototype.${funcName} argument must be non-negative.`)
        }
        return n
    }

    /**
     * @template T
     * @param {Iterator<T>} iter
     * @param {function(T, T)} callbackFn
     * @param {T?} initialValue
     * @returns {ControlFlow<T>}
     */
    function tryFold(iter, callbackFn, initialValue) {
        let accum = initialValue
        while (true) {
            const result = iter.next()
            if (result.done) {
                break
            }
            const flow = callbackFn(accum, result.value)
            if (flow.isBreak) {
                return flow
            }
            accum = flow.continueValue
        }
        return new Continue(accum)
    }

    /**
     * @template T
     * @param {Iterator<T>} iter
     * @param {function(T, T)} callbackFn
     * @param {T?} initialValue
     * @returns {ControlFlow<T>}
     */
    function tryFoldRight(iter, callbackFn, initialValue) {
        let accum = initialValue
        while (true) {
            const result = iter.nextLast()
            if (result.done) {
                break
            }
            const flow = callbackFn(accum, result.value)
            if (flow.isBreak) {
                return flow
            }
            accum = flow.continueValue
        }
        return new Continue(accum)
    }

    /**
     * @template T
     * @type {ControlFlow<T>}
     */
    class ControlFlow {
        /**
         * @returns {T?}
         */
        get breakValue() {
            return undefined
        }

        /**
         * @returns {T?}
         */
        get continueValue() {
            return undefined
        }

        /**
         * @returns {boolean}
         */
        get isBreak() {
            return this instanceof Break
        }

        /**
         * @returns {boolean}
         */
        get isContinue() {
            return this instanceof Continue
        }
    }

    /**
     * @template T
     * @type {Break<T>}
     */
    class Break extends ControlFlow {
        #value

        /**
         * @param {T} value
         */
        constructor(value) {
            super()
            this.#value = value
        }

        /**
         * @returns {T?}
         */
        get breakValue() {
            return this.#value
        }
    }

    /**
     * @template T
     * @type {Continue<T>}
     */
    class Continue extends ControlFlow {
        #value

        /**
         * @param {T} value
         */
        constructor(value) {
            super()
            this.#value = value
        }

        /**
         * @returns {T?}
         */
        get continueValue() {
            return this.#value
        }
    }

    /**
     * @template T
     * @type {CloneableIterator<T>}
     */
    class CloneableIterator extends Iterator {
        #iter

        /**
         * @param {Iterator} iter
         */
        constructor(iter) {
            super()
            this.#iter = iter
        }

        /**
         * @returns {CloneableIterator<T>}
         */
        clone() {
            return new CloneableIterator(this.#iter)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            return this.#iter.next()
        }
    }

    /**
     * @template T
     * @type {DoubleEndedIterator<T>}
     */
    class DoubleEndedIterator extends Iterator {
        /**
         * @returns {{done: boolean, value: T?}}
         */
        nextLast() {
            throw new Error('unimplemented')
        }
    }

    /**
     * @template T
     * @type {ExactSizeIterator<T>}
     */
    class ExactSizeIterator extends DoubleEndedIterator {
        /**
         * @returns {number}
         */
        get length() {
            throw new Error('unimplemented')
        }
    }

    /**
     * @template T
     * @type {ArrayIterator<T>}
     */
    class ArrayIterator extends ExactSizeIterator {
        #values; #index; #end

        /**
         * @param {T[]} value
         * @param {Object} options
         * @param {number?} options.index
         * @param {number?} options.end
         */
        constructor(value, { index, end } = {}) {
            super()
            this.#values = value
            this.#index = index ?? 0
            this.#end = end ?? this.#values.length
        }

        /**
         * @returns {number}
         */
        get length() {
            return this.#end - this.#index
        }

        /**
         * @returns {ArrayIterator<T>}
         */
        clone() {
            return new ArrayIterator(this.#values, { index: this.#index, end: this.#end })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            return this.#index < this.#end
                ? next(this.#values[this.#index++])
                : next()
        }

        /**
         * @returns {NextResult}
         */
        nextLast() {
            return this.#index < this.#end
                ? next(this.#values[--this.#end])
                : next()
        }
    }

    /**
     * @template T
     * @type {PairIterator<T>}
     */
    class PairIterator extends Iterator {
        #lhs; #rhs

        /**
         * @param {Iterator<T>} lhs
         * @param {Iterator<T>} rhs
         */
        constructor(lhs, rhs) {
            super()
            this.#lhs = lhs
            this.#rhs = rhs
        }

        /**
         * @returns {NextResult}
         */
        next() {
            const lhs = this.#lhs.next()
            const rhs = this.#rhs.next()
            if (lhs.done && rhs.done) {
                return next()
            }
            return next([lhs.value, rhs.value])
        }
    }

    /**
     * @template T, U
     * @type {Chain<T, U>}
     */
    class Chain extends Iterator {
        #a; #b

        /**
         * @param {Iterator<T>} iter
         * @param {Iterator<U>} other
         */
        constructor(iter, other) {
            super()
            this.#a = iter
            this.#b = other
        }

        /**
         * @returns {Chain<T, U>}
         */
        clone() {
            return new Chain(this.#a.clone(), this.#b.clone())
        }

        /**
         * @returns {NextResult}
         */
        next() {
            let result = this.#a.next()
            if (result.done) {
                result = this.#b.next()
            }
            return result
        }
    }

    /**
     * @template T
     * @type {Cycle<T>}
     */
    class Cycle extends Iterator {
        #iter; #orig

        /**
         * @param {Iterator<T>} iter
         */
        constructor(iter) {
            super()
            this.#iter = iter
            this.#orig = iter.clone()
        }

        /**
         * @returns {Cycle<T>}
         */
        clone() {
            return new Cycle(this.iter.clone())
        }

        /**
         * @returns {NextResult}
         */
        next() {
            let result = this.#iter.next()
            if (result.done) {
                this.#iter = this.#orig.clone()
                result = this.#iter.next()
            }
            return result
        }
    }

    /**
     * @template T
     * @type {Drop<T>}
     */
    class Drop extends Iterator {
        #iter; #n

        /**
         * @param {Iterator<T>} iter
         * @param {number} n
         */
        constructor(iter, n) {
            super()
            this.#iter = iter
            this.#n = n
        }

        /**
         * @returns {Drop<T>}
         */
        clone() {
            return new Drop(this.#iter.clone(), this.#n)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            if (this.#n > 0) {
                advanceBy(this.#iter, this.#n)
                this.#n = 0
            }
            return this.#iter.next()
        }
    }

    /**
     * @template T
     * @type {DropWhile<T>}
     */
    class DropWhile extends Iterator {
        #iter; #fn; #found

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): boolean} fn
         * @param {Object} options
         * @param {boolean?} options.found
         */
        constructor(iter, fn, { found } = {}) {
            super()
            this.#iter = iter
            this.#fn = fn
            this.#found = found ?? false
        }

        /**
         * @returns {DropWhile<T>}
         */
        clone() {
            return new DropWhile(this.#iter.clone(), this.#fn, { found: this.#found })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            for (const value of this.#iter) {
                if (this.#found || !this.#fn(value)) {
                    this.#found = true
                    return next(value)
                }
            }
            return next()
        }
    }

    /**
     * @template T
     * @type {Enumerate<T>}
     */
    class Enumerate extends Iterator {
        #iter; #count

        /**
         * @param {Iterator<T>} iter
         * @param {Object} options
         * @param {number?} options.count
         */
        constructor(iter, { count } = {}) {
            super()
            this.#iter = iter
            this.#count = count ?? 0
        }

        /**
         * @returns {Enumerate<T>}
         */
        clone() {
            return new Enumerate(this.#iter.clone(), { count: this.#count })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            const { done, value } = this.#iter.next()
            if (!done) {
                return next([this.#count++, value])
            }
            return next()
        }
    }

    /**
     * @template T
     * @type {Filter<T>}
     */
    class Filter extends Iterator {
        #iter; #fn

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): boolean} fn
         */
        constructor(iter, fn) {
            super()
            this.#iter = iter
            this.#fn = fn
        }

        /**
         * @returns {Filter<T>}
         */
        clone() {
            return new Filter(this.#iter.clone(), this.#fn)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            for (const value of this.#iter) {
                if (this.#fn(value)) {
                    return next(value)
                }
            }
            return next()
        }
    }

    /**
     * @template T
     * @type {FilterMap<T>}
     */
    class FilterMap extends Iterator {
        #iter; #fn

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): boolean} fn
         */
        constructor(iter, fn) {
            super()
            this.#iter = iter
            this.#fn = fn
        }

        /**
         * @returns {FilterMap<T>}
         */
        clone() {
            return new FilterMap(this.#iter.clone(), this.#fn)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            for (const value of this.#iter) {
                const result = this.#fn(value)
                if (result != null && !isNaN(result)) {
                    return next(result)
                }
            }
            return next()
        }
    }

    /**
     * @template T
     * @type {FlatMap<T>}
     */
    class FlatMap extends Iterator {
        #iter; #fn; #flat

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): boolean} fn
         * @param {Object} options
         * @param {Iterator<T>} options.flat
         */
        constructor(iter, fn, { flat } = {}) {
            super()
            this.#iter = iter
            this.#fn = fn
            this.#flat = flat ?? Iterator.from([])
        }

        /**
         * @returns {FlatMap<T>}
         */
        clone() {
            return new FlatMap(this.#iter.clone(), this.#fn, { flat: this.#flat.clone() })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            let result = this.#flat.next()
            if (result.done) {
                const { done, value } = this.#iter.next()
                if (!done) {
                    this.#flat = toIterator(this.#fn(value))
                    result = this.#flat.next()
                }
            }
            return result
        }
    }

    /**
     * @template T, U
     * @type {Map<T>}
     */
    class Map extends Iterator {
        #iter; #fn

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): U} fn
         */
        constructor(iter, fn) {
            super()
            this.#iter = iter
            this.#fn = fn
        }

        /**
         * @returns {Map<T, U>}
         */
        clone() {
            return new Map(this.#iter.clone(), this.#fn)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            const { done, value } = this.#iter.next()
            return next(done ? undefined : this.#fn(value))
        }
    }

    /**
     * @template T
     * @type {Reverse<T>}
     */
    class Reverse extends ExactSizeIterator {
        #iter; #length

        /**
         * @param {Iterator<T>} iter
         * @param {number} length
         */
        constructor(iter, length) {
            super()
            this.#iter = iter
            this.#length = length
        }

        /**
         * @returns {number}
         */
        get length() {
            return this.#length
        }

        /**
         * @returns {Reverse<T>}
         */
        clone() {
            return new Reverse(this.#iter.clone())
        }

        /**
         * @param {funciton(T): boolean} callbackFn
         * @returns {T?}
         */
        find(callbackFn) {
            return this.#iter.findLast(callbackFn)
        }

        /**
         * @param {funciton(T): boolean} callbackFn
         * @returns {T?}
         */
        findLast(callbackFn) {
            return this.#iter.find(callbackFn)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            return this.#iter.nextLast()
        }

        /**
         * @returns {NextResult}
         */
        nextLast() {
            return this.#iter.next()
        }

        /**
         * @param {funciton(T): boolean} callbackFn
         * @param {T?} initialValue
         * @returns {T?}
         */
        reduce(callbackFn, initialValue) {
            return this.#iter.reduceRight(callbackFn, initialValue)
        }

        /**
         * @param {funciton(T): boolean} callbackFn
         * @param {T?} initialValue
         * @returns {T?}
         */
        reduceRight(callbackFn, initialValue) {
            return this.#iter.reduce(callbackFn, initialValue)
        }
    }

    /**
     * @template T
     * @type {StepBy<T>}
     */
    class StepBy extends Iterator {
        #iter; #step; #firstTake

        constructor(iter, step, { firstTake } = {}) {
            super()
            this.#iter = iter
            this.#step = step
            this.#firstTake = firstTake ?? true
        }

        /**
         * @returns {StepBy<T>}
         */
        clone() {
            return new StepBy(this.#iter.clone(), this.#step, { firstTake: this.#firstTake })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            advanceBy(this.#iter, this.#firstTake ? 0 : Math.max(this.#step - 1, 0))
            this.#firstTake = false
            return this.#iter.next()
        }
    }

    /**
     * @template T
     * @type {Take<T>}
     */
    class Take extends Iterator {
        #iter; #n

        /**
         * @param {Iterator<T>} iter
         * @param {number} n
         */
        constructor(iter, n) {
            super()
            this.#iter = iter
            this.#n = n
        }

        /**
         * @returns {Take<T>}
         */
        clone() {
            return new Take(this.#iter.clone(), this.#n)
        }

        /**
         * @returns {NextResult}
         */
        next() {
            if (this.#n > 0) {
                this.#n--
                return this.#iter.next()
            }
            return next()
        }
    }

    /**
     * @template T
     * @type {TakeWhile<T>}
     */
    class TakeWhile extends Iterator {
        #iter; #fn; #found

        /**
         * @param {Iterator<T>} iter
         * @param {function(T): boolean} fn
         * @param {Object} options
         * @param {boolean?} options.found
         */
        constructor(iter, fn, { found } = {}) {
            super()
            this.#iter = iter
            this.#fn = fn
            this.#found = found ?? false
        }

        /**
         * @returns {TakeWhile<T>}
         */
        clone() {
            return new TakeWhile(this.#iter.clone(), this.#fn, { found: this.#found })
        }

        /**
         * @returns {NextResult}
         */
        next() {
            if (!this.#found) {
                const result = this.#iter.next()
                if (!result.done && this.#fn(result.value)) {
                    return result
                }
                this.#found = true
            }
            return next()
        }
    }

    /**
     * @template T, U
     * @type {Zip<T, U>}
     */
    class Zip extends Iterator {
        #a; #b

        /**
         * @param {Iterator<T>} a
         * @param {Iterator<U>} b
         */
        constructor(a, b) {
            super()
            this.#a = a
            this.#b = b
        }

        /**
         * @returns {Zip<T, U>}
         */
        clone() {
            return new Zip(this.#a.clone(), this.#b.clone())
        }

        /**
         * @returns {NextResult}
         */
        next() {
            const a = this.#a.next()
            const b = this.#b.next()
            if (a.done || b.done) {
                return next()
            }
            return next([a.value, b.value])
        }
    }

    /**
     * @template T
     * @param {Iterable<T>}
     * @returns {Iterator<T>}
     */
    Iterator.from = function (value) {
        if (isArrayLike(value) || isStringLike(value)) {
            return new ArrayIterator(value)
        } else if (isIteratorLike(value)) {
            return new CloneableIterator(toIterator(value))
        }
        throw new TypeError('GetIteratorFlattenable expects its first argument to be an object or a string')
    }

    /**
     * @template T, U
     * @param {Iterator<U>} other
     * @returns {Chain<T, U>}
     */
    Iterator.prototype.chain = function (other) {
        return new Chain(this, other)
    }

    /**
     * @template T
     * @returns {Iterator<T>}
     */
    Iterator.prototype.clone = function () {
        throw new TypeError(`Iterator.prototype.clone is not defined an Object of ${this.constructor.name}`)
    }

    /**
     * @template T, U
     * @param {Iterator<T>} other
     * @param {function(T?, U?): number} callbackFn
     * @returns {number}
     */
    Iterator.prototype.compareBy = function (other, callbackFn) {
        for (const [lhs, rhs] of new PairIterator(this, other)) {
            const diff = callbackFn(lhs, rhs)
            if (diff == null || diff != 0) {
                return diff ?? NaN
            }
        }
        return 0
    }

    /**
     * @returns {number}
     */
    Iterator.prototype.count = function () {
        return tryFold(this, (i, _) => new Continue(i + 1), 0).continueValue
    }

    /**
     * @template T
     * @returns {Cycle<T>}
     */
    Iterator.prototype.cycle = function () {
        return new Cycle(this)
    }

    /**
     * @template T
     * @param {number} limit
     * @returns {Drop<T>}
     */
    Iterator.prototype.drop = function (limit) {
        return new Drop(this, toUnsignedSize(limit, 'drop'))
    }

    /**
     * @template T
     * @param {function(T): boolean} fn
     * @returns {DropWhile<T>}
     */
    Iterator.prototype.dropWhile = function (fn) {
        return new DropWhile(this, fn)
    }

    /**
     * @template T
     * @returns {Enumerate<T>}
     */
    Iterator.prototype.enumerate = function () {
        return new Enumerate(this)
    }

    /**
     * @template T, U
     * @param {Iterator<T>} other
     * @param {function(T, U): boolean} callbackFn
     * @returns {boolean}
     */
    Iterator.prototype.equalsBy = function (other, callbackFn) {
        for (const [lhs, rhs] of new PairIterator(this, other)) {
            if (lhs === undefined || rhs === undefined || !callbackFn(lhs, rhs)) {
                return false
            }
        }
        return true
    }

    /**
     * @template T
     * @param {function(T): boolean}
     * @returns {boolean}
     */
    Iterator.prototype.every = function (callbackFn) {
        return tryFold(this, (_, x) => callbackFn(x)
            ? new Continue()
            : new Break()).isContinue
    }

    /**
     * @template T
     * @param {function(T): boolean} callbackFn
     * @returns {Filter<T>}
     */
    Iterator.prototype.filter = function (callbackFn) {
        return new Filter(this, callbackFn)
    }

    /**
     * @template T, U
     * @param {function(T): U?} callbackFn
     * @returns {FilterMap<U>}
     */
    Iterator.prototype.filterMap = function (callbackFn) {
        return new FilterMap(this, callbackFn)
    }

    /**
     * @template T
     * @param {function(T): boolean} callbackFn
     * @returns {T?}
     */
    Iterator.prototype.find = function (callbackFn) {
        return tryFold(this, (_, x) => callbackFn(x)
            ? new Break(x)
            : new Continue()).breakValue
    }

    /**
     * @template T
     * @param {function(T): bool} callbackFn
     * @returns {number}
     */
    Iterator.prototype.findIndex = function (callbackFn) {
        let index = 0
        return tryFold(this, (_, x) => callbackFn(x)
            ? new Break(index)
            : (index++, new Continue())).breakValue ?? -1
    }

    /**
     * @template T
     * @param {function(T): boolean} callbackFn
     * @returns {T?}
     */
    Iterator.prototype.findLast = function (callbackFn) {
        return tryFoldRight(this, (_, x) => callbackFn(x)
            ? new Break(x)
            : new Continue()).breakValue
    }

    /**
     * @template T
     * @param {function(T): bool} callbackFn
     * @returns {number}
     */
    Iterator.prototype.findLastIndex = function (callbackFn) {
        return tryFoldRight(this, (i, x) => callbackFn(x)
            ? new Break(i - 1)
            : new Continue(i - 1), toUnsignedSize(this.length, 'findLastIndex')).breakValue ?? -1
    }

    /**
     * @template T, U
     * @param {function(T): U?} callbackFn
     * @returns {U}
     */
    Iterator.prototype.findMap = function (callbackFn) {
        return tryFold(this, (_, x) => {
            const value = callbackFn(x)
            return isNullOrNaN(value) ? new Continue() : new Break(value)
        }).breakValue
    }

    /**
     * @template T, U
     * @param {function(T): U[]} callbackFn
     * @returns {FlatMap<U>}
     */
    Iterator.prototype.flatMap = function (callbackFn) {
        return new FlatMap(this, callbackFn)
    }

    /**
     * @template T
     * @param {function(T): any} callbackFn
     * @returns {void}
     */
    Iterator.prototype.forEach = function (callbackFn) {
        for (const value of this) {
            callbackFn(value)
        }
    }

    /**
     * @template T
     * @returns {T?}
     */
    Iterator.prototype.last = function () {
        return this.reduce((_, x) => x, undefined)
    }

    /**
     * @template T, U
     * @param {function(T): U} callbackFn
     * @returns {Map<U>}
     */
    Iterator.prototype.map = function (callbackFn) {
        return new Map(this, callbackFn)
    }

    /**
     * @template T
     * @param {function(T, T): T} callbackFn
     * @returns {T?}
     */
    Iterator.prototype.maxBy = function (callbackFn) {
        return this.reduce((a, b) => callbackFn(a, b) > 0 ? a : b)
    }

    /**
     * @template T
     * @param {function(T, T): T} callbackFn
     * @returns {T?}
     */
    Iterator.prototype.minBy = function (callbackFn) {
        return this.reduce((a, b) => callbackFn(a, b) < 0 ? a : b)
    }

    /**
     * @template T
     * @returns {{ done: boolean, value: T }}
     */
    Iterator.prototype.next = function () {
        return next()
    }

    /**
     * @template T
     * @param {number} index
     * @returns {T?}
     */
    Iterator.prototype.nth = function (index) {
        advanceBy(this, index)
        return this.next().value
    }

    /**
     * @template T
     * @param {number} index
     * @returns {T?}
     */
    Iterator.prototype.nthLast = function (index) {
        advanceLastBy(this, index)
        return this.nextLast().value
    }

    /**
     * @template T, U
     * @param {function(T, U): T} callbackFn
     * @param {T} initialValue
     * @returns {T}
     */
    Iterator.prototype.reduce = function (callbackFn, initialValue) {
        let accum = initialValue
        if (arguments.length < 2) {
            const { done, value } = this.next()
            if (done) {
                throw new TypeError('Iterator.prototype.reduce requires an initial value or an iterator that is not done.')
            }
            accum = value
        }
        for (const value of this) {
            accum = callbackFn(accum, value)
        }
        return accum
    }

    /**
     * @template T, U
     * @param {function(T, U): T} callbackFn
     * @param {T} initialValue
     * @returns {T}
     */
    Iterator.prototype.reduceRight = function (callbackFn, initialValue) {
        let accum = initialValue
        if (arguments.length < 2) {
            const { done, value } = this.nextLast()
            if (done) {
                throw new TypeError('Iterator.prototype.reduceRight requires an initial value or an iterator that is not done.')
            }
            accum = value
        }
        while (true) {
            const { done, value } = this.nextLast()
            if (done) {
                break
            }
            accum = callbackFn(accum, value)
        }
        return accum
    }

    /**
     * @template T
     * @returns {Reverse<T>}
     */
    Iterator.prototype.reverse = function () {
        if (!isExactSizeIterator(this)) {
            throw new TypeError('Iterator.prototype.reverse cannot be applied to an iterator of unknown size.')
        }
        return new Reverse(this, this.length)
    }

    /**
     * @template T
     * @param {function(T): boolean}
     * @returns {boolean}
     */
    Iterator.prototype.some = function (callbackFn) {
        return tryFold(this, (_, x) => callbackFn(x)
            ? new Break()
            : new Continue()).isBreak
    }

    /**
     * @template T
     * @param {number} step
     * @returns {StepBy<T>}
     */
    Iterator.prototype.stepBy = function (step) {
        return new StepBy(this, toUnsignedSize(step, 'stepBy'))
    }

    /**
     * @template T
     * @param {Iterator<T>}
     * @returns {T}
     */
    Iterator.prototype.sum = function () {
        return this.reduce((a, b) => a + b)
    }

    /**
     * @template T
     * @param {number} limit
     * @returns {Take<T>}
     */
    Iterator.prototype.take = function (limit) {
        return new Take(this, toUnsignedSize(limit, 'take'))
    }

    /**
     * @template T
     * @param {function(T): boolean} fn
     * @returns {TakeWhile<T>}
     */
    Iterator.prototype.takeWhile = function (fn) {
        return new TakeWhile(this, fn)
    }

    /**
     * @template T, U
     * @param {Iterator<U>} other
     * @returns {Zip<T, U>}
     */
    Iterator.prototype.zip = function (other) {
        return new Zip(this, other)
    }

    /*
     * @returns {T[]}
     */
    Iterator.prototype.toArray = function () {
        const result = []
        for (const value of this) {
            result.push(value)
        }
        return result
    }

    /**
     * @template T
     * @returns {ArrayIterator<T>}
     */
    Array.prototype.values = function () {
        return new ArrayIterator(this)
    }

    /**
     * @template T
     * @returns {ArrayIterator<T>}
     */
    Set.prototype.values = function () {
        return new ArrayIterator([...this])
    }

    /**
     * @template T
     * @returns {ArrayIterator<T>}
     */
    Map.prototype.entries = function () {
        return new ArrayIterator([...this])
    }
})(window)
