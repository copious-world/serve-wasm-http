#!/usr/bin/env node

// data server under ....<app name>
// viewing data server
//
const fs = require('fs')
const polka = require('polka')
const send = require('@polka/send-type');
//
const { json } = require('body-parser');
const cors = require('cors');
const serve = require('serve-static')('public');
const compress = require('compression')();


//
const app = polka()
let app_cors = cors((req, callback) => {
    let corsOptions = { origin: true };             // req.header('Origin')
    callback(null, corsOptions) // callback expects two parameters: error and options
})


app.use(app_cors, compress, json(), serve)


let ext_db = JSON.parse(fs.readFileSync(`${__dirname}/../assets/rev_db.json`))


// ---- ---- ---- ---- MIME TYPE   ---- ---- ---- ---- ---- ---- ----

//

function ext_to_mimetype(ext) {
    return ext_db[ext]
}

function mime_type_from_ext(file) {
    let ext = "html"
    let mime_type = "text/html"

    let tmp_ext_pos = file.lastIndexOf('.')
    if ( tmp_ext_pos > 0 ) {
        ext = file.substring(tmp_ext_pos+1)
        mime_type = ext_to_mimetype(ext)
    } else {
        ext = ""
        mime_type = "text/plain"
    }

    return [mime_type,ext]
}


function mime_type_from_dir_or_ext(asset_dir,file) {

    let ext = "html"
    let mime_type = "text/html"

    switch ( asset_dir ) {
        case "js" : {
            ext = 'js'
            mime_type = ext_to_mimetype(ext)
            break;
        }
        case "modules" : {
            ext = 'mjs'
            mime_type = ext_to_mimetype(ext)
            break;
        }
        case "wasm" : {
            ext = 'wasm'
            mime_type = 'application/wasm'
            break;
        }
        case "assets" : {
            return mime_type_from_ext(file)
        }
        case "test" : {
            return mime_type_from_ext(file)
        }
        default: {
            return mime_type_from_ext(file)
        }
    }

    return [mime_type,ext]
}


// ---- ---- ---- ---- HTML APPLICATION PATHWAYS  ---- ---- ---- ---- ---- ---- ----

app.get('/',(req, res) => {
    try {
        const stream = fs.createReadStream('./index.html')
        send(res,200,stream,{ 'Content-Type': 'text/html' })
    } catch (e) {
        send(res,404,"what")    
    }
})


app.get('/:file',(req, res) => {
    let file = req.params.file
    try {
        let [mime_type,ext] = mime_type_from_ext(file)
        if ( ext.length ) {
            const stream = fs.createReadStream(`./${file}.${ext}`)
            send(res,200,stream,{ 'Content-Type': mime_type })    
        } else {
            const stream = fs.createReadStream(`./${file}`)
            send(res,200,stream,{ 'Content-Type': mime_type })
        }
    } catch (e) {
        send(res,404,"what")    
    }
})



app.get('/:assets/:file',(req, res) => {
    let asset_dir = req.params.assets
    let file = req.params.file
    try {
        let [mime_type,ext] = mime_type_from_dir_or_ext(asset_dir,file)
        const stream = fs.createReadStream(`./${asset_dir}/${file}.${ext}`)
        send(res,200,stream,{ 'Content-Type': mime_type })
    } catch (e) {
        send(res,404,"what")    
    }
})



const g_port = '8080'
//
const start = async () => {
    try {
        console.log(`counter admin :: listening on port: ${g_port}`)
        await app.listen(g_port)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- RUN  ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// // // 

start()
//
