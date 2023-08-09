#!/usr/bin/env node

// data server under ....<app name>
// viewing data server
//
const fs = require('fs')
const path = require('path')
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

    let mime_type = "text/html"

    let fname_syntax = path.parse(file)
    let fname = fname_syntax.name
    let ext = fname_syntax.ext
    if ( ext.length > 0 ) {
        ext = ext.substring(1)
        mime_type = ext_to_mimetype(ext)
    } else {
        ext = ""
        mime_type = "text/plain"
    }

    return [mime_type,fname,ext]
}


function mime_type_from_dir_or_ext(asset_dir,file) {

    let [mime_type,fname,ext] = mime_type_from_ext(file)

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
        case "assets" :
        case "test" : 
        default: {
            break
        }
    }

    return [mime_type,fname,ext]
}


// ---- ---- ---- ---- HTML APPLICATION PATHWAYS  ---- ---- ---- ---- ---- ---- ----

app.get('/',async (req, res) => {
    try {
        const fpath = './index.html'
        let check = fs.statSync(fpath)
        if ( check.isFile() ) {
            const stream = fs.createReadStream(fpath)
            send(res,200,stream,{ 'Content-Type': mime_type })     
        } else {
            send(res,404,"what")
        }
        send(res,200,stream,{ 'Content-Type': 'text/html' })
    } catch (e) {
        console.log(process.cwd(),'no ./index.html')
        send(res,404,"what")
    }
})


app.get('/:file',async (req, res) => {
    let file = req.params.file
    try {
        let [mime_type,fname,ext] = mime_type_from_ext(file)
        const fpath = `./${fname}.${ext}`
        let check = fs.statSync(fpath)
        if ( check.isFile() ) {
            const stream = fs.createReadStream(fpath)
            send(res,200,stream,{ 'Content-Type': mime_type })     
        } else {
            send(res,404,"what")
        }
    } catch (e) {
        send(res,404,"what")    
    }
})



app.get('/:assets/:file',async (req, res) => {
    let asset_dir = req.params.assets
    let file = req.params.file
    try {
        //        console.log(asset_dir,file)
        let [mime_type,fname,ext] = mime_type_from_dir_or_ext(asset_dir,file)
        let fpath = `./${asset_dir}/${fname}.${ext}`
        let check = fs.statSync(fpath)
        if ( check.isFile() ) {
            const stream = fs.createReadStream(fpath)
            send(res,200,stream,{ 'Content-Type': mime_type })     
        } else {
            send(res,404,"what")
        }
    } catch (e) {
        console.log(e)
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
