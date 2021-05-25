# 2FA example with ExpressJS + TypeScript

This is a super simplified example on how to implement 2FA in your ExpressJS api.

Install deps:
```
yarn install
```

Boot app in dev mode:
```
yarn dev
```

Source cli scripts for convenience:
```
source requests.sh
```

Try to make a new user (with capra email),
and crazy password:
```
create-user john@capraconsulting.no abc123
```

scan the qr code that just appeared in your terminal with your
authenticator (... only Google Authenticator was tested during development)

Now, try to login to get a jwt-token
```
authenticate john@capraconsulting.no abc123 <the numeric code from authenticator>
```

Try to access a protected resource:
```
get-hello $token
```
