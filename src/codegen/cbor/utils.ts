const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']

export function getNewIndexLetter(result: string[]) {
    let isUsed = true,
        i = 0,
        newLetter = letters[i]

    isUsed = result.some((line) => line.includes(`let ${newLetter}`))
    while (isUsed && i != letters.length) {
        i++
        newLetter = letters[i]
        isUsed = result.some((line) => line.includes(`let ${newLetter}`))
    }

    if (i == letters.length) throw new Error('no more indexes to use')
    return newLetter
}
