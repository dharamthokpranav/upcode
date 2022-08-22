var fd = require('../utils/FreshDeskBridge');


var Freshdesk = new fd(process.env.FRESHDESKDOMAIN, process.env.FRESHDESKID);


const axios = require('axios').default;

exports.listTickets = (req, res) => {
    Freshdesk.listTickets(function(err, res, body){
        if (err)
    {
            console.group(err);
        }
        if (res)
        {
            console.group(res);
        }
        console.log("Here are the tickets", body);
    })
};

exports.ticketFields = (req, res) => {
    Freshdesk.ticketFields(function(err, res, body){
        if(err){
            console.log(err);
        };
        if(res.statusCode === 200){
            console.log("Those are the required ticket fields :\n" + body);
        };
    });
};

exports.createTickets = async (TicketData) => {
    
    await Freshdesk.createTicket(TicketData,async function (err, res) {
        if (err) {
            console.log(err);
        }
        else if (res) {
            console.log("Ticket created : " +res.data.created_at);
            return res;
        };
    });
                           
                
// axios.post('https://pinkypromise.freshdesk.com/api/v2/tickets', newTicket,{ headers: {"Authorization" :"Basic YnhnNU00SDdXMkNDbUVVd2hVZmU6WA==", 'Content-Type': 'application/json' }})
//   .then(function (response) {
//         console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
};
