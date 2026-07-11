const argv = process.argv
const MFM = require('.')
// 
const VFAASNet = require('./vendor/vfaas.net/')
const Toss = require('./vendor/toss/')
const Bas = require('./vendor/bas/')

const { open, writeFile } = require('node:fs/promises');

const tss = new Toss('/data-ws')
const vfaas = new VFAASNet({protocol: 'ws', host: '0.0.0.0', port: '8080'})


vfaas.aBoot(() => {

    console.log('listening')
})

const mfm = new MFM()

const shelf = Object.freeze({
    DEC: 10, //
    LMDA: 30, // 
    DIA: 200
});

(async () => {
    if(!argv[2]){
        
    console.log('  :|  :O  :|  ')
    console.log(`mfm (mixed folder messages)`)
    console.log('')
    console.log('usage: node mfm [command]')
    console.log('')
    console.log('commands:')
    console.log(' read \t\treading a .mfm file')
    console.log(' write \t\twriting a .mfm file')
    console.log(' balance \tyour balance')
    console.log(' shelf \t\ttx options for name bundles')
    console.log(' tx \t\tmake a purchase')
    console.log(' list \t\tlist receipts')
    console.log(' procure \tuse receipt for a new name')
    console.log(' who\t\tsee name ownership')
    console.log(' offer \t\tplace offer in a mailbox')
    console.log(' attest\t\trequest a claim on your name')
    console.log(' certify\texport a PDF certificate')
    console.log(' cnc\t\tconstructing name operations')
    console.log(' mailbox\toffer or attestation msgs')
    console.log()
        
    } 
    if(argv[2]){
        console.log('  :|  :O  :|  ')
        console.log(`mfm (mixed folder messages)`)
        console.log('')
        console.log(`command: ${argv[2]}`)
    }
    

    let ran = false
    switch(argv[2]){
        case 'read': {
            const dataCode = await mfm.read(argv[3])
            console.log(dataCode)
            ran = true;
        }
        break;
        case 'write': {
            await mfm.write(argv[3], argv[4])
            console.log('sucessfully written')
            ran = true;
        }
        break;
        case 'shelf': {
            Object.entries(shelf).map(([s, v]) => console.log(`   bundle ${s}\tchars ${v}`))
            ran = true;
        }
        break;
        case 'balance': {
            
            if(argv[3] == '+'){
                console.log(argv[4])
            }
            ran = true;
        }
        break;
        case 'tx': {
            
            console.log(argv[3])
            console.log(argv[4])
            
            // store receipt on usb
            // receipt has to be unchangeable, by 1 person, signed by multiple people

            const recv = async (datum) => {
                await writeFile(__dirname + '/state_bas.js', JSON.stringify(`const state = {state: [${JSON.parse(datum.msg).bas}]}; module.exports = state;`).replaceAll('"',''))
                await mfm.write("/state_bas.js", "/state_bas.mfm")
            }
            vfaas.aPath(recv)
            
            const recvDec = async (datum) => {
                console.log('fully decrypted')
                console.log(JSON.parse(datum.msg))
            }
            vfaas.aPath(recvDec)
            
            vfaas.webSocket.send('tx', JSON.stringify({msg: argv[3], password: 'passwordMine', status: 904}))
            
            setTimeout(async () => {
                const state = await mfm.read("/state_bas.mfm")
                vfaas.webSocket.send('dec', JSON.stringify({msg: 'bas', bas: state.state.state, status: 904}))
            }, 1000)

            // send fetch to vfaas for balance
            
            ran = true;
        }
        break;
        case 'list': {
            // pull from vfaas
            
            // get char count from public key
            
            ran = false;
        }
        break;
        case 'procure': {
            // check availability of name
            // update receipts with name char decr    
            
            // update chain of approver to other passwords + my password
            ran = false;
        }
        break;
        case 'who': {
            // fetch vfaas get owner public key, date and time
            ran = false;
        }
        break;
    }
    
    !ran &&argv[2] != undefined && console.log(`TODO: ${argv[2]}`)
    
})()
