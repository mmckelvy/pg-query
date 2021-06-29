select
  first_name,
  to_char(start_time, 'HH24:MI') as start
from schedule
where first_name = :firstName;

