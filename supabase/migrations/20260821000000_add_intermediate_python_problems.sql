-- Extend the Python roadmap with intermediate problem-solving lessons.
insert into public.topics (
  language_id, slug, position, title, description, explanation, example_code,
  starter_code, task_title, task_description, expected_output, task_input
)
values
  ('python', 'sum-even-numbers', 11, 'Intermediate: Sum Even Numbers', 'Filter a list, then combine the values you need.',
   'Many programming problems become easier when you split them into small steps: inspect each value, decide whether it belongs, then update a running result.\n\nUse the modulo operator (%). A number is even when number % 2 equals 0. Keep a total and add only the even values.',
   E'numbers = [3, 8, 2, 7, 4]\ntotal = 0\n\nfor number in numbers:\n    if number % 2 == 0:\n        total += number\n\nprint(total)', '', 'Add the even numbers', 'Given numbers = [3, 8, 2, 7, 4], use a loop and condition to print the sum of only the even numbers.', '14', null),
  ('python', 'palindrome-check', 12, 'Intermediate: Palindrome Check', 'Compare text from both directions.',
   'A palindrome reads the same forwards and backwards. Python can reverse a string with slicing: text[::-1].\n\nCompare the original word with its reversed version. The comparison produces True when they match and False when they do not.',
   E'word = "level"\nprint(word == word[::-1])', '', 'Spot the palindrome', 'Set word to "level" and print whether it is a palindrome by comparing it with its reverse.', 'True', null),
  ('python', 'letter-frequency', 13, 'Intermediate: Count Letter Frequency', 'Use a dictionary to count repeated values.',
   'Frequency counting records how often each value appears. A dictionary is a natural fit because each letter can be a key and its count can be the value.\n\nWhen you see a letter, read its current count with get(letter, 0), add one, then store the new total back in the dictionary.',
   E'word = "banana"\ncounts = {}\n\nfor letter in word:\n    counts[letter] = counts.get(letter, 0) + 1\n\nprint(counts["a"])', '', 'Count a letter', 'Count the occurrences of "a" in the word "banana" with a dictionary, then print the count.', '3', null),
  ('python', 'find-largest-number', 14, 'Intermediate: Find the Largest Number', 'Track the best answer while scanning a list.',
   'A running-best pattern saves the best value found so far. Start with the first value in the list, then compare each later value against it.\n\nWhen the current number is larger than your saved maximum, replace the maximum. At the end of the loop, it holds the largest number.',
   E'numbers = [12, 4, 29, 7, 18]\nlargest = numbers[0]\n\nfor number in numbers:\n    if number > largest:\n        largest = number\n\nprint(largest)', '', 'Find the highest score', 'Given scores = [72, 88, 95, 81, 90], use a loop to find and print the largest score. Do not use max().', '95', null),
  ('python', 'two-sum-search', 15, 'Intermediate: Two Sum', 'Find two values that reach a target together.',
   'Two Sum is a classic search problem. For each number, calculate the value it still needs to reach the target.\n\nA dictionary can remember numbers you have already visited. If the needed value is already stored, you have found the pair of indices.',
   E'numbers = [2, 7, 11, 15]\ntarget = 9\nseen = {}\n\nfor index, number in enumerate(numbers):\n    needed = target - number\n    if needed in seen:\n        print([seen[needed], index])\n        break\n    seen[number] = index', '', 'Find the target pair', 'For numbers = [2, 7, 11, 15] and target = 9, print a list containing the indices of the two values that add to the target.', '[0, 1]', null)
on conflict (language_id, position) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  explanation = excluded.explanation,
  example_code = excluded.example_code,
  starter_code = excluded.starter_code,
  task_title = excluded.task_title,
  task_description = excluded.task_description,
  expected_output = excluded.expected_output,
  task_input = excluded.task_input,
  updated_at = now();
