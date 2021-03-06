const admin = require('firebase-admin');
const Http_response = require("../../utils/http-response");

module.exports = {
    getAllUsers,
    getOneUserById,
    createNewUser,
    updateUserById,
    deleteUserById
};

async function getAllUsers(req, res, db) {
    const data = db.collection('users');
    let response = [];

    await data.get().then(querySnapshot => {
        let docs = querySnapshot.docs;
        for (let doc of docs) {
            response.push(doc.data());
        }
    });

    return res.status(200).send(response);
}

async function getOneUserById(req, res, db) {
    const document = db.collection('users').doc(req.params.userId);
    let response = (await document.get()).data();

    if(!response){
        Http_response.HTTP_404(req, res, '', 'User')
    }

    return res.status(200).send(response);
}

async function createNewUser(req, res, db) {
    await admin.auth().createUser({
        email: req.body.email,
        emailVerified: false,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        displayName: req.body.firstname + " " + req.body.lastname,
        photoURL: req.body.avatar,
        disabled: false,
    })
        .then(async function(userRecord) {
            await db.collection('users').doc(userRecord.uid)
                .set({
                    id: userRecord.uid,
                    delete_profile: false,
                    created_at: new Date(userRecord.metadata.creationTime),
                    last_login: new Date(userRecord.metadata.creationTime),
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    phone: req.body.phoneNumber ? req.body.phoneNumber : "",
                    avatar: req.body.avatar ? req.body.avatar : "",
                    rank: req.body.rank ? req.body.rank : "trader",
                    private_profile: false,
                }).then(async result =>{
                    const document = db.collection('users').doc(userRecord.uid);
                    let response = (await document.get()).data();

                    if(!response){
                        Http_response.HTTP_404(req, res, '', 'User')
                    }

                    return res.status(201).send(response);
                }).catch(e => {
                    return {code: e.code, message: e.message};
                });
        })
        .catch(function(error) {
            return res.status(409).send({code: error.code, message: error.message, detail: 'Error creating new user : ' + error.message});
        })
}

async function updateUserById(req, res, db) {
    const document = db.collection('users').doc(req.params.userId);
    let data = (await document.get()).data();

    if(!data){
        Http_response.HTTP_404(req, res, '', 'User')
    }

    let response = {
        delete_profile: req.body.delete_profile ? req.body.delete_profile : data.delete_profile,
        email: req.body.email ? req.body.email : data.email,
        firstname: req.body.firstname ? req.body.firstname : data.firstname,
        lastname: req.body.lastname ? req.body.lastname : data.lastname,
        username: req.body.username ? req.body.username : data.username,
        phone: req.body.phoneNumber ? req.body.phoneNumber : data.phone,
        avatar: req.body.avatar ? req.body.avatar : data.avatar,
        rank: req.body.rank ? req.body.rank : data.rank,
        private_profile: req.body.private_profile ? req.body.private_profile : data.private_profile,
        updated_at: new Date(Date.now())
    }

    await admin.auth().updateUser( req.params.userId, {
        email: req.body.email ? req.body.email : data.email
    })
        .then(async userRecord => {
            await document.update(response)
                .then(result => {
                    return res.status(200).send(response);
                })
                .catch(e => {
                    return res.status(500).json({
                        "code": 500,
                        "message": "Internal server error",
                        "reason": "An unknown error was occurred",
                        "details": e.message
                    });
                })
        })
        .catch(error => {
            Http_response.HTTP_500(req, res, '', error)
        })
}

async function deleteUserById(req, res, db) {
    const document = db.collection('users').doc(req.params.userId);
    await document.delete()
        .then(result => {
            return res.status(200).send('The offer was deleted with success !');
        })
        .catch(error => {
            Http_response.HTTP_500(req, res, '', error)
        })
}
