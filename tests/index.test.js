const MFM = require('../index');

(async () => {
    const mfm = new MFM()
    await mfm.write('/tests/example_files/code.js', '/tests/output/message.mfm')  
    const dataCode = await mfm.read('/tests/output/message.mfm')
    console.log(JSON.stringify(dataCode.code))
})()
