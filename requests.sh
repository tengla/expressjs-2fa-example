
function create-user () {
  curl -H 'Content-Type: application/json' \
    -d '{"username": "'$1'", "password":"'$2'"}' \
    localhost:3000/create-user
}

function authenticate () {
  token=$(curl -s -H 'Content-Type: application/json' \
    -d '{"username": "'$1'","password":"'$2'","code":"'$3'"}' \
    localhost:3000/authenticate)
  echo $token
}

function verify-code () {
  curl -s -H 'Content-Type: application/json' \
    -d '{"username": "'$1'", "code":"'$2'"}' \
    localhost:3000/verify-code
}

function get-hello () {
  curl -s -H 'Authorization: Bearer '$1 localhost:3000/hello
}
