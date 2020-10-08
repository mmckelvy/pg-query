select
  first_name,
  last_name
from my_table
where first_name = :firstName
  and (:lastName is null or last_name = :lastName);
