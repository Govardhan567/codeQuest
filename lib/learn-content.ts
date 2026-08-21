export type LearnLanguage = {
  id: string;
  name: string;
  icon: string;
  accent: string;
  active: boolean;
};

export type PythonTopic = {
  id: number;
  slug: string;
  position: number;
  title: string;
  description: string;
  explanation: string[];
  exampleCode: string;
  starterCode: string;
  taskTitle: string;
  taskDescription: string;
  expectedOutput: string;
  taskInput?: string;
};

export const learnLanguages: LearnLanguage[] = [
  { id: "java", name: "Java", icon: "J", accent: "#f09a63", active: false },
  { id: "python", name: "Python", icon: "Py", accent: "#f5c451", active: true },
  { id: "javascript", name: "JavaScript", icon: "JS", accent: "#f4d65c", active: false },
  { id: "sql", name: "SQL", icon: "SQL", accent: "#65b9ff", active: false },
  { id: "c", name: "C", icon: "C", accent: "#8aa2f6", active: false },
  { id: "cpp", name: "C++", icon: "C++", accent: "#a7a7ff", active: false },
];

const additionalIntermediateTopics: PythonTopic[] = Array.from({ length: 100 }, (_, index) => {
  const problemNumber = index + 1;
  const id = index + 26;
  const pattern = index % 5;
  const value = index + 6;

  if (pattern === 0) {
    const expected = (value * (value + 1)) / 2;
    return {
      id, slug: `problem-bank-sum-${problemNumber}`, position: id,
      title: `Problem ${problemNumber}: Running Sum`, description: "Accumulate a sequence with a loop.",
      explanation: ["A running sum starts at zero and adds one value per loop.", "This pattern appears in totals, scores, and range-based calculations."],
      exampleCode: `limit = ${value}\ntotal = 0\n\nfor number in range(1, limit + 1):\n    total += number\n\nprint(total)`,
      starterCode: "", taskTitle: `Sum from 1 to ${value}`, taskDescription: `Use a loop to print the sum of every number from 1 through ${value}.`, expectedOutput: String(expected),
    };
  }
  if (pattern === 1) {
    const expected = value * value;
    return {
      id, slug: `problem-bank-square-${problemNumber}`, position: id,
      title: `Problem ${problemNumber}: Square a Value`, description: "Transform a value with an arithmetic operation.",
      explanation: ["A square is a number multiplied by itself.", "Small transformation problems build the habit of storing a result and printing it clearly."],
      exampleCode: `number = ${value}\nresult = number * number\nprint(result)`,
      starterCode: "", taskTitle: `Square ${value}`, taskDescription: `Store ${value} in a variable and print its square.`, expectedOutput: String(expected),
    };
  }
  if (pattern === 2) {
    const expected = value * value * value;
    return {
      id, slug: `problem-bank-cube-${problemNumber}`, position: id,
      title: `Problem ${problemNumber}: Cube a Value`, description: "Apply repeated multiplication.",
      explanation: ["A cube multiplies a number by itself three times.", "The exponent operator ** is a concise way to express repeated multiplication."],
      exampleCode: `number = ${value}\nprint(number ** 3)`,
      starterCode: "", taskTitle: `Cube ${value}`, taskDescription: `Store ${value} in a variable and print its cube using **.`, expectedOutput: String(expected),
    };
  }
  if (pattern === 3) {
    const expected = Math.floor(value / 3);
    return {
      id, slug: `problem-bank-multiples-${problemNumber}`, position: id,
      title: `Problem ${problemNumber}: Count Multiples`, description: "Use a condition inside a loop.",
      explanation: ["The modulo operator checks whether a division leaves no remainder.", "Count only the values that satisfy your condition."],
      exampleCode: `limit = ${value}\ncount = 0\n\nfor number in range(1, limit + 1):\n    if number % 3 == 0:\n        count += 1\n\nprint(count)`,
      starterCode: "", taskTitle: `Count multiples of 3`, taskDescription: `From 1 through ${value}, count and print how many numbers are divisible by 3.`, expectedOutput: String(expected),
    };
  }
  const word = ["python", "algorithm", "practice", "challenge", "function"][Math.floor(index / 5) % 5];
  return {
    id, slug: `problem-bank-reverse-${problemNumber}`, position: id,
    title: `Problem ${problemNumber}: Reverse a Word`, description: "Use slicing to transform a string.",
    explanation: ["String slicing can move through text in reverse with [::-1].", "Reversal is a common building block for string and palindrome problems."],
    exampleCode: `word = "${word}"\nprint(word[::-1])`,
    starterCode: "", taskTitle: `Reverse ${word}`, taskDescription: `Store "${word}" in word and print the letters in reverse order.`, expectedOutput: word.split("").reverse().join(""),
  };
});

