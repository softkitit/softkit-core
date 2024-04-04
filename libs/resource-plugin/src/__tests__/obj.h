obj() {
    sed "s/obj/$1/g" "$(dirname "$(realpath "$0")")/obj.class" > "/tmp/$1.class"
    . "/tmp/$1.class"
    rm "/tmp/$1.class"
}
