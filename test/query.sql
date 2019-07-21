select
  first_name,
  last_name
from my_table
where first_name = :'foo' and last_name = :'bar';