#!/bin/bash
curl -X POST -H "Authorization: key=AAAAO1AP0Zc:APA91bEk4Lze9KFw473RrMwt5bFqVdJruRfSXwtVQOr-pbsnJ9dNZiiOMgvGDHc-YKRyrZIUFlqYrk0R8hTU5XHlJmCf9vsXfF0Dhs3Ojk7U05-l9rvn7YaqzvGBklGwBfL2Vz0DPz8j" \
   -H "Content-Type: application/json" \
   -d '{
  "data": {
    "notification": {
        "title": "FCM Message",
        "body": "This is an FCM Message",
        "icon": "/android-chrome-192x192.png",
    }
  },
  "to": "dB2jl2b8HQo:APA91bGX4TfXhkE5lh_DTrhsqjFRUVyKANJ6mK40BEr6pdTicWTzqIm_dzSWSkAH-xCFRmYg3ev0CX6xNjZTrO_l1V0AcrJOGTG0Sv_KooMtIUg-FeZZIm-WV0hF1fGNquQV0fhv6ELD"
}' https://fcm.googleapis.com/fcm/send