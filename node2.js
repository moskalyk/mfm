// 
const VFAASNet = require('./vendor/vfaas.net/')
const Toss = require('./vendor/toss/')
const Bas = require('./vendor/bas/')
const MFM = require('./index')

const { open, writeFile } = require('node:fs/promises');

const mfm = new MFM()
const tss = new Toss('/data-ws')
const vfaas = new VFAASNet({protocol: 'ws', host: '0.0.0.0', port: '8080'})

const sign = async (datum) => {
    const password2 = '234'
    const bas = await Bas.encrypt(password2, [JSON.parse(datum.msg).password], 0.5)
    console.log('password bas')
    console.log(bas)
    vfaas.webSocket.send('node1', JSON.stringify({msg: 'sending msg', bas: bas, status: 27}))
}

vfaas.aPath(sign)

vfaas.aBoot(() => {
    console.log('listening')
})
