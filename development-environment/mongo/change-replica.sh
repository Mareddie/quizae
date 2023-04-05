myhost="quizae-mongodb:27017"
rsConfig=$(mongosh --username "root" --password "root" --authenticationDatabase "admin" --eval "rs.config()" --quiet)

mongosh --username "root" --password "root" --authenticationDatabase "admin" --quiet <<EOF
const conf = $rsConfig
conf.members[0].host="$myhost"
rs.reconfig(conf,{force:true})
EOF

# For manual host update via mongosh:
# const config = rs.config(); config.members[0].host = "quizae-mongodb"; rs.reconfig(config, {force: true});
