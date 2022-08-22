const axios = require('axios').default;

class PathologyBridge {
    var 
    constructor(url){
        this.url=url;
    }
    // URL - http://106.51.127.97/iCRM_API/api/MHL/GetUserAuthenticationID
    // URL - http://106.51.127.97/iCRM_API/api/MHL/Get_Circle_Location_Using_Pincode
    // URL - http://106.51.127.97/iCRM_API/api/MHL/Get_Phlebo_Available_Location_Decrypt
    // URL - http://106.51.127.97/iCRM_API/api/MHL/GetAvailability_Phelobo
    // URL - http://106.51.127.97/iCRM_API/api/MHL/New_SaveRegistration
    // URL - http://106.51.127.97/iCRM_API/api/MHL/CancelSchedule
    // URL - http://106.51.127.97/iCRM_API/api/MHL/SaveReschedule

    async authinticate(data, cb) {
        console.log( this.url + '/GetUserAuthenticationID')
        cb("","reached cb")
        // await axios.post(METROPOLISAPI + '/GetUserAuthenticationID', data)
        //    .then(function (response) {
        //        cb("",response);
        //    })
        //    .catch(function (error) {
        //        cb(error,"");
        //    });
    };

    async availableSlotByLocation(data, cb) {
        // await axios.post(METROPOLISAPI + '/Get_Phlebo_Available_Location_Decrypt', data)
        //    .then(function (response) {
        //        cb("",response);
        //    })
        //    .catch(function (error) {
        //        cb(error,"");
        //    });
    };

    async blockTheSlot(data, cb) {
        // await axios.post(METROPOLISAPI + '/GetAvailability_Phelobo', data)
        //    .then(function (response) {
        //        cb("",response);
        //    })
        //    .catch(function (error) {
        //        cb(error,"");
        //    });
    };

    async bookPatientRegistration(data, cb) {
        // await axios.post(METROPOLISAPI + '/New_SaveRegistration', data)
        //    .then(function (response) {
        //        cb("",resp 
    };

    async scheduleCancellation(data, cb) {
        // await axios.post(METROPOLISAPI + '/CancelSchedule', data)
        //    .then(function (response) {
        //        cb("",response);
        //    })
        //    .catch(function (error) {
        //        cb(error,"");
        //    });
    };

    async rescheduleBooking(data, cb) {
        // await axios.post(METROPOLISAPI + '/SaveReschedule', data)
        //    .then(function (response) {
        //        cb("",response);
        //    })
        //    .catch(function (error) {
        //        cb(error,"    ");
        //    });
    };
}

module.exports= PathologyBridge;