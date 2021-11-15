select
  first_name,
  --some comment here
  last_name
from my_table -- foo and bar
-- some comment right here
--
where first_name = :'firstName' and last_name = :'lastName';
