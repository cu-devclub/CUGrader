import { parseDateTime } from "@internationalized/date";
import { APIClient } from "../type";

export async function seed(client: APIClient) {
  await client.classes.create({
    courseId: "1",
    name: "Programming",
    semester: "2025/1",
  });

  await client.classes.create({
    courseId: "758",
    name: "sone",
    semester: "2024/2",
  });

  await client.instructorsAndTAs.addToClass(420, "ame@student.chula.ac.th");
  await client.instructorsAndTAs.addToClass(420, "suisei@student.chula.ac.th");
  await client.instructorsAndTAs.addToClass(420, "mark45@chula.ac.th");

  await client.instructorsAndTAs.addToClass(421, "71382213@student.chula.ac.th");
  await client.instructorsAndTAs.addToClass(421, "wave@chula.ac.th");
  await client.instructorsAndTAs.addToClass(421, "ajarn@chula.ac.th");

  await client.students.addToClass(420, {
    email: "12@student.chula.ac.th",
    section: 0,
  });

  await client.students.addToClass(420, {
    email: "45@student.chula.ac.th",
    section: 0,
  });

  await client.students.addToClass(420, {
    email: "2223@student.chula.ac.th",
    section: 0,
  });
  await client.students.addToClass(420, {
    email: "12313@student.chula.ac.th",
    section: 0,
  });

  await client.assignments.create(420, {
    number: 4,
    name: "Haskell Monads",
    publish: parseDateTime('2025-06-12T10:00'),
    due: parseDateTime('2025-07-05T23:59'),
    examPin: "456789",
    showScoreOnLock: true,
    testCode: "describe \"Maybe Monad\" $ do\n  it \"handles safe division\" $ do\n    safeDivide 10 2 `shouldBe` Just 5.0\n    safeDivide 10 0 `shouldBe` Nothing\n  it \"chains operations\" $ do\n    chainDivisions 20 4 2 `shouldBe` Just 2.5",
    secretTestCode: "describe \"IO Monad\" $ do\n  it \"processes input correctly\" $ do\n    result <- captureOutput processInput\n    result `shouldContain` \"10\"",
    examMode: true,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Maybe Monad",
        description: "Implement safe division using Maybe monad",
        template: "-- Implement safe division that returns Nothing for division by zero\nsafeDivide :: Double -> Double -> Maybe Double\nsafeDivide x y = -- Your code here\n\n-- Chain safe divisions using monadic operations\nchainDivisions :: Double -> Double -> Double -> Maybe Double\nchainDivisions x y z = -- Your code here using >>= or do notation",
        maxScore: 80,
        languageIds: [8],
        answer: "safeDivide :: Double -> Double -> Maybe Double\nsafeDivide x 0 = Nothing\nsafeDivide x y = Just (x / y)\n\nchainDivisions :: Double -> Double -> Maybe Double\nchainDivisions x y z = safeDivide x y >>= \\result -> safeDivide result z", testCode: "describe \"Maybe Monad\" $ do\n  it \"handles safe division\" $ do\n    safeDivide 10 2 `shouldBe` Just 5.0\n    safeDivide 10 0 `shouldBe` Nothing",
        secretTestCode: "describe \"Maybe Monad Secret\" $ do\n  it \"handles complex chains\" $ do\n    chainDivisions 100 5 4 `shouldBe` Just 5.0",
        testcases: [{ input: "10 2 5", output: "Just 1.0" }, { input: "10 0 5", output: "Nothing" }],
        secretTestCases: [{ input: "20 4 2", output: "Just 2.5" }]
      },
      {
        number: 2,
        name: "IO Monad",
        description: "Create an IO action that reads and processes user input",
        template: "-- Create an IO action that reads a line, converts to Int, doubles it, and prints\nprocessInput :: IO ()\nprocessInput = -- Your code here using do notation\n\n-- Helper function to safely parse Int\nsafeRead :: String -> Maybe Int\nsafeRead s = -- Your code here",
        maxScore: 70,
        languageIds: [8],
        answer: "processInput :: IO ()\nprocessInput = do\n  line <- getLine\n  case safeRead line of\n    Just n -> print (n * 2)\n    Nothing -> putStrLn \"Invalid input\"\n\nsafeRead :: String -> Maybe Int\nsafeRead s = case reads s of\n  [(n, \"\")] -> Just n\n  _ -> Nothing", testCode: "describe \"IO Monad\" $ do\n  it \"processes input safely\" $ do\n    result <- testProcessInput \"5\"\n    result `shouldBe` \"10\"",
        secretTestCode: "describe \"IO Monad Secret\" $ do\n  it \"handles invalid input\" $ do\n    result <- testProcessInput \"abc\"\n    result `shouldBe` \"Invalid input\"",
        testcases: [{ input: "5", output: "10" }],
        secretTestCases: [{ input: "abc", output: "Invalid input" }]
      }
    ],
  });
  await client.assignments.create(420, {
    number: 3,
    name: "Swift Generics",
    publish: parseDateTime('2025-06-18T11:00'),
    due: parseDateTime('2025-07-10T20:00'),
    examPin: "321654",
    showScoreOnLock: true, testCode: "XCTAssertEqual(stack.isEmpty, true)\nstack.push(1)\nstack.push(2)\nXCTAssertEqual(stack.pop(), 2)\nXCTAssertEqual(stack.isEmpty, false)",
    secretTestCode: "XCTAssertEqual(findCommon([1,2,3], [2,3,4]).sorted(), [2,3])\nXCTAssertEqual(sortedUnique([3,1,2,1,3]), [1,2,3])",
    examMode: true,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Generic Data Structures",
        description: "Implement a generic Stack with associated types",
        template: "// Define a protocol for Stack behavior\nprotocol StackProtocol {\n    associatedtype Element\n    mutating func push(_ element: Element)\n    mutating func pop() -> Element?\n    var isEmpty: Bool { get }\n}\n\n// Implement a generic Stack\nstruct Stack<T>: StackProtocol {\n    // Your implementation here\n}",
        maxScore: 80,
        languageIds: [7],
        answer: "protocol StackProtocol {\n    associatedtype Element\n    mutating func push(_ element: Element)\n    mutating func pop() -> Element?\n    var isEmpty: Bool { get }\n}\n\nstruct Stack<T>: StackProtocol {\n    typealias Element = T\n    private var items: [T] = []\n    \n    mutating func push(_ element: T) {\n        items.append(element)\n    }\n    \n    mutating func pop() -> T? {\n        return items.popLast()\n    }\n    \n    var isEmpty: Bool {\n        return items.isEmpty\n    }\n}", testCode: "XCTAssertEqual(stack.isEmpty, true)\nvar stack = Stack<Int>()\nstack.push(1)\nstack.push(2)\nXCTAssertEqual(stack.pop(), 2)",
        secretTestCode: "var emptyStack = Stack<String>()\nXCTAssertEqual(emptyStack.isEmpty, true)\nXCTAssertNil(emptyStack.pop())",
        testcases: [{ input: "push(1), push(2), pop()", output: "2" }],
        secretTestCases: [{ input: "isEmpty", output: "true" }]
      },
      {
        number: 2,
        name: "Generic Constraints",
        description: "Implement generic functions with where clauses",
        template: "// Generic function that finds common elements between two arrays\n// T must be Equatable and Hashable\nfunc findCommon<T>(_ array1: [T], _ array2: [T]) -> [T] where T: Equatable, T: Hashable {\n    // Your implementation here\n}\n\n// Generic function that sorts and returns unique elements\nfunc sortedUnique<T>(_ array: [T]) -> [T] where T: Comparable, T: Hashable {\n    // Your implementation here\n}",
        maxScore: 70,
        languageIds: [7],
        answer: "func findCommon<T>(_ array1: [T], _ array2: [T]) -> [T] where T: Equatable, T: Hashable {\n    let set1 = Set(array1)\n    let set2 = Set(array2)\n    return Array(set1.intersection(set2))\n}\n\nfunc sortedUnique<T>(_ array: [T]) -> [T] where T: Comparable, T: Hashable {\n    return Array(Set(array)).sorted()\n}", testCode: "XCTAssertEqual(findCommon([1,2,3], [2,3,4]).sorted(), [2,3])\nXCTAssertEqual(findCommon([1,2], [3,4]), [])",
        secretTestCode: "XCTAssertEqual(sortedUnique([3,1,2,1,3]), [1,2,3])\nXCTAssertEqual(sortedUnique([5,5,5]), [5])",
        testcases: [{ input: "[1,2,3], [2,3,4]", output: "[2,3]" }],
        secretTestCases: [{ input: "[3,1,2,1,3]", output: "[1,2,3]" }]
      }
    ],
  });

  await client.assignments.create(420, {
    number: 4,
    name: "TypeScript with Vitest Testing",
    publish: parseDateTime('2025-06-20T13:30'),
    due: parseDateTime('2025-07-12T16:00'),
    examPin: "987321",
    showScoreOnLock: false, testCode: "expect(isPrime(7)).toBeTruthy();\nexpect(isPrime(4)).toBeFalsy();\nexpect(sieveOfEratosthenes(10)).toEqual([2, 3, 5, 7]);",
    secretTestCode: "expect(isPrime(97)).toBeTruthy();\nexpect(isPrime(100)).toBeFalsy();\nexpect(sieveOfEratosthenes(20).length).toBe(8);",
    examMode: false,
    closeOnDue: false,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Prime Number Checker",
        description: "Implement an efficient prime number checker with proper TypeScript types",
        template: "// Implement a function that checks if a number is prime\n// Use proper TypeScript types and handle edge cases\nfunction isPrime(n: number): boolean {\n  // Your implementation here\n}\n\n// Implement a function that finds all primes up to n using Sieve of Eratosthenes\nfunction sieveOfEratosthenes(limit: number): number[] {\n  // Your implementation here\n}",
        maxScore: 80,
        languageIds: [6],
        answer: "function isPrime(n: number): boolean {\n  if (n < 2) return false;\n  if (n === 2) return true;\n  if (n % 2 === 0) return false;\n  \n  for (let i = 3; i * i <= n; i += 2) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\n\nfunction sieveOfEratosthenes(limit: number): number[] {\n  const primes: boolean[] = new Array(limit + 1).fill(true);\n  primes[0] = primes[1] = false;\n  \n  for (let i = 2; i * i <= limit; i++) {\n    if (primes[i]) {\n      for (let j = i * i; j <= limit; j += i) {\n        primes[j] = false;\n      }\n    }\n  }\n  \n  return primes.map((isPrime, index) => isPrime ? index : -1)\n                .filter(num => num !== -1);\n}",
        testCode: "expect(isPrime(7)).toBeTruthy();\nexpect(isPrime(4)).toBeFalsy();\nexpect(sieveOfEratosthenes(10)).toEqual([2, 3, 5, 7]);",
        secretTestCode: "expect(isPrime(97)).toBeTruthy();\nexpected(isPrime(100)).toBeFalsy();\nexpect(sieveOfEratosthenes(20).length).toBe(8);",
        testcases: [{ input: "7", output: "true" }, { input: "4", output: "false" }],
        secretTestCases: [{ input: "97", output: "true" }, { input: "100", output: "false" }]
      },
      {
        number: 2,
        name: "Generic Utility Types",
        description: "Implement advanced TypeScript utility types and functions",
        template: "// Implement a deep readonly type\ntype DeepReadonly<T> = {\n  // Your implementation here\n};\n\n// Implement a function that safely gets nested object properties\nfunction safeGet<T, K extends keyof T>(\n  obj: T,\n  path: K[]\n): T[K] | undefined {\n  // Your implementation here\n}\n\n// Implement a generic debounce function\nfunction debounce<T extends (...args: any[]) => any>(\n  func: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  // Your implementation here\n}",
        maxScore: 90,
        languageIds: [6],
        answer: "type DeepReadonly<T> = {\n  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];\n};\n\nfunction safeGet<T, K extends keyof T>(\n  obj: T,\n  path: K[]\n): any {\n  return path.reduce((current: any, key) => {\n    return current && current[key] !== undefined ? current[key] : undefined;\n  }, obj);\n}\n\nfunction debounce<T extends (...args: any[]) => any>(\n  func: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let timeoutId: NodeJS.Timeout;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func(...args), delay);\n  };\n}",
        testCode: "const obj = { a: { b: { c: 42 } } };\nexpect(safeGet(obj, ['a', 'b', 'c'])).toBe(42);\nexpect(safeGet(obj, ['a', 'x'])).toBeUndefined();",
        secretTestCode: "const debouncedFn = debounce(() => console.log('called'), 100);\nexpect(typeof debouncedFn).toBe('function');",
        testcases: [{ input: "obj.a.b.c", output: "42" }],
        secretTestCases: [{ input: "obj.a.x", output: "undefined" }]
      }],
  });

  await client.assignments.create(420, {
    number: 6,
    name: "Generic Linked List Implementation",
    publish: parseDateTime('2025-06-01T09:00'),
    due: parseDateTime('2025-07-20T23:59'),
    examPin: "111111",
    showScoreOnLock: true,
    testCode: "generic linked list test",
    secretTestCode: "generic linked list secret",
    examMode: false,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Generic Singly Linked List",
        description: "Implement a generic singly linked list with basic operations",
        template: "// Generic Node class\nclass ListNode<T> {\n  value: T;\n  next: ListNode<T> | null = null;\n  \n  constructor(value: T) {\n    this.value = value;\n  }\n}\n\n// Generic Linked List implementation\nclass LinkedList<T> {\n  private head: ListNode<T> | null = null;\n  private size: number = 0;\n  \n  // Insert at the beginning\n  prepend(value: T): void {\n    // Your implementation here\n  }\n  \n  // Insert at the end\n  append(value: T): void {\n    // Your implementation here\n  }\n  \n  // Insert at specific index\n  insert(index: number, value: T): void {\n    // Your implementation here\n  }\n  \n  // Remove by value (first occurrence)\n  remove(value: T): boolean {\n    // Your implementation here\n  }\n  \n  // Remove at specific index\n  removeAt(index: number): T | null {\n    // Your implementation here\n  }\n  \n  // Find element\n  find(value: T): ListNode<T> | null {\n    // Your implementation here\n  }\n  \n  // Get size\n  getSize(): number {\n    return this.size;\n  }\n  \n  // Convert to array\n  toArray(): T[] {\n    // Your implementation here\n  }\n}",
        languageIds: [6, 1, 4, 2, 7, 8, 9],
        maxScore: 85,
        answer: "class ListNode<T> {\n  value: T;\n  next: ListNode<T> | null = null;\n  \n  constructor(value: T) {\n    this.value = value;\n  }\n}\n\nclass LinkedList<T> {\n  private head: ListNode<T> | null = null;\n  private size: number = 0;\n  \n  prepend(value: T): void {\n    const newNode = new ListNode(value);\n    newNode.next = this.head;\n    this.head = newNode;\n    this.size++;\n  }\n  \n  append(value: T): void {\n    const newNode = new ListNode(value);\n    if (!this.head) {\n      this.head = newNode;\n    } else {\n      let current = this.head;\n      while (current.next) {\n        current = current.next;\n      }\n      current.next = newNode;\n    }\n    this.size++;\n  }\n  \n  insert(index: number, value: T): void {\n    if (index < 0 || index > this.size) throw new Error('Index out of bounds');\n    if (index === 0) return this.prepend(value);\n    \n    const newNode = new ListNode(value);\n    let current = this.head;\n    for (let i = 0; i < index - 1; i++) {\n      current = current!.next;\n    }\n    newNode.next = current!.next;\n    current!.next = newNode;\n    this.size++;\n  }\n  \n  remove(value: T): boolean {\n    if (!this.head) return false;\n    \n    if (this.head.value === value) {\n      this.head = this.head.next;\n      this.size--;\n      return true;\n    }\n    \n    let current = this.head;\n    while (current.next && current.next.value !== value) {\n      current = current.next;\n    }\n    \n    if (current.next) {\n      current.next = current.next.next;\n      this.size--;\n      return true;\n    }\n    return false;\n  }\n  \n  removeAt(index: number): T | null {\n    if (index < 0 || index >= this.size || !this.head) return null;\n    \n    if (index === 0) {\n      const value = this.head.value;\n      this.head = this.head.next;\n      this.size--;\n      return value;\n    }\n    \n    let current = this.head;\n    for (let i = 0; i < index - 1; i++) {\n      current = current!.next;\n    }\n    \n    const nodeToRemove = current!.next;\n    if (nodeToRemove) {\n      current!.next = nodeToRemove.next;\n      this.size--;\n      return nodeToRemove.value;\n    }\n    return null;\n  }\n  \n  find(value: T): ListNode<T> | null {\n    let current = this.head;\n    while (current) {\n      if (current.value === value) return current;\n      current = current.next;\n    }\n    return null;\n  }\n  \n  getSize(): number {\n    return this.size;\n  }\n  \n  toArray(): T[] {\n    const result: T[] = [];\n    let current = this.head;\n    while (current) {\n      result.push(current.value);\n      current = current.next;\n    }\n    return result;\n  }\n}",
        testCode: "const list = new LinkedList<number>();\nlist.append(1);\nlist.append(2);\nlist.prepend(0);\nexpect(list.toArray()).toEqual([0, 1, 2]);\nexpect(list.getSize()).toBe(3);",
        secretTestCode: "list.insert(1, 5);\nexpect(list.toArray()).toEqual([0, 5, 1, 2]);\nexpect(list.remove(5)).toBe(true);\nexpect(list.find(1)?.value).toBe(1);",
        testcases: [{ input: "[1,2,3]", output: "LinkedList with 3 elements" }],
        secretTestCases: [{ input: "insert(1, 5)", output: "[1,5,2,3]" }]
      }
    ],
  });
  await client.assignments.create(420, {
    number: 6,
    name: "Generic Binary Search Tree",
    publish: parseDateTime('2025-06-05T09:00'),
    due: parseDateTime('2025-07-25T23:59'),
    examPin: "222222",
    showScoreOnLock: true,
    testCode: "binary search tree test",
    secretTestCode: "binary search tree secret",
    examMode: false,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Generic Binary Search Tree",
        description: "Implement a generic binary search tree with insertion, deletion, and traversal",
        template: "// Binary Tree Node\nclass TreeNode<T> {\n  value: T;\n  left: TreeNode<T> | null = null;\n  right: TreeNode<T> | null = null;\n  \n  constructor(value: T) {\n    this.value = value;\n  }\n}\n\n// Binary Search Tree implementation\nclass BinarySearchTree<T> {\n  private root: TreeNode<T> | null = null;\n  private compareFn: (a: T, b: T) => number;\n  \n  constructor(compareFn: (a: T, b: T) => number) {\n    this.compareFn = compareFn;\n  }\n  \n  // Insert a value\n  insert(value: T): void {\n    // Your implementation here\n  }\n  \n  // Search for a value\n  search(value: T): boolean {\n    // Your implementation here\n  }\n  \n  // Delete a value\n  delete(value: T): boolean {\n    // Your implementation here\n  }\n  \n  // In-order traversal\n  inOrder(): T[] {\n    // Your implementation here\n  }\n  \n  // Pre-order traversal\n  preOrder(): T[] {\n    // Your implementation here\n  }\n  \n  // Post-order traversal\n  postOrder(): T[] {\n    // Your implementation here\n  }\n  \n  // Find minimum value\n  findMin(): T | null {\n    // Your implementation here\n  }\n  \n  // Find maximum value\n  findMax(): T | null {\n    // Your implementation here\n  }\n  \n  // Get height of tree\n  getHeight(): number {\n    // Your implementation here\n  }\n}",
        maxScore: 100,
        languageIds: [6, 1, 4, 2, 7, 8, 9],
        answer: "class TreeNode<T> {\n  value: T;\n  left: TreeNode<T> | null = null;\n  right: TreeNode<T> | null = null;\n  \n  constructor(value: T) {\n    this.value = value;\n  }\n}\n\nclass BinarySearchTree<T> {\n  private root: TreeNode<T> | null = null;\n  private compareFn: (a: T, b: T) => number;\n  \n  constructor(compareFn: (a: T, b: T) => number) {\n    this.compareFn = compareFn;\n  }\n  \n  insert(value: T): void {\n    this.root = this.insertNode(this.root, value);\n  }\n  \n  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {\n    if (!node) return new TreeNode(value);\n    \n    const cmp = this.compareFn(value, node.value);\n    if (cmp < 0) {\n      node.left = this.insertNode(node.left, value);\n    } else if (cmp > 0) {\n      node.right = this.insertNode(node.right, value);\n    }\n    return node;\n  }\n  \n  search(value: T): boolean {\n    return this.searchNode(this.root, value);\n  }\n  \n  private searchNode(node: TreeNode<T> | null, value: T): boolean {\n    if (!node) return false;\n    \n    const cmp = this.compareFn(value, node.value);\n    if (cmp === 0) return true;\n    if (cmp < 0) return this.searchNode(node.left, value);\n    return this.searchNode(node.right, value);\n  }\n  \n  delete(value: T): boolean {\n    const [newRoot, deleted] = this.deleteNode(this.root, value);\n    this.root = newRoot;\n    return deleted;\n  }\n  \n  private deleteNode(node: TreeNode<T> | null, value: T): [TreeNode<T> | null, boolean] {\n    if (!node) return [null, false];\n    \n    const cmp = this.compareFn(value, node.value);\n    if (cmp < 0) {\n      const [newLeft, deleted] = this.deleteNode(node.left, value);\n      node.left = newLeft;\n      return [node, deleted];\n    } else if (cmp > 0) {\n      const [newRight, deleted] = this.deleteNode(node.right, value);\n      node.right = newRight;\n      return [node, deleted];\n    } else {\n      if (!node.left) return [node.right, true];\n      if (!node.right) return [node.left, true];\n      \n      const successor = this.findMinNode(node.right);\n      node.value = successor.value;\n      const [newRight] = this.deleteNode(node.right, successor.value);\n      node.right = newRight;\n      return [node, true];\n    }\n  }\n  \n  private findMinNode(node: TreeNode<T>): TreeNode<T> {\n    while (node.left) node = node.left;\n    return node;\n  }\n  \n  inOrder(): T[] {\n    const result: T[] = [];\n    this.inOrderTraversal(this.root, result);\n    return result;\n  }\n  \n  private inOrderTraversal(node: TreeNode<T> | null, result: T[]): void {\n    if (node) {\n      this.inOrderTraversal(node.left, result);\n      result.push(node.value);\n      this.inOrderTraversal(node.right, result);\n    }\n  }\n  \n  preOrder(): T[] {\n    const result: T[] = [];\n    this.preOrderTraversal(this.root, result);\n    return result;\n  }\n  \n  private preOrderTraversal(node: TreeNode<T> | null, result: T[]): void {\n    if (node) {\n      result.push(node.value);\n      this.preOrderTraversal(node.left, result);\n      this.preOrderTraversal(node.right, result);\n    }\n  }\n  \n  postOrder(): T[] {\n    const result: T[] = [];\n    this.postOrderTraversal(this.root, result);\n    return result;\n  }\n  \n  private postOrderTraversal(node: TreeNode<T> | null, result: T[]): void {\n    if (node) {\n      this.postOrderTraversal(node.left, result);\n      this.postOrderTraversal(node.right, result);\n      result.push(node.value);\n    }\n  }\n  \n  findMin(): T | null {\n    if (!this.root) return null;\n    return this.findMinNode(this.root).value;\n  }\n  \n  findMax(): T | null {\n    if (!this.root) return null;\n    let current = this.root;\n    while (current.right) current = current.right;\n    return current.value;\n  }\n  \n  getHeight(): number {\n    return this.calculateHeight(this.root);\n  }\n  \n  private calculateHeight(node: TreeNode<T> | null): number {\n    if (!node) return 0;\n    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));\n  }\n}",
        testCode: "const bst = new BinarySearchTree<number>((a, b) => a - b);\nbst.insert(5);\nbst.insert(3);\nbst.insert(7);\nexpect(bst.search(5)).toBe(true);\nexpect(bst.inOrder()).toEqual([3, 5, 7]);",
        secretTestCode: "bst.delete(3);\nexpect(bst.inOrder()).toEqual([5, 7]);\nexpected(bst.getHeight()).toBe(2);",
        testcases: [{ input: "insert(5,3,7)", output: "in-order: [3,5,7]" }],
        secretTestCases: [{ input: "delete(3)", output: "in-order: [5,7]" }]
      }
    ],
  });
  await client.assignments.create(420, {
    number: 7,
    name: "Graph Algorithms Implementation",
    publish: parseDateTime('2025-06-10T09:00'),
    due: parseDateTime('2025-08-01T23:59'),
    examPin: "333333",
    showScoreOnLock: true,
    testCode: "graph algorithms test",
    secretTestCode: "graph algorithms secret",
    examMode: false,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Graph Representation and Traversal",
        description: "Implement graph data structure with DFS, BFS, and shortest path algorithms",
        template: "// Edge representation\ninterface Edge<T> {\n  from: T;\n  to: T;\n  weight?: number;\n}\n\n// Graph implementation using adjacency list\nclass Graph<T> {\n  private adjacencyList: Map<T, { node: T; weight: number }[]> = new Map();\n  private directed: boolean;\n  \n  constructor(directed: boolean = false) {\n    this.directed = directed;\n  }\n  \n  // Add vertex\n  addVertex(vertex: T): void {\n    // Your implementation here\n  }\n  \n  // Add edge\n  addEdge(from: T, to: T, weight: number = 1): void {\n    // Your implementation here\n  }\n  \n  // Remove vertex\n  removeVertex(vertex: T): void {\n    // Your implementation here\n  }\n  \n  // Remove edge\n  removeEdge(from: T, to: T): void {\n    // Your implementation here\n  }\n  \n  // Depth-First Search\n  dfs(startVertex: T): T[] {\n    // Your implementation here\n  }\n  \n  // Breadth-First Search\n  bfs(startVertex: T): T[] {\n    // Your implementation here\n  }\n  \n  // Dijkstra's shortest path algorithm\n  dijkstra(startVertex: T): Map<T, { distance: number; previous: T | null }> {\n    // Your implementation here\n  }\n  \n  // Detect cycle (for directed graphs)\n  hasCycle(): boolean {\n    // Your implementation here\n  }\n  \n  // Topological sort (for DAGs)\n  topologicalSort(): T[] {\n    // Your implementation here\n  }\n  \n  // Get all vertices\n  getVertices(): T[] {\n    // Your implementation here\n  }\n  \n  // Get neighbors of a vertex\n  getNeighbors(vertex: T): { node: T; weight: number }[] {\n    // Your implementation here\n  }\n}",
        maxScore: 120,
        answer: "interface Edge<T> {\n  from: T;\n  to: T;\n  weight?: number;\n}\n\nclass Graph<T> {\n  private adjacencyList: Map<T, { node: T; weight: number }[]> = new Map();\n  private directed: boolean;\n  \n  constructor(directed: boolean = false) {\n    this.directed = directed;\n  }\n  \n  addVertex(vertex: T): void {\n    if (!this.adjacencyList.has(vertex)) {\n      this.adjacencyList.set(vertex, []);\n    }\n  }\n  \n  addEdge(from: T, to: T, weight: number = 1): void {\n    this.addVertex(from);\n    this.addVertex(to);\n    \n    this.adjacencyList.get(from)!.push({ node: to, weight });\n    if (!this.directed) {\n      this.adjacencyList.get(to)!.push({ node: from, weight });\n    }\n  }\n  \n  removeVertex(vertex: T): void {\n    if (!this.adjacencyList.has(vertex)) return;\n    \n    // Remove all edges to this vertex\n    for (const [v, neighbors] of this.adjacencyList) {\n      this.adjacencyList.set(v, neighbors.filter(n => n.node !== vertex));\n    }\n    \n    // Remove the vertex itself\n    this.adjacencyList.delete(vertex);\n  }\n  \n  removeEdge(from: T, to: T): void {\n    const fromNeighbors = this.adjacencyList.get(from);\n    if (fromNeighbors) {\n      this.adjacencyList.set(from, fromNeighbors.filter(n => n.node !== to));\n    }\n    \n    if (!this.directed) {\n      const toNeighbors = this.adjacencyList.get(to);\n      if (toNeighbors) {\n        this.adjacencyList.set(to, toNeighbors.filter(n => n.node !== from));\n      }\n    }\n  }\n  \n  dfs(startVertex: T): T[] {\n    const visited = new Set<T>();\n    const result: T[] = [];\n    \n    const dfsHelper = (vertex: T) => {\n      visited.add(vertex);\n      result.push(vertex);\n      \n      const neighbors = this.adjacencyList.get(vertex) || [];\n      for (const neighbor of neighbors) {\n        if (!visited.has(neighbor.node)) {\n          dfsHelper(neighbor.node);\n        }\n      }\n    };\n    \n    dfsHelper(startVertex);\n    return result;\n  }\n  \n  bfs(startVertex: T): T[] {\n    const visited = new Set<T>();\n    const queue: T[] = [startVertex];\n    const result: T[] = [];\n    \n    visited.add(startVertex);\n    \n    while (queue.length > 0) {\n      const vertex = queue.shift()!;\n      result.push(vertex);\n      \n      const neighbors = this.adjacencyList.get(vertex) || [];\n      for (const neighbor of neighbors) {\n        if (!visited.has(neighbor.node)) {\n          visited.add(neighbor.node);\n          queue.push(neighbor.node);\n        }\n      }\n    }\n    \n    return result;\n  }\n  \n  dijkstra(startVertex: T): Map<T, { distance: number; previous: T | null }> {\n    const distances = new Map<T, { distance: number; previous: T | null }>();\n    const unvisited = new Set<T>();\n    \n    // Initialize distances\n    for (const vertex of this.adjacencyList.keys()) {\n      distances.set(vertex, {\n        distance: vertex === startVertex ? 0 : Infinity,\n        previous: null\n      });\n      unvisited.add(vertex);\n    }\n    \n    while (unvisited.size > 0) {\n      // Find unvisited vertex with minimum distance\n      let current: T | null = null;\n      let minDistance = Infinity;\n      \n      for (const vertex of unvisited) {\n        const dist = distances.get(vertex)!.distance;\n        if (dist < minDistance) {\n          minDistance = dist;\n          current = vertex;\n        }\n      }\n      \n      if (!current || minDistance === Infinity) break;\n      \n      unvisited.delete(current);\n      \n      const neighbors = this.adjacencyList.get(current) || [];\n      for (const neighbor of neighbors) {\n        if (unvisited.has(neighbor.node)) {\n          const newDistance = minDistance + neighbor.weight;\n          const currentDistance = distances.get(neighbor.node)!.distance;\n          \n          if (newDistance < currentDistance) {\n            distances.set(neighbor.node, {\n              distance: newDistance,\n              previous: current\n            });\n          }\n        }\n      }\n    }\n    \n    return distances;\n  }\n  \n  hasCycle(): boolean {\n    if (!this.directed) {\n      // For undirected graphs, use DFS with parent tracking\n      const visited = new Set<T>();\n      \n      const hasCycleDFS = (vertex: T, parent: T | null): boolean => {\n        visited.add(vertex);\n        \n        const neighbors = this.adjacencyList.get(vertex) || [];\n        for (const neighbor of neighbors) {\n          if (!visited.has(neighbor.node)) {\n            if (hasCycleDFS(neighbor.node, vertex)) return true;\n          } else if (neighbor.node !== parent) {\n            return true;\n          }\n        }\n        return false;\n      };\n      \n      for (const vertex of this.adjacencyList.keys()) {\n        if (!visited.has(vertex)) {\n          if (hasCycleDFS(vertex, null)) return true;\n        }\n      }\n      return false;\n    } else {\n      // For directed graphs, use DFS with color states\n      const WHITE = 0, GRAY = 1, BLACK = 2;\n      const colors = new Map<T, number>();\n      \n      for (const vertex of this.adjacencyList.keys()) {\n        colors.set(vertex, WHITE);\n      }\n      \n      const hasCycleDFS = (vertex: T): boolean => {\n        colors.set(vertex, GRAY);\n        \n        const neighbors = this.adjacencyList.get(vertex) || [];\n        for (const neighbor of neighbors) {\n          const color = colors.get(neighbor.node)!;\n          if (color === GRAY) return true;\n          if (color === WHITE && hasCycleDFS(neighbor.node)) return true;\n        }\n        \n        colors.set(vertex, BLACK);\n        return false;\n      };\n      \n      for (const vertex of this.adjacencyList.keys()) {\n        if (colors.get(vertex) === WHITE) {\n          if (hasCycleDFS(vertex)) return true;\n        }\n      }\n      return false;\n    }\n  }\n  \n  topologicalSort(): T[] {\n    if (!this.directed) {\n      throw new Error('Topological sort is only valid for directed graphs');\n    }\n    \n    const visited = new Set<T>();\n    const stack: T[] = [];\n    \n    const topSortDFS = (vertex: T) => {\n      visited.add(vertex);\n      \n      const neighbors = this.adjacencyList.get(vertex) || [];\n      for (const neighbor of neighbors) {\n        if (!visited.has(neighbor.node)) {\n          topSortDFS(neighbor.node);\n        }\n      }\n      \n      stack.push(vertex);\n    };\n    \n    for (const vertex of this.adjacencyList.keys()) {\n      if (!visited.has(vertex)) {\n        topSortDFS(vertex);\n      }\n    }\n    \n    return stack.reverse();\n  }\n  \n  getVertices(): T[] {\n    return Array.from(this.adjacencyList.keys());\n  }\n  \n  getNeighbors(vertex: T): { node: T; weight: number }[] {\n    return this.adjacencyList.get(vertex) || [];\n  }\n}",
        testCode: "const graph = new Graph<string>();\ngraph.addEdge('A', 'B', 1);\ngraph.addEdge('B', 'C', 2);\nexpected(graph.bfs('A')).toEqual(['A', 'B', 'C']);\nexpected(graph.dfs('A')).toEqual(['A', 'B', 'C']);",
        secretTestCode: "const distances = graph.dijkstra('A');\nexpected(distances.get('C')?.distance).toBe(3);\nexpected(graph.hasCycle()).toBe(false);",
        testcases: [{ input: "BFS from A", output: "['A', 'B', 'C']" }],
        secretTestCases: [{ input: "dijkstra from A to C", output: "distance: 3" }],
        languageIds: [6, 1, 4, 2, 7, 8, 9]
      }
    ],
  });
  await client.assignments.create(420, {
    number: 9,
    name: "Dynamic Programming Algorithms",
    publish: parseDateTime('2025-06-15T09:00'),
    due: parseDateTime('2025-08-05T23:59'),
    examPin: "444444",
    showScoreOnLock: true, testCode: "dynamic programming test",
    secretTestCode: "dynamic programming secret",
    examMode: false,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Classic DP Problems",
        description: "Implement various dynamic programming algorithms including memoization and tabulation",
        template: "// Dynamic Programming utility class\nclass DynamicProgramming {\n  // Fibonacci with memoization\n  static fibonacciMemo(n: number, memo: Map<number, number> = new Map()): number {\n    // Your implementation here\n  }\n  \n  // Fibonacci with tabulation\n  static fibonacciTab(n: number): number {\n    // Your implementation here\n  }\n  \n  // Longest Common Subsequence\n  static longestCommonSubsequence(str1: string, str2: string): number {\n    // Your implementation here\n  }\n  \n  // 0/1 Knapsack Problem\n  static knapsack(weights: number[], values: number[], capacity: number): number {\n    // Your implementation here\n  }\n  \n  // Coin Change Problem (minimum coins)\n  static coinChange(coins: number[], amount: number): number {\n    // Your implementation here\n  }\n  \n  // Longest Increasing Subsequence\n  static longestIncreasingSubsequence(nums: number[]): number {\n    // Your implementation here\n  }\n  \n  // Edit Distance (Levenshtein Distance)\n  static editDistance(str1: string, str2: string): number {\n    // Your implementation here\n  }\n  \n  // Maximum Subarray Sum (Kadane's Algorithm)\n  static maxSubarraySum(nums: number[]): number {\n    // Your implementation here\n  }\n  \n  // House Robber Problem\n  static houseRobber(nums: number[]): number {\n    // Your implementation here\n  }\n  \n  // Climbing Stairs\n  static climbingStairs(n: number): number {\n    // Your implementation here\n  }\n}",
        maxScore: 150,
        answer: "class DynamicProgramming {\n  static fibonacciMemo(n: number, memo: Map<number, number> = new Map()): number {\n    if (n <= 1) return n;\n    if (memo.has(n)) return memo.get(n)!;\n    \n    const result = this.fibonacciMemo(n - 1, memo) + this.fibonacciMemo(n - 2, memo);\n    memo.set(n, result);\n    return result;\n  }\n  \n  static fibonacciTab(n: number): number {\n    if (n <= 1) return n;\n    \n    const dp = [0, 1];\n    for (let i = 2; i <= n; i++) {\n      dp[i] = dp[i - 1] + dp[i - 2];\n    }\n    return dp[n];\n  }\n  \n  static longestCommonSubsequence(str1: string, str2: string): number {\n    const m = str1.length, n = str2.length;\n    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));\n    \n    for (let i = 1; i <= m; i++) {\n      for (let j = 1; j <= n; j++) {\n        if (str1[i - 1] === str2[j - 1]) {\n          dp[i][j] = dp[i - 1][j - 1] + 1;\n        } else {\n          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n      }\n    }\n    return dp[m][n];\n  }\n  \n  static knapsack(weights: number[], values: number[], capacity: number): number {\n    const n = weights.length;\n    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));\n    \n    for (let i = 1; i <= n; i++) {\n      for (let w = 1; w <= capacity; w++) {\n        if (weights[i - 1] <= w) {\n          dp[i][w] = Math.max(\n            dp[i - 1][w],\n            dp[i - 1][w - weights[i - 1]] + values[i - 1]\n          );\n        } else {\n          dp[i][w] = dp[i - 1][w];\n        }\n      }\n    }\n    return dp[n][capacity];\n  }\n  \n  static coinChange(coins: number[], amount: number): number {\n    const dp = Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    \n    for (let i = 1; i <= amount; i++) {\n      for (const coin of coins) {\n        if (coin <= i) {\n          dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n        }\n      }\n    }\n    \n    return dp[amount] === Infinity ? -1 : dp[amount];\n  }\n  \n  static longestIncreasingSubsequence(nums: number[]): number {\n    if (nums.length === 0) return 0;\n    \n    const dp = Array(nums.length).fill(1);\n    \n    for (let i = 1; i < nums.length; i++) {\n      for (let j = 0; j < i; j++) {\n        if (nums[j] < nums[i]) {\n          dp[i] = Math.max(dp[i], dp[j] + 1);\n        }\n      }\n    }\n    \n    return Math.max(...dp);\n  }\n  \n  static editDistance(str1: string, str2: string): number {\n    const m = str1.length, n = str2.length;\n    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));\n    \n    // Initialize base cases\n    for (let i = 0; i <= m; i++) dp[i][0] = i;\n    for (let j = 0; j <= n; j++) dp[0][j] = j;\n    \n    for (let i = 1; i <= m; i++) {\n      for (let j = 1; j <= n; j++) {\n        if (str1[i - 1] === str2[j - 1]) {\n          dp[i][j] = dp[i - 1][j - 1];\n        } else {\n          dp[i][j] = 1 + Math.min(\n            dp[i - 1][j],     // deletion\n            dp[i][j - 1],     // insertion\n            dp[i - 1][j - 1]  // substitution\n          );\n        }\n      }\n    }\n    \n    return dp[m][n];\n  }\n  \n  static maxSubarraySum(nums: number[]): number {\n    let maxSoFar = nums[0];\n    let maxEndingHere = nums[0];\n    \n    for (let i = 1; i < nums.length; i++) {\n      maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n      maxSoFar = Math.max(maxSoFar, maxEndingHere);\n    }\n    \n    return maxSoFar;\n  }\n  \n  static houseRobber(nums: number[]): number {\n    if (nums.length === 0) return 0;\n    if (nums.length === 1) return nums[0];\n    \n    let prev2 = nums[0];\n    let prev1 = Math.max(nums[0], nums[1]);\n    \n    for (let i = 2; i < nums.length; i++) {\n      const current = Math.max(prev1, prev2 + nums[i]);\n      prev2 = prev1;\n      prev1 = current;\n    }\n    \n    return prev1;\n  }\n  \n  static climbingStairs(n: number): number {\n    if (n <= 2) return n;\n    \n    let prev2 = 1;\n    let prev1 = 2;\n    \n    for (let i = 3; i <= n; i++) {\n      const current = prev1 + prev2;\n      prev2 = prev1;\n      prev1 = current;\n    }\n    \n    return prev1;\n  }\n}",
        testCode: "expect(DynamicProgramming.fibonacciMemo(10)).toBe(55);\nexpect(DynamicProgramming.longestCommonSubsequence('ABCDGH', 'AEDFHR')).toBe(3);\nexpect(DynamicProgramming.coinChange([1, 3, 4], 6)).toBe(2);",
        secretTestCode: "expect(DynamicProgramming.knapsack([10, 20, 30], [60, 100, 120], 50)).toBe(220);\nexpect(DynamicProgramming.maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6);",
        testcases: [{ input: "fibonacci(10)", output: "55" }],
        secretTestCases: [{ input: "knapsack([10,20,30], [60,100,120], 50)", output: "220" }],
        languageIds: [6, 1, 4, 2, 7, 8, 9]
      }
    ],
  });

  await client.assignments.create(420, {
    number: 10,
    name: "Advanced Data Structures",
    publish: parseDateTime('2025-06-20T09:00'),
    due: parseDateTime('2025-08-10T23:59'),
    examPin: "555555",
    showScoreOnLock: true, testCode: "advanced data structures test",
    secretTestCode: "advanced data structures secret",
    examMode: false,
    closeOnDue: true,
    assignedGroupIds: ["Default"],
    questions: [
      {
        number: 1,
        name: "Trie (Prefix Tree) Implementation",
        description: "Implement a Trie data structure for efficient string operations",
        template: "// Trie Node\nclass TrieNode {\n  children: Map<string, TrieNode> = new Map();\n  isEndOfWord: boolean = false;\n  wordCount: number = 0; // For counting word frequencies\n  \n  constructor() {}\n}\n\n// Trie implementation\nclass Trie {\n  private root: TrieNode;\n  \n  constructor() {\n    this.root = new TrieNode();\n  }\n  \n  // Insert a word\n  insert(word: string): void {\n    // Your implementation here\n  }\n  \n  // Search for a word\n  search(word: string): boolean {\n    // Your implementation here\n  }\n  \n  // Check if any word starts with prefix\n  startsWith(prefix: string): boolean {\n    // Your implementation here\n  }\n  \n  // Delete a word\n  delete(word: string): boolean {\n    // Your implementation here\n  }\n  \n  // Get all words with given prefix\n  getWordsWithPrefix(prefix: string): string[] {\n    // Your implementation here\n  }\n  \n  // Get word frequency\n  getWordCount(word: string): number {\n    // Your implementation here\n  }\n  \n  // Get all words in the trie\n  getAllWords(): string[] {\n    // Your implementation here\n  }\n}",
        maxScore: 100,
        answer: "class TrieNode {\n  children: Map<string, TrieNode> = new Map();\n  isEndOfWord: boolean = false;\n  wordCount: number = 0;\n  \n  constructor() {}\n}\n\nclass Trie {\n  private root: TrieNode;\n  \n  constructor() {\n    this.root = new TrieNode();\n  }\n  \n  insert(word: string): void {\n    let current = this.root;\n    \n    for (const char of word) {\n      if (!current.children.has(char)) {\n        current.children.set(char, new TrieNode());\n      }\n      current = current.children.get(char)!;\n    }\n    \n    current.isEndOfWord = true;\n    current.wordCount++;\n  }\n  \n  search(word: string): boolean {\n    const node = this.findNode(word);\n    return node !== null && node.isEndOfWord;\n  }\n  \n  startsWith(prefix: string): boolean {\n    return this.findNode(prefix) !== null;\n  }\n  \n  private findNode(word: string): TrieNode | null {\n    let current = this.root;\n    \n    for (const char of word) {\n      if (!current.children.has(char)) {\n        return null;\n      }\n      current = current.children.get(char)!;\n    }\n    \n    return current;\n  }\n  \n  delete(word: string): boolean {\n    return this.deleteHelper(this.root, word, 0);\n  }\n  \n  private deleteHelper(node: TrieNode, word: string, index: number): boolean {\n    if (index === word.length) {\n      if (!node.isEndOfWord) return false;\n      \n      node.isEndOfWord = false;\n      node.wordCount = 0;\n      \n      // Return true if node has no children (can be deleted)\n      return node.children.size === 0;\n    }\n    \n    const char = word[index];\n    const childNode = node.children.get(char);\n    \n    if (!childNode) return false;\n    \n    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);\n    \n    if (shouldDeleteChild) {\n      node.children.delete(char);\n      \n      // Return true if current node has no children and is not end of another word\n      return node.children.size === 0 && !node.isEndOfWord;\n    }\n    \n    return false;\n  }\n  \n  getWordsWithPrefix(prefix: string): string[] {\n    const prefixNode = this.findNode(prefix);\n    if (!prefixNode) return [];\n    \n    const words: string[] = [];\n    this.collectWords(prefixNode, prefix, words);\n    return words;\n  }\n  \n  private collectWords(node: TrieNode, currentWord: string, words: string[]): void {\n    if (node.isEndOfWord) {\n      words.push(currentWord);\n    }\n    \n    for (const [char, childNode] of node.children) {\n      this.collectWords(childNode, currentWord + char, words);\n    }\n  }\n  \n  getWordCount(word: string): number {\n    const node = this.findNode(word);\n    return node && node.isEndOfWord ? node.wordCount : 0;\n  }\n  \n  getAllWords(): string[] {\n    const words: string[] = [];\n    this.collectWords(this.root, '', words);\n    return words;\n  }\n}",
        testCode: "const trie = new Trie();\ntrie.insert('apple');\ntrie.insert('app');\nexpect(trie.search('app')).toBe(true);\nexpect(trie.startsWith('ap')).toBe(true);\nexpect(trie.getWordsWithPrefix('ap')).toContain('apple');",
        secretTestCode: "trie.delete('app');\nexpect(trie.search('app')).toBe(false);\nexpect(trie.search('apple')).toBe(true);\nexpect(trie.getAllWords()).toEqual(['apple']);",
        testcases: [{ input: "insert('apple'), search('app')", output: "true" }],
        secretTestCases: [{ input: "getWordsWithPrefix('ap')", output: "['app', 'apple']" }],
        languageIds: [6, 1, 4, 2, 7, 8, 9]
      },
      {
        number: 2,
        name: "Disjoint Set (Union-Find) Implementation",
        description: "Implement Union-Find data structure with path compression and union by rank",
        template: "// Disjoint Set (Union-Find) implementation\nclass DisjointSet<T> {\n  private parent: Map<T, T> = new Map();\n  private rank: Map<T, number> = new Map();\n  private componentSize: Map<T, number> = new Map();\n  \n  // Make a new set containing only the given element\n  makeSet(element: T): void {\n    // Your implementation here\n  }\n  \n  // Find the representative of the set containing element\n  find(element: T): T | null {\n    // Your implementation here - implement path compression\n  }\n  \n  // Union two sets containing the given elements\n  union(element1: T, element2: T): boolean {\n    // Your implementation here - implement union by rank\n  }\n  \n  // Check if two elements are in the same set\n  connected(element1: T, element2: T): boolean {\n    // Your implementation here\n  }\n  \n  // Get the size of the component containing the element\n  getComponentSize(element: T): number {\n    // Your implementation here\n  }\n  \n  // Get the number of disjoint components\n  getNumberOfComponents(): number {\n    // Your implementation here\n  }\n  \n  // Get all elements in the same component as the given element\n  getComponent(element: T): T[] {\n    // Your implementation here\n  }\n}",
        maxScore: 90,
        answer: "class DisjointSet<T> {\n  private parent: Map<T, T> = new Map();\n  private rank: Map<T, number> = new Map();\n  private componentSize: Map<T, number> = new Map();\n  \n  makeSet(element: T): void {\n    if (!this.parent.has(element)) {\n      this.parent.set(element, element);\n      this.rank.set(element, 0);\n      this.componentSize.set(element, 1);\n    }\n  }\n  \n  find(element: T): T | null {\n    if (!this.parent.has(element)) return null;\n    \n    // Path compression\n    if (this.parent.get(element) !== element) {\n      const root = this.find(this.parent.get(element)!);\n      if (root !== null) {\n        this.parent.set(element, root);\n      }\n    }\n    \n    return this.parent.get(element)!;\n  }\n  \n  union(element1: T, element2: T): boolean {\n    this.makeSet(element1);\n    this.makeSet(element2);\n    \n    const root1 = this.find(element1);\n    const root2 = this.find(element2);\n    \n    if (root1 === null || root2 === null || root1 === root2) {\n      return false; // Already in same set or invalid elements\n    }\n    \n    const rank1 = this.rank.get(root1)!;\n    const rank2 = this.rank.get(root2)!;\n    const size1 = this.componentSize.get(root1)!;\n    const size2 = this.componentSize.get(root2)!;\n    \n    // Union by rank\n    if (rank1 < rank2) {\n      this.parent.set(root1, root2);\n      this.componentSize.set(root2, size1 + size2);\n    } else if (rank1 > rank2) {\n      this.parent.set(root2, root1);\n      this.componentSize.set(root1, size1 + size2);\n    } else {\n      this.parent.set(root2, root1);\n      this.rank.set(root1, rank1 + 1);\n      this.componentSize.set(root1, size1 + size2);\n    }\n    \n    return true;\n  }\n  \n  connected(element1: T, element2: T): boolean {\n    const root1 = this.find(element1);\n    const root2 = this.find(element2);\n    return root1 !== null && root2 !== null && root1 === root2;\n  }\n  \n  getComponentSize(element: T): number {\n    const root = this.find(element);\n    return root ? this.componentSize.get(root) || 0 : 0;\n  }\n  \n  getNumberOfComponents(): number {\n    const roots = new Set<T>();\n    for (const element of this.parent.keys()) {\n      const root = this.find(element);\n      if (root) roots.add(root);\n    }\n    return roots.size;\n  }\n  \n  getComponent(element: T): T[] {\n    const targetRoot = this.find(element);\n    if (!targetRoot) return [];\n    \n    const component: T[] = [];\n    for (const elem of this.parent.keys()) {\n      if (this.find(elem) === targetRoot) {\n        component.push(elem);\n      }\n    }\n    return component;\n  }\n}",
        testCode: "const ds = new DisjointSet<number>();\nds.makeSet(1);\nds.makeSet(2);\nds.makeSet(3);\nexpect(ds.connected(1, 2)).toBe(false);\nds.union(1, 2);\nexpect(ds.connected(1, 2)).toBe(true);",
        secretTestCode: "expect(ds.getComponentSize(1)).toBe(2);\nexpect(ds.getNumberOfComponents()).toBe(2);\nexpect(ds.getComponent(1)).toContain(2);", testcases: [{ input: "union(1,2), connected(1,2)", output: "true" }],
        secretTestCases: [{ input: "getComponentSize(1)", output: "2" }],
        languageIds: [6, 1, 4, 2, 7, 8, 9]
      }
    ]
  });
}
