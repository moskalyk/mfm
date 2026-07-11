// 
const VFAASNet = require('./vendor/vfaas.net/')
const Toss = require('./vendor/toss/')
const Bas = require('./vendor/bas/')
const MFM = require('./index')

const { open, writeFile } = require('node:fs/promises');

const mfm = new MFM()
const tss = new Toss('/data-ws')
const vfaas = new VFAASNet({protocol: 'ws', host: '0.0.0.0', port: '8080'})
let signers = 0
let bas = []
let recovery = null
let passwordMine = 'passwordMine'
const enc = new TextEncoder()

const node1 = async (datum) => {
    signers++
    bas.push(JSON.parse(datum.msg).bas)
    if(signers == 2 && !decRecovery){
        console.log('compute')
        const pass1 = await Bas.decrypt(bas[0], [passwordMine], 0.5)
        const pass2 = await Bas.decrypt(bas[1], [passwordMine], 0.5)
        const basMergedPw = await Bas.encrypt('message', [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)],1)
        const basDecrypted = await Bas.decrypt(basMergedPw, [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)])

        vfaas.webSocket.send('recv', JSON.stringify({bas: basMergedPw, status: 904}))

    } else if(signers == 2){
        console.log(datum)
        const toRecover = JSON.parse(datum.msg).bas
        const pass1 = await Bas.decrypt(bas[0], [passwordMine], 0.5)
        const pass2 = await Bas.decrypt(bas[1], [passwordMine], 0.5)
        
        const arr = [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)]
        const basDecrypted = await Bas.decrypt(recovery, arr)
        vfaas.webSocket.send('recvDec', JSON.stringify({message: basDecrypted.trim().replace(/\x00/g,'')}))
    }
}

const node2 = async (datum) => {
    signers++
    bas.push(JSON.parse(datum.msg).bas)

    if(signers == 2 && !decRecovery){
        console.log('compute')
        const pass1 = await Bas.decrypt(bas[0], [passwordMine], 0.5)
        const pass2 = await Bas.decrypt(bas[1], [passwordMine], 0.5)
        const basMergedPw = await Bas.encrypt('message', [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)],1)
        const basDecrypted = await Bas.decrypt(basMergedPw, [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)])

        vfaas.webSocket.send('recv', JSON.stringify({bas: basMergedPw, status: 904}))
        
    } else if(signers == 2){
        console.log(datum)
        const toRecover = JSON.parse(datum.msg).bas
        const pass1 = await Bas.decrypt(bas[0], [passwordMine], 0.5)
        const pass2 = await Bas.decrypt(bas[1], [passwordMine], 0.5)
        
        const arr = [enc.encode(pass1).filter(e => e != 0), enc.encode(pass2).filter(e => e != 0), enc.encode(passwordMine)]
        const basDecrypted = await Bas.decrypt(recovery, arr)
        vfaas.webSocket.send('recvDec', JSON.stringify({message: basDecrypted.trim().replace(/\x00/g,'')}))
    }
}

const tx = () => {
    vfaas.webSocket.send('sign', JSON.stringify({ password: passwordMine, status: 52}))
}

let decRecovery = false

const dec = async (datum) => {
    recovery = JSON.parse(datum.msg).bas
    decRecovery = true
    decRecovery && vfaas.webSocket.send('sign', JSON.stringify({ password: passwordMine, status: 52}))
}

vfaas.aPath(node1)
vfaas.aPath(node2)
vfaas.aPath(tx)
vfaas.aPath(dec)

vfaas.aBoot(() => {
    console.log('listening')
    setInterval(() => {
        signers = 0
    },100)
})
