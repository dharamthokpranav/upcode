var PathologyBridge = require('../utils/PathologyBridge');

var patho = new PathologyBridge(process.env.METROPOLISAPI);



exports.authinticate = (req, res) => {
    let data = {};
    patho.authinticate(data, (err, res) => {
        if (err) {
            console.log(err);
        } else if (res) {
            console.log(res);
        }
    })
};

exports.FindAvailableSlotByLocation = (req, res) => {
    let data = {};
    patho.availableSlotByLocation(data, (err, res) => {
        if (err) {
            console.log(err);
        } else if (res) {
            console.log(res);
        }
    })
};
 