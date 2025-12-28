// like python's zip 
export function zip<T extends readonly unknown[][]>(
  ...arrays: T
): Array<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }> {
  if (arrays.length === 0) return []
  
  const minLength = Math.min(...arrays.map(arr => arr.length))
  const result: Array<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }> = []
  
  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map(arr => arr[i]) as { [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never })
  }
  
  return result
}