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
  "to": "cchbLZKXZpg:APA91bHqV5vZLI9Hk-mTgSavcbupEAD5o8iXnssrxh1O5rjwnv0eF-bHAe2JmlZW5svZltdfczitHCCSFt20GQEgabTwzV406MKEPATLGy9oIJvVmcE02tkT1Xox_tG-JjqKohMYEoje"
}' https://fcm.googleapis.com/fcm/send