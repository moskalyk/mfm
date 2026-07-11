const { open, writeFile } = require('node:fs/promises');
const { Buffer } = require('node:buffer');

class MFM {
    constructor() {
        
    }
    
    async read(srcFile){
        return new Promise(async (res) => {

            const fdr = await open(__dirname + srcFile, 'r');
            const readStream = fdr.createReadStream(srcFile)
            
            let data = '';
            
            readStream.on('data', function (chunk) {
                data += chunk
            });
            
            let mfmData = ''
            
            readStream.on('end', () => {
                const dataSize = data.slice(0,4)
                const lenOfHex = parseInt(Buffer.from(dataSize).toString(), 16)
                const size = data.slice(lenOfHex+1,lenOfHex+2)
                const decSize = parseInt(Buffer.from(size).toString(), 16)*2
                const fun = eval(`${Buffer.from(data.slice(4,7+lenOfHex - 2), 'hex').toString('utf-8')} {${Buffer.from(data.slice(lenOfHex+6,lenOfHex+decSize+8), 'hex').toString('utf-8')}:${Buffer.from(data.slice(lenOfHex+6,lenOfHex+decSize+8), 'hex').toString('utf-8')}}; `)
                const obj = {}
                typeof fun == 'object' ? obj.state = fun : obj.compute = fun
                
                res({
                    ...obj,
                    code: JSON.stringify(Buffer.from(data.slice(4,7+lenOfHex - 2), 'hex').toString('utf-8'))
                })
            })
        })
    }
    
    async write(srcFile, dstFile){
        return new Promise(async (res) => {
            const fdr = await open(__dirname + srcFile, 'r');
            const fdw = await open(__dirname + dstFile, 'w');
            
            const readStream = fdr.createReadStream(srcFile)
            const writeStream = fdw.createWriteStream(dstFile);

            let data = '';
            
            readStream.on('data', function (chunk) {
                data += chunk
            });
            
            let mfmData = ''
            
            readStream.on('end', async () => {
                const buffer = new Buffer.from(data)
                const bufHex = buffer.toString('hex')
                mfmData = Buffer.byteLength(bufHex).toString(16)
                while(mfmData.length < 4){
                    mfmData = '0' + mfmData
                }
                const req = require(__dirname + srcFile)
                const strData = JSON.stringify(data)
                const bufferFuncs = new Buffer.from(Object.keys(req).join(','))
                const bufferFuncsHex = bufferFuncs.toString('hex')
                let mfmFuncData = Buffer.byteLength(bufferFuncs).toString(16)
                while(mfmFuncData.length < 2){
                    mfmFuncData = '0' + mfmFuncData
                }
                writeStream.write(mfmData + bufHex + mfmFuncData + bufferFuncsHex, () => {
                    res()
                })
            })
        })
    }
};

module.exports = MFM
