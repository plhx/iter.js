/**
 * @file iter.test.js
 * @copyright 2026 PlasticHeart
 */

document.addEventListener('DOMContentLoaded', () => {
    test('Iterator.from', () => {
        assertExc(() => { Iterator.from(null) }, { error: TypeError })
        assertExc(() => { Iterator.from(42) }, { error: TypeError })

        assertEq(Iterator.from('apple').toArray(), ['a', 'p', 'p', 'l', 'e'])
        assertEq(Iterator.from([1, 2, 3]).toArray(), [1, 2, 3])
        assertEq(Iterator.from(new Set([1, 2, 3])).toArray(), [1, 2, 3])
        assertEq(Iterator.from(new Map([['a', 1], ['b', 2], ['c', 3]])).toArray(), [['a', 1], ['b', 2], ['c', 3]])

        assertEq(Iterator.$from('apple').$toArray(), ['a', 'p', 'p', 'l', 'e'])
        assertEq(Iterator.$from([1, 2, 3]).$toArray(), [1, 2, 3])
        assertEq(Iterator.$from(new Set([1, 2, 3])).$toArray(), [1, 2, 3])
        assertEq(Iterator.$from(new Map([['a', 1], ['b', 2], ['c', 3]])).$toArray(), [['a', 1], ['b', 2], ['c', 3]])
    })

    test('Iterator.prototype.chain', () => {
        const a = [1, 2, 3]
        const b = [4, 5, 6]
        const iter = Iterator.from(a).chain(Iterator.from(b))
        assertEq(iter.toArray(), [1, 2, 3, 4, 5, 6])
    })

    test('Iterator.prototype.clone', () => {
        const a = [1, 2, 3]
        const iter1 = Iterator.from(a)
        const iter2 = iter1.clone()
        assertEq(iter1.toArray(), [1, 2, 3])
        assertEq(iter2.toArray(), [1, 2, 3])
    })

    test('Iterator.prototype.compareBy', () => {
        const comparer = function (a, b) {
            if (a == null && b != null) {
                return -1
            } else if (a != null && b == null) {
                return 1
            }
            return (a ?? 0) - (b ?? 0)
        }

        const a = [1, 2, 3]
        const b = [1, 2]
        assertEq(Iterator.from(a).compareBy(Iterator.from(a), comparer), 0)
        assertEq(Iterator.from(a).compareBy(Iterator.from(b), comparer), 1)
    })

    test('Iterator.prototype.count', () => {
        assertEq(Iterator.from([]).count(), 0)
        assertEq(Iterator.from([1, 2, 3, 4, 5]).count(), 5)
        assertEq(Iterator.from([1, 2, 3, 4, 5]).drop(2).count(), 3)

        assertEq(Iterator.from('').count(), 0)
        assertEq(Iterator.from('Hello, world!').count(), 13)
    })

    test('Iterator.prototype.cycle', () => {
        assertEq(Iterator.from('ab').cycle().take(5).toArray().join(''), 'ababa')
        assertEq(Iterator.from([1, 2, 3]).cycle().take(9).toArray(), [1, 2, 3, 1, 2, 3, 1, 2, 3])
    })

    test('Iterator.prototype.drop', () => {
        assertEq(Iterator.from([1, 2, 3]).drop(0).toArray(), [1, 2, 3])
        assertEq(Iterator.from([1, 2, 3]).drop(1).toArray(), [2, 3])
        assertEq(Iterator.from([1, 2, 3]).drop(5).toArray(), [])
        assertExc(() => Iterator.from([1, 2, 3]).drop(-1), { error: RangeError })

        assertEq(Iterator.$from([1, 2, 3]).$drop(0).$toArray(), [1, 2, 3])
        assertEq(Iterator.$from([1, 2, 3]).$drop(1).$toArray(), [2, 3])
        assertEq(Iterator.$from([1, 2, 3]).$drop(5).$toArray(), [])
        assertExc(() => Iterator.$from([1, 2, 3]).$drop(-1), { error: RangeError })
    })

    test('Iterator.prototype.dropWhile', () => {
        const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        assertEq(Iterator.from(a).dropWhile(x => x < 0).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        assertEq(Iterator.from(a).dropWhile(x => x < 5).toArray(), [5, 6, 7, 8, 9, 10])
        assertEq(Iterator.from(a).dropWhile(x => x < 100).toArray(), [])
    })

    test('Iterator.prototype.enumerate', () => {
        assertEq(Iterator.from('').enumerate().toArray(), [])
        assertEq(Iterator.from('apple').enumerate().toArray(), [[0, 'a'], [1, 'p'], [2, 'p'], [3, 'l'], [4, 'e']])
    })

    test('Iterator.prototype.equalsBy', () => {
        const a = [1, 2, 3]
        const b = [1, 2]
        assertEq(Iterator.from(a).equalsBy(Iterator.from(a), (a, b) => a == b), true)
        assertEq(Iterator.from(a).equalsBy(Iterator.from(b), (a, b) => a == b), false)
    })

    test('Iterator.prototype.every', () => {
        const a = [0, 2, 4, 6, 8]
        assertEq(Iterator.from([]).every(x => x % 2 == 0), true)
        assertEq(Iterator.from(a).every(x => x % 2 == 0), true)

        assertEq(Iterator.$from([]).$every(x => x % 2 == 0), true)
        assertEq(Iterator.$from(a).$every(x => x % 2 == 0), true)
    })

    test('Iterator.prototype.filter', () => {
        const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        assertEq(Iterator.from([]).filter(x => x % 2 == 0).toArray(), [])
        assertEq(Iterator.from(a).filter(x => x % 2 == 0).toArray(), [0, 2, 4, 6, 8])

        assertEq(Iterator.$from([]).$filter(x => x % 2 == 0).$toArray(), [])
        assertEq(Iterator.$from(a).$filter(x => x % 2 == 0).$toArray(), [0, 2, 4, 6, 8])
    })

    test('Iterator.prototype.filterMap', () => {
        const a = ['42', 'true', 'Hello, world!', 'Infinity']
        assertEq(Iterator.from(a).filterMap(x => parseFloat(x)).toArray(), [42, Infinity])
    })

    test('Iterator.prototype.find', () => {
        const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        assertEq(Iterator.from(a).find(x => x >= 5), 5)
        assertEq(Iterator.from(a).find(x => x == -1), undefined)

        assertEq(Iterator.$from(a).$find(x => x >= 5), 5)
        assertEq(Iterator.$from(a).$find(x => x == -1), undefined)
    })

    test('Iterator.prototype.findIndex', () => {
        const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        assertEq(Iterator.from(a).findIndex(x => x >= 5), 5)
        assertEq(Iterator.from(a).findIndex(x => x == -1), -1)
    })

    test('Iterator.prototype.findLast', () => {
        const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        assertEq(Iterator.from(a).findLast(x => x < 3), 2)
        assertEq(Iterator.from(a).findLast(x => x == -1), undefined)
    })

    test('Iterator.prototype.findLastIndex', () => {
        const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        assertEq(Iterator.from(a).findLastIndex(x => x < 3), 2)
        assertEq(Iterator.from(a).findLastIndex(x => x == -1), -1)
    })

    test('Iterator.prototype.flatMap', () => {
        const a = [1, 2, 3]
        assertEq(Iterator.from(a).flatMap(x => Iterator.from(`${x * 10}`)).toArray(), ['1', '0', '2', '0', '3', '0'])
        assertEq(Iterator.$from(a).$flatMap(x => Iterator.$from(`${x * 10}`)).$toArray(), ['1', '0', '2', '0', '3', '0'])
    })

    test('Iterator.prototype.forEach', () => {
        {
            let a = 0
            Iterator.from([1, 2, 3]).forEach(x => { a += x })
            assertEq(a, 6)
        }
        {
            let a = 0
            Iterator.$from([1, 2, 3]).$forEach(x => { a += x })
            assertEq(a, 6)
        }
    })

    test('Iterator.prototype.last', () => {
        const a = [1, 2, 3]
        assertEq(Iterator.from([]).last(), undefined)
        assertEq(Iterator.from(a).last(), 3)
    })

    test('Iterator.prototype.map', () => {
        const a = [1, 2, 3]
        assertEq(Iterator.from(a).map(x => x * 2).toArray(), [2, 4, 6])
        assertEq(Iterator.$from(a).$map(x => x * 2).$toArray(), [2, 4, 6])
    })

    test('Iterator.prototype.maxBy', () => {
        const a = [1, 2, 3]
        assertEq(Iterator.from(a).maxBy((a, b) => a - b), 3)
    })

    test('Iterator.prototype.minBy', () => {
        const a = [1, 2, 3]
        assertEq(Iterator.from(a).minBy((a, b) => a - b), 1)
    })

    test('Iterator.prototype.nth', () => {
        const a = [1, 2, 3]
        assertExc(() => Iterator.from(a).nth(-1), { error: RangeError })
        assertEq(Iterator.from(a).nth(0), 1)
        assertEq(Iterator.from(a).nth(10), undefined)
    })

    test('Iterator.prototype.nthLast', () => {
        const a = [1, 2, 3]
        assertExc(() => Iterator.from(a).nthLast(-1), { error: RangeError })
        assertEq(Iterator.from(a).nthLast(0), 3)
        assertEq(Iterator.from(a).nthLast(10), undefined)
    })

    test('Iterator.prototype.reduce', () => {
        const a = [1, 2, 3]
        assertExc(() => Iterator.from([]).reduce((a, b) => a + b), { error: TypeError })
        assertEq(Iterator.from(a).reduce((a, b) => a + b), 6)

        assertExc(() => Iterator.$from([]).$reduce((a, b) => a + b), { error: TypeError })
        assertEq(Iterator.$from(a).$reduce((a, b) => a + b), 6)
    })

    test('Iterator.prototype.reduceRight', () => {
        const a = [1, 2, 3]
        assertExc(() => Iterator.from([]).reduceRight((a, b) => a - b), { error: TypeError })
        assertEq(Iterator.from(a).reduceRight((a, b) => a - b), 0)
    })

    test('Iterator.prototype.reverse', () => {
        const a = [1, 2, 3, 1]
        assertEq(Iterator.from(a).reverse().toArray(), [1, 3, 2, 1])
        assertEq(Iterator.from(a).reverse().reverse().toArray(), [1, 2, 3, 1])
        assertEq(Iterator.from(a).reverse().find(x => x == 2), 2)
        assertEq(Iterator.from(a).reverse().findIndex(x => x == 1), 0)
        assertEq(Iterator.from(a).reverse().findLastIndex(x => x == 1), 3)
        assertExc(() => Iterator.from(a).cycle().reverse(), { error: TypeError })
    })

    test('Iterator.prototype.some', () => {
        const a = [2, 3, 5, 7, 11]
        assertEq(Iterator.from([]).some(x => x % 2 == 0), false)
        assertEq(Iterator.from(a).some(x => x % 2 == 0), true)

        assertEq(Iterator.$from([]).$some(x => x % 2 == 0), false)
        assertEq(Iterator.$from(a).$some(x => x % 2 == 0), true)
    })

    test('Iterator.prototype.stepBy', () => {
        const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        assertEq(Iterator.from([]).stepBy(2).toArray(), [])
        assertEq(Iterator.from(a).stepBy(2).toArray(), [1, 3, 5, 7, 9])
        assertExc(() => Iterator.from(a).stepBy(-1), { error: RangeError })
    })

    test('Iterator.prototype.sum', () => {
        const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        const b = ['Hello, ', 'world!']
        assertExc(() => Iterator.from([]).sum(), { error: TypeError })
        assertEq(Iterator.from(a).sum(), 55)
        assertEq(Iterator.from(b).sum(), 'Hello, world!')
    })

    test('Iterator.prototype.take', () => {
        assertEq(Iterator.from([1, 2, 3]).take(0).toArray(), [])
        assertEq(Iterator.from([1, 2, 3]).take(1).toArray(), [1])
        assertEq(Iterator.from([1, 2, 3]).take(5).toArray(), [1, 2, 3])
        assertExc(() => Iterator.from([1, 2, 3]).take(-1), { error: RangeError })

        assertEq(Iterator.$from([1, 2, 3]).$take(0).$toArray(), [])
        assertEq(Iterator.$from([1, 2, 3]).$take(1).$toArray(), [1])
        assertEq(Iterator.$from([1, 2, 3]).$take(5).$toArray(), [1, 2, 3])
        assertExc(() => Iterator.$from([1, 2, 3]).$take(-1), { error: RangeError })
    })

    test('Iterator.prototype.takeWhile', () => {
        const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        assertEq(Iterator.from(a).takeWhile(x => x < 0).toArray(), [])
        assertEq(Iterator.from(a).takeWhile(x => x < 5).toArray(), [1, 2, 3, 4])
        assertEq(Iterator.from(a).takeWhile(x => x < 100).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    test('Iterator.prototype.zip', () => {
        const a = [1, 2, 3, 4]
        const b = ['apple', 'banana', 'orange']
        assertEq(Iterator.from([]).zip(Iterator.from([])).toArray(), [])
        assertEq(Iterator.from(a).zip(Iterator.from(b)).toArray(), [[1, 'apple'], [2, 'banana'], [3, 'orange']])
    })
})
