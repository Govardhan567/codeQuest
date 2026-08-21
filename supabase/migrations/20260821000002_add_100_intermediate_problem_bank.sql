-- Add a 100-problem intermediate practice bank (positions 26 through 125).
insert into public.topics (
  language_id, slug, position, title, description, explanation, example_code,
  starter_code, task_title, task_description, expected_output, task_input
)
select
  'python',
  case series_index % 5
    when 0 then 'problem-bank-sum-' || (series_index + 1)
    when 1 then 'problem-bank-square-' || (series_index + 1)
    when 2 then 'problem-bank-cube-' || (series_index + 1)
    when 3 then 'problem-bank-multiples-' || (series_index + 1)
    else 'problem-bank-reverse-' || (series_index + 1)
  end,
  series_index + 26,
  case series_index % 5
    when 0 then 'Problem ' || (series_index + 1) || ': Running Sum'
    when 1 then 'Problem ' || (series_index + 1) || ': Square a Value'
    when 2 then 'Problem ' || (series_index + 1) || ': Cube a Value'
    when 3 then 'Problem ' || (series_index + 1) || ': Count Multiples'
    else 'Problem ' || (series_index + 1) || ': Reverse a Word'
  end,
  case series_index % 5
    when 0 then 'Accumulate a sequence with a loop.'
    when 1 then 'Transform a value with an arithmetic operation.'
    when 2 then 'Apply repeated multiplication.'
    when 3 then 'Use a condition inside a loop.'
    else 'Use slicing to transform a string.'
  end,
  'Intermediate problem-solving practice.',
  '', '',
  case series_index % 5
    when 0 then 'Sum a range with a loop.'
    when 1 then 'Square a value.'
    when 2 then 'Cube a value.'
    when 3 then 'Count multiples of 3.'
    else 'Reverse a word.'
  end,
  case series_index % 5
    when 0 then ((series_index + 6) * (series_index + 7) / 2)::text
    when 1 then ((series_index + 6) * (series_index + 6))::text
    when 2 then ((series_index + 6) * (series_index + 6) * (series_index + 6))::text
    when 3 then floor((series_index + 6) / 3.0)::text
    else (array['nohtyp', 'mhtirogla', 'ecitcarp', 'egnellahc', 'noitcnuf'])[floor(series_index / 5.0)::int % 5 + 1]::text
  end,
  null
from generate_series(0, 99) as series_index
on conflict (language_id, position) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  explanation = excluded.explanation, example_code = excluded.example_code,
  starter_code = excluded.starter_code, task_title = excluded.task_title,
  task_description = excluded.task_description, expected_output = excluded.expected_output,
  task_input = excluded.task_input, updated_at = now();
