


const fs = require('fs')



let db = JSON.parse(fs.readFileSync('./db.json').toString())

let ext_view = {}
for ( let [ky,obj] of Object.entries(db) ) {
    if ( obj === undefined ) {
        console.log(ky,"nothing")
        continue;
    }
    if ( obj.extensions && Array.isArray(obj.extensions) ) {
        ext_view[ky] = obj
    }
}

let rev_map = {}
for ( let [ky,obj] of Object.entries(ext_view) ) {
    for ( let ext of obj.extensions ) {
        if ( rev_map[ext] !== undefined ) {
            //console.log(ky,ext,rev_map[ext])
        }
        rev_map[ext] = ky
    }
}

let kys = Object.keys(rev_map)
kys.sort()

let rev_map_final = {}
for ( let ky of kys ) {
    rev_map_final[ky] = rev_map[ky]
}
 
let output = JSON.stringify(rev_map_final)
console.log(output)