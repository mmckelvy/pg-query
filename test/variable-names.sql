select
  message,
  message_timestamp
from my_table
where message = :message and message_timestamp = :messageTimestamp;
