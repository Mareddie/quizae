myhost="mongodb:27017"
rsConfig=$(mongosh --username "root" --password "root" --authenticationDatabase "admin" --eval "rs.config()" --quiet)

mongosh --username "root" --password "root" --authenticationDatabase "admin" --quiet <<EOF
const conf = $rsConfig
conf.members[0].host="$myhost"
rs.reconfig(conf,{force:true})
EOF
