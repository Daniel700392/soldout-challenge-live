$body = @{
  eventId = "11111111-1111-1111-1111-111111111111"
  userId = "22222222-2222-2222-2222-222222222222"
  quantity = 1
  requestId = "93939393-9393-9393-9393-939393939393"
  amount = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3004/bookings -Method POST -ContentType "application/json" -Body $body