const functionSkillTopics: PythonTopic[] = Array.from({ length: 50 }, (_, index) => {
  const problemNumber = index + 1;
  const id = index + 126;
  const value = index + 10;

  if (index % 3 === 0) {
    return {
      id, slug: `function-triple-${problemNumber}`, position: id,
      title: `Functions Challenge ${problemNumber}: Triple a Value`, description: "Create and call a reusable function.",
      explanation: ["Functions package reusable instructions behind a meaningful name.", "Give the function a parameter, return its result, then call it with the supplied value."],
      exampleCode: `def triple(number):\n    return number * 3\n\nprint(triple(${value}))`,
      starterCode: "", taskTitle: `Write triple() for ${value}`, taskDescription: `Define triple(number) so it returns number multiplied by 3, then print triple(${value}).`, expectedOutput: String(value * 3),
    };
  }
  if (index % 3 === 1) {
    return {
      id, slug: `lambda-add-ten-${problemNumber}`, position: id,
      title: `Lambda Challenge ${problemNumber}: Add Ten`, description: "Use a lambda for a short transformation.",
      explanation: ["A lambda is a compact function written in one expression.", "Assign a lambda to a variable when you want to call that small transformation more than once."],
      exampleCode: `add_ten = lambda number: number + 10\nprint(add_ten(${value}))`,
      starterCode: "", taskTitle: `Create add_ten`, taskDescription: `Create a lambda named add_ten that adds 10, then print add_ten(${value}).`, expectedOutput: String(value + 10),
    };
  }
  const number = (index % 5) + 3;
  const factorial = [1, 1, 2, 6, 24, 120, 720, 5040][number];
  return {
    id, slug: `recursion-factorial-${problemNumber}`, position: id,
    title: `Recursion Challenge ${problemNumber}: Factorial`, description: "Solve a problem by reducing it to a smaller version.",
    explanation: ["A recursive function calls itself with a smaller input until it reaches a base case.", "For factorial, the base case is 1. Every other result is number multiplied by factorial(number - 1)."],
    exampleCode: `def factorial(number):\n    if number <= 1:\n        return 1\n    return number * factorial(number - 1)\n\nprint(factorial(${number}))`,
    starterCode: "", taskTitle: `Find ${number}!`, taskDescription: `Write a recursive factorial(number) function and print factorial(${number}).`, expectedOutput: String(factorial),
  };
});

