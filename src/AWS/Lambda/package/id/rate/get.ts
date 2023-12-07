Object.defineProperty(exports, "__esModule", ({ value: true }));
const { DynamoDBClient, GetItemCommand } = __nccwpck_require__(23363);
const AWS_REGION = "us-east-2";
const DB = new DynamoDBClient({ region: AWS_REGION });
const handler = async (event) => {
    //console.log("event", event);
    const path = event.path;
    const pathSegments = path.split('/');
    const itemID = event.id; // Adjust according to your path structure
    console.log("itemID", itemID);
    
   
    
    const itemParams = {
        TableName: "Packages",
        Key: {
            "id": { S: event.id }
        }
    };
    
    try {
        const result = await DB.send(new GetItemCommand(itemParams));
        console.log("Query Result: ", result);
        
        if (result.Item) {
            //console.log(" I   T    E    M   ", result.Item.Score)
            // Assuming the result looks as described, create a response
            const scores = {};
            for (const key in result.Item.M) {
                if (result.Item.M.hasOwnProperty(key)) {
                    console.log(result.Item.M[key].S);
                    scores[key] = result.Item.M[key].S;
                }
            }
            console.log(scores)
            return {
                statusCode: 200,
                body: JSON.stringify(scores),
            };
        }
        else {
            // Item not found
            console.log("Item not found for ID:", itemID);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'ID not found' }),
            };
        }
    }
    catch (error) {
        console.error("Error during database query:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
module.exports = { handler }; // Export the handler