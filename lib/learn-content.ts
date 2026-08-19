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
];

export function getPythonTopic(id: number) {
  return pythonTopics.find((topic) => topic.id === id);
}
