select account_id
from chart_of_accounts

where account_name ~ (
  select '*.'
    || co.owner_account_name
    || '.*'
  from company_owner as co where co.company_owner_id = :companyOwnerId
)::lquery;