export const pythonTopics: PythonTopic[] = [
  {
    id: 1,
    slug: "print-statements",
    position: 1,
    title: "Introduction to Python & Print Statements",
    description: "Write your first line of Python and see it run.",
    explanation: [
      "Python is a language for giving clear instructions to a computer. You write those instructions as code, then run the code to see the result.",
      "The print() function tells Python to show something in the output area. Text needs quotation marks so Python knows it is a message, not the name of something else.",
    ],
    exampleCode: 'print("Hello, world!")\nprint("I am learning Python.")',
    starterCode: 'print("Hello, CodeQuest!")',
    taskTitle: "Send a greeting",
    taskDescription: 'Use print() to display exactly: Hello, CodeQuest!',
    expectedOutput: "Hello, CodeQuest!",
  },
  {
    id: 2,
    slug: "variables-data-types",
    position: 2,
    title: "Variables & Data Types",
    description: "Store information in named containers.",
    explanation: [
      "A variable is a name that points to a value. Think of it like a labeled box: you can put a value in the box and use that label later.",
      "Python has different types of values. Strings are text in quotation marks, integers are whole numbers, and booleans are true or false values.",
    ],
    exampleCode: 'name = "Ada"\nage = 21\nprint(name)\nprint(age)',
    starterCode: 'age = 21\nprint(f"Age: {age}")',
    taskTitle: "Name an age",
    taskDescription: "Create a variable named age with the integer 21, then print exactly: Age: 21",
    expectedOutput: "Age: 21",
  },
  {
    id: 3,
    slug: "basic-operators",
    position: 3,
    title: "Basic Operators",
    description: "Combine, compare, and test values.",
    explanation: [
      "Operators are symbols that do work with values. Arithmetic operators such as + and * calculate new numbers, while comparison operators such as == check whether two values match.",
      "Logical operators, including and and or, let you combine true-or-false checks into more useful questions.",
    ],
    exampleCode: 'total = 7 * 6\nprint(total)\nprint(total == 42)',
    starterCode: 'answer = 7 * 6\nprint(answer)',
    taskTitle: "Make forty-two",
    taskDescription: "Use multiplication to calculate 7 times 6 and print the result.",
    expectedOutput: "42",
  },
  {
    id: 4,
    slug: "strings-formatting",
    position: 4,
    title: "Strings & String Formatting",
    description: "Build clear messages from text and values.",
    explanation: [
      "A string is a piece of text. You can join strings with +, but f-strings are usually easier to read when you want to include a variable inside a message.",
      "Start an f-string with the letter f before the opening quote. Put a variable name inside curly braces and Python replaces it with that variable's value.",
    ],
    exampleCode: 'name = "Mina"\nmessage = f"Hello, {name}!"\nprint(message)',
    starterCode: 'name = "Ada"\nprint(f"Hello, {name}!")',
    taskTitle: "Personalize a hello",
    taskDescription: 'Store "Ada" in name and use an f-string to print exactly: Hello, Ada!',
    expectedOutput: "Hello, Ada!",
  },
  {
    id: 5,
    slug: "conditionals",
    position: 5,
    title: "Conditionals",
    description: "Choose what happens with if, elif, and else.",
    explanation: [
      "Conditionals let a program make a choice. An if statement runs its indented block only when its condition is true.",
      "Use elif for another condition and else for the remaining case. Indentation matters in Python because it marks which lines belong to each choice.",
    ],
    exampleCode: 'temperature = 28\nif temperature > 25:\n    print("Warm")\nelse:\n    print("Cool")',
    starterCode: 'temperature = 28\n\nif temperature > 25:\n    print("Warm")\nelse:\n    print("Cool")',
    taskTitle: "Choose the weather message",
    taskDescription: "Set temperature to 28. Print Warm when it is greater than 25; otherwise print Cool.",
    expectedOutput: "Warm",
  },
  {
    id: 6,
    slug: "loops",
    position: 6,
    title: "Loops",
    description: "Repeat useful work with for and while.",
    explanation: [
      "A loop repeats a block of code. A for loop is handy when you know which values you want to visit, while a while loop repeats as long as a condition remains true.",
      "range(1, 4) gives the numbers 1, 2, and 3. The final number is not included, which is a common detail to remember.",
    ],
    exampleCode: 'for number in range(1, 4):\n    print(number)',
    starterCode: 'for number in range(1, 4):\n    print(number)',
    taskTitle: "Count to three",
    taskDescription: "Use a for loop and range() to print 1, 2, and 3, each on its own line.",
    expectedOutput: "1\n2\n3",
  },
  {
    id: 7,
    slug: "lists",
    position: 7,
    title: "Lists",
    description: "Keep a sequence of related values together.",
    explanation: [
      "A list stores values in a specific order. Put the values inside square brackets and separate them with commas.",
      "len() tells you how many items a list contains. List positions start at 0, so the first item is at index 0.",
    ],
    exampleCode: 'fruits = ["apple", "mango", "pear"]\nprint(len(fruits))\nprint(fruits[0])',
    starterCode: 'fruits = ["apple", "mango", "pear"]\nprint(len(fruits))',
    taskTitle: "Count the fruit",
    taskDescription: 'Create a list named fruits with "apple", "mango", and "pear", then print how many items it has.',
    expectedOutput: "3",
  },
  {
    id: 8,
    slug: "dictionaries",
    position: 8,
    title: "Dictionaries",
    description: "Look up values by a meaningful key.",
    explanation: [
      "A dictionary connects a key to a value. It is useful when a label, such as name or score, makes more sense than a numbered position.",
      "Use curly braces to create a dictionary and square brackets with a key to look up its value.",
    ],
    exampleCode: 'student = {"name": "Ada", "score": 95}\nprint(student["name"])',
    starterCode: 'student = {"name": "Ada", "score": 95}\nprint(student["name"])',
    taskTitle: "Read a profile",
    taskDescription: 'Create a student dictionary with name set to "Ada" and score set to 95, then print the name.',
    expectedOutput: "Ada",
  },
  {
    id: 9,
    slug: "functions",
    position: 9,
    title: "Functions",
    description: "Give repeatable work a useful name.",
    explanation: [
      "A function is a reusable set of instructions. Define one with def, give it a clear name, and place its body on indented lines.",
      "Parameters let a function receive information. return sends a result back to the place where the function was called.",
    ],
    exampleCode: 'def double(number):\n    return number * 2\n\nprint(double(6))',
    starterCode: 'def double(number):\n    return number * 2\n\nprint(double(6))',
    taskTitle: "Double a number",
    taskDescription: "Define double(number) so it returns the number multiplied by 2, then print double(6).",
    expectedOutput: "12",
  },
  {
    id: 10,
    slug: "basic-input-output",
    position: 10,
    title: "Basic Input/Output",
    description: "Receive text from a person and show a useful response.",
    explanation: [
      "A program accepts input, processes it, and produces output.",
      "input() pauses a program and waits for a person to type something. The value that comes back is text, even when it looks like a number.",
      "For this check, CodeQuest supplies the sample input Ada. Your program should use it to make a formatted welcome message.",
    ],
    exampleCode: 'name = input("What is your name? ")\nprint(f"Welcome, {name}!")',
    starterCode: 'name = input("Name: ")\nprint(f"Welcome, {name}!")',
    taskTitle: "Welcome a learner",
    taskDescription: 'Read a name with input("Name: ") and print a welcome with an f-string. The checker supplies Ada as input.',
    expectedOutput: "Name: Welcome, Ada!",
    taskInput: "Ada\n",
  },
  {
    id: 11,
    slug: "sum-even-numbers",
    position: 11,
    title: "Intermediate: Sum Even Numbers",
    description: "Filter a list, then combine the values you need.",
    explanation: [
      "Many programming problems become easier when you split them into small steps: inspect each value, decide whether it belongs, then update a running result.",
      "Use the modulo operator (%). A number is even when number % 2 equals 0. Keep a total and add only the even values.",
    ],
    exampleCode: 'numbers = [3, 8, 2, 7, 4]\ntotal = 0\n\nfor number in numbers:\n    if number % 2 == 0:\n        total += number\n\nprint(total)',
    starterCode: "",
    taskTitle: "Add the even numbers",
    taskDescription: "Given numbers = [3, 8, 2, 7, 4], use a loop and condition to print the sum of only the even numbers.",
    expectedOutput: "14",
  },
  {
    id: 12,
    slug: "palindrome-check",
    position: 12,
    title: "Intermediate: Palindrome Check",
    description: "Compare text from both directions.",
    explanation: [
      "A palindrome reads the same forwards and backwards. Python can reverse a string with slicing: text[::-1].",
      "Compare the original word with its reversed version. The comparison produces True when they match and False when they do not.",
    ],
    exampleCode: 'word = "level"\nprint(word == word[::-1])',
    starterCode: "",
    taskTitle: "Spot the palindrome",
    taskDescription: 'Set word to "level" and print whether it is a palindrome by comparing it with its reverse.',
    expectedOutput: "True",
  },
  {
    id: 13,
    slug: "letter-frequency",
    position: 13,
    title: "Intermediate: Count Letter Frequency",
    description: "Use a dictionary to count repeated values.",
    explanation: [
      "Frequency counting records how often each value appears. A dictionary is a natural fit because each letter can be a key and its count can be the value.",
      "When you see a letter, read its current count with get(letter, 0), add one, then store the new total back in the dictionary.",
    ],
    exampleCode: 'word = "banana"\ncounts = {}\n\nfor letter in word:\n    counts[letter] = counts.get(letter, 0) + 1\n\nprint(counts["a"])',
    starterCode: "",
    taskTitle: "Count a letter",
    taskDescription: 'Count the occurrences of "a" in the word "banana" with a dictionary, then print the count.',
    expectedOutput: "3",
  },
  {
    id: 14,
    slug: "find-largest-number",
    position: 14,
    title: "Intermediate: Find the Largest Number",
    description: "Track the best answer while scanning a list.",
    explanation: [
      "A running-best pattern saves the best value found so far. Start with the first value in the list, then compare each later value against it.",
      "When the current number is larger than your saved maximum, replace the maximum. At the end of the loop, it holds the largest number.",
    ],
    exampleCode: 'numbers = [12, 4, 29, 7, 18]\nlargest = numbers[0]\n\nfor number in numbers:\n    if number > largest:\n        largest = number\n\nprint(largest)',
    starterCode: "",
    taskTitle: "Find the highest score",
    taskDescription: "Given scores = [72, 88, 95, 81, 90], use a loop to find and print the largest score. Do not use max().",
    expectedOutput: "95",
  },
  {
    id: 15,
    slug: "two-sum-search",
    position: 15,
    title: "Intermediate: Two Sum",
    description: "Find two values that reach a target together.",
    explanation: [
      "Two Sum is a classic search problem. For each number, calculate the value it still needs to reach the target.",
      "A dictionary can remember numbers you have already visited. If the needed value is already stored, you have found the pair of indices.",
    ],
    exampleCode: 'numbers = [2, 7, 11, 15]\ntarget = 9\nseen = {}\n\nfor index, number in enumerate(numbers):\n    needed = target - number\n    if needed in seen:\n        print([seen[needed], index])\n        break\n    seen[number] = index',
    starterCode: "",
    taskTitle: "Find the target pair",
    taskDescription: "For numbers = [2, 7, 11, 15] and target = 9, print a list containing the indices of the two values that add to the target.",
    expectedOutput: "[0, 1]",
  },
  {
    id: 16, slug: "anagram-check", position: 16, title: "Intermediate: Anagram Check", description: "Decide whether two words use the same letters.",
    explanation: ["Anagrams contain exactly the same letters in a different order.", "Sort both strings and compare the results. Equal sorted strings are anagrams."],
    exampleCode: 'first = "listen"\nsecond = "silent"\nprint(sorted(first) == sorted(second))', starterCode: "", taskTitle: "Check two anagrams", taskDescription: 'Print whether "listen" and "silent" are anagrams.', expectedOutput: "True",
  },
  {
    id: 17, slug: "remove-duplicates", position: 17, title: "Intermediate: Remove Duplicates", description: "Keep unique values in their original order.",
    explanation: ["A set is useful for quickly checking whether you have already seen a value.", "Scan the list from left to right and append a value only the first time you find it."],
    exampleCode: 'numbers = [3, 1, 3, 2, 1]\nunique = []\nseen = set()\n\nfor number in numbers:\n    if number not in seen:\n        unique.append(number)\n        seen.add(number)\n\nprint(unique)', starterCode: "", taskTitle: "Keep unique values", taskDescription: "For numbers = [3, 1, 3, 2, 1], print a list of the unique values in their first-seen order.", expectedOutput: "[3, 1, 2]",
  },
  {
    id: 18, slug: "word-count", position: 18, title: "Intermediate: Word Count", description: "Split text into words and count them.",
    explanation: ["The split() method separates a sentence into a list of words wherever whitespace appears.", "Once you have the list, len() gives the number of words."],
    exampleCode: 'sentence = "code is fun and code is useful"\nwords = sentence.split()\nprint(len(words))', starterCode: "", taskTitle: "Count the words", taskDescription: 'For the sentence "code is fun and code is useful", split it into words and print the word count.', expectedOutput: "7",
  },
  {
    id: 19, slug: "fizzbuzz", position: 19, title: "Intermediate: FizzBuzz", description: "Apply multiple conditions in the right order.",
    explanation: ["Check the most specific condition first: numbers divisible by both 3 and 5 must print FizzBuzz.", "Then check divisibility by 3 and 5 separately; otherwise print the number."],
    exampleCode: 'for number in range(1, 6):\n    if number % 15 == 0:\n        print("FizzBuzz")\n    elif number % 3 == 0:\n        print("Fizz")\n    elif number % 5 == 0:\n        print("Buzz")\n    else:\n        print(number)', starterCode: "", taskTitle: "FizzBuzz to five", taskDescription: "Print numbers 1 through 5. Print Fizz for multiples of 3 and Buzz for multiples of 5.", expectedOutput: "1\n2\nFizz\n4\nBuzz",
  },
  {
    id: 20, slug: "prime-check", position: 20, title: "Intermediate: Prime Number Check", description: "Use a loop to test possible divisors.",
    explanation: ["A prime number has exactly two factors: 1 and itself.", "Try divisors from 2 up to one less than the number. If none divide evenly, the number is prime."],
    exampleCode: 'number = 29\nis_prime = number > 1\n\nfor divisor in range(2, number):\n    if number % divisor == 0:\n        is_prime = False\n        break\n\nprint(is_prime)', starterCode: "", taskTitle: "Check for a prime", taskDescription: "Set number to 29 and use a loop to print whether it is prime.", expectedOutput: "True",
  },
  {
    id: 21, slug: "fibonacci-sequence", position: 21, title: "Intermediate: Fibonacci Sequence", description: "Build each value from the previous two.",
    explanation: ["Fibonacci numbers begin with 0 and 1. Every next value is the sum of the two before it.", "Keep two variables for the most recent values and update both during each loop."],
    exampleCode: 'first, second = 0, 1\n\nfor _ in range(6):\n    first, second = second, first + second\n\nprint(first)', starterCode: "", taskTitle: "Find Fibonacci number seven", taskDescription: "Use a loop to print the seventh Fibonacci number when the sequence starts 0, 1, 1, 2, 3, 5, 8.", expectedOutput: "8",
  },
  {
    id: 22, slug: "second-largest", position: 22, title: "Intermediate: Second Largest", description: "Track more than one best value.",
    explanation: ["Some scans need both the largest and second-largest values seen so far.", "When a new maximum appears, move the old maximum into second place before saving the new one."],
    exampleCode: 'numbers = [10, 40, 25, 30]\nlargest = second = float("-inf")\n\nfor number in numbers:\n    if number > largest:\n        second = largest\n        largest = number\n    elif largest > number > second:\n        second = number\n\nprint(second)', starterCode: "", taskTitle: "Find second place", taskDescription: "For numbers = [10, 40, 25, 30], use a loop to print the second-largest number.", expectedOutput: "30",
  },
  {
    id: 23, slug: "matrix-total", position: 23, title: "Intermediate: Matrix Total", description: "Use nested loops to visit a grid.",
    explanation: ["A matrix is a list of rows, where each row is itself a list.", "Use one loop for rows and a second loop for values in each row."],
    exampleCode: 'matrix = [[1, 2], [3, 4]]\ntotal = 0\n\nfor row in matrix:\n    for value in row:\n        total += value\n\nprint(total)', starterCode: "", taskTitle: "Add a matrix", taskDescription: "For matrix = [[1, 2], [3, 4]], use nested loops to print the total of every value.", expectedOutput: "10",
  },
  {
    id: 24, slug: "caesar-shift", position: 24, title: "Intermediate: Caesar Shift", description: "Transform characters with their code points.",
    explanation: ["ord() turns a character into its numeric code and chr() turns a code back into a character.", "Adding 1 to each lowercase character shifts it one place forward in the alphabet."],
    exampleCode: 'word = "code"\nshifted = ""\n\nfor letter in word:\n    shifted += chr(ord(letter) + 1)\n\nprint(shifted)', starterCode: "", taskTitle: "Shift a word", taskDescription: 'Shift every letter in "code" forward by one position and print the new word.', expectedOutput: "dpef",
  },
  {
    id: 25, slug: "balanced-brackets", position: 25, title: "Intermediate: Balanced Brackets", description: "Use a stack to match opening and closing symbols.",
    explanation: ["A stack stores opening brackets until their matching closing bracket appears.", "Each closing bracket must match the most recently opened bracket; that is why a list with append() and pop() works well."],
    exampleCode: 'text = "{[()]}"\npairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nvalid = True\n\nfor character in text:\n    if character in "([{":\n        stack.append(character)\n    elif not stack or stack.pop() != pairs[character]:\n        valid = False\n        break\n\nprint(valid and not stack)', starterCode: "", taskTitle: "Validate brackets", taskDescription: 'Use a stack to print whether "{[()]}" has balanced brackets.', expectedOutput: "True",
  },
  ...additionalIntermediateTopics,
  ...functionSkillTopics,
];

export function getPythonTopic(id: number) {
  return pythonTopics.find((topic) => topic.id === id);
}
