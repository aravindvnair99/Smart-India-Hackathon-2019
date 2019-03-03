curl -X POST -H "Authorization: key=<Server Key>" \
   -H "Content-Type: application/json" \
   -d '{
  "data": {
    "notification": {
        "title": "FCM Message",
        "body": "This is an FCM Message",
        "icon": "/itwonders-web-logo.png",
    }
  },
  "to": "_2lSEQl9T8:APA91bFa4hG35SrbPpPbnr6nEUKWODtKn5kENHgqU8uDPG0Ys2O2GGOE8QWTXV6z8rl6__jMfyoGjeda6zbXYLXxVuykIZi-8TLEu5BaeCsuw9zy_meO0sck56BkAnT4iLMrvtwp-KhJ"
}' https://fcm.googleapis.com/fcm/send