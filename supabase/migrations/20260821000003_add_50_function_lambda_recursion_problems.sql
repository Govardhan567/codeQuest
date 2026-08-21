-- Add 50 intermediate lessons covering functions, lambdas, and recursion.
insert into public.topics (
  language_id, slug, position, title, description, explanation, example_code,
  starter_code, task_title, task_description, expected_output, task_input
)
select
  'python',
  case series_index % 3
    when 0 then 'function-triple-' || (series_index + 1)
    when 1 then 'lambda-add-ten-' || (series_index + 1)
    else 'recursion-factorial-' || (series_index + 1)
  end,
  series_index + 126,
  case series_index % 3
    when 0 then 'Functions Challenge ' || (series_index + 1) || ': Triple a Value'
    when 1 then 'Lambda Challenge ' || (series_index + 1) || ': Add Ten'
    else 'Recursion Challenge ' || (series_index + 1) || ': Factorial'
  end,
  case series_index % 3
    when 0 then 'Create and call a reusable function.'
    when 1 then 'Use a lambda for a short transformation.'
    else 'Solve a problem by reducing it to a smaller version.'
  end,
  case series_index % 3
    when 0 then 'Functions package reusable instructions behind a meaningful name.'
    when 1 then 'A lambda is a compact function written in one expression.'
    else 'A recursive function calls itself with a smaller input until it reaches a base case.'
  end,
  '', '',
  case series_index % 3
    when 0 then 'Define and call triple().'
    when 1 then 'Create and call add_ten.'
    else 'Write and call a recursive factorial function.'
  end,
  case series_index % 3
    when 0 then ((series_index + 10) * 3)::text
    when 1 then ((series_index + 10) + 10)::text
    else case (series_index % 5) + 3
      when 3 then '6' when 4 then '24' when 5 then '120' when 6 then '720' else '5040'
    end
  end,
  null
from generate_series(0, 49) as series_index
on conflict (language_id, position) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  explanation = excluded.explanation, example_code = excluded.example_code,
  starter_code = excluded.starter_code, task_title = excluded.task_title,
  task_description = excluded.task_description, expected_output = excluded.expected_output,
  task_input = excluded.task_input, updated_at = now();